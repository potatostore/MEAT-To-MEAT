"""평가: 15개 질문 x (simple, rich)를 LLM에 보내고 정답 SQL 결과와 비교한다.

사용법:  python evaluate.py                          (Groq)
         python evaluate.py --provider mock --sleep 0  (API 없이 파이프라인 점검)
결과:    results/<provider>_<시각>.csv          질문별 상세 (보고서 6.3 표)
         results/<provider>_<시각>_summary.csv  레벨 x 방식별 정답률
"""
import argparse
import csv
import os
import time
from collections import defaultdict
from datetime import datetime

from db import compare, connect, run_sql
from llm import extract_sql, make_llm
from prompts import build_prompt, today
from questions import QUESTIONS

CORRECT = ("정답", "정답(열 차이)")
FATAL = ("401", "invalid api key", "invalid_api_key", "404", "not found", "does not exist", "decommissioned")


def preview(cols, rows, n=5):
    if not rows:
        return "(결과 없음)"
    more = f" ... 총 {len(rows)}행" if len(rows) > n else ""
    return f"[{', '.join(cols)}] " + " / ".join(str(tuple(r)) for r in rows[:n]) + more


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--provider", choices=["groq", "gemini", "claude", "mock"])
    ap.add_argument("--model")
    ap.add_argument("--sleep", type=float, default=15.0, help="호출 사이 대기(초). 무료 등급 분당 한도 대비")
    ap.add_argument("--retries", type=int, default=3)
    args = ap.parse_args()

    call, model = make_llm(args.provider, args.model)
    provider = args.provider or os.getenv("NL2SQL_PROVIDER", "groq")
    con = connect()
    os.makedirs("results", exist_ok=True)
    out = f"results/{provider}_{datetime.now():%Y%m%d_%H%M%S}.csv"
    print(f"[{provider}:{model}] 기준일 {today()}  질문 {len(QUESTIONS)}개 x 2방식")

    rows_out, score = [], defaultdict(lambda: [0, 0])
    for item in QUESTIONS:
        ref_cols, ref_rows = run_sql(con, item["ref"])
        for mode in ("simple", "rich"):
            raw, err = "", ""
            for attempt in range(args.retries):
                try:
                    raw = call(build_prompt(mode), item["q"])
                    break
                except Exception as e:
                    err = f"LLM 호출 실패: {type(e).__name__}: {e}"
                    if any(k in str(e).lower() for k in FATAL):
                        raise SystemExit(f"\n[중단] {err}\n→ API 키와 모델 이름(--model)을 확인하세요.")
                    wait = max(args.sleep, 5) * (attempt + 2)
                    print(f"  재시도 {attempt + 1}/{args.retries} ({wait:.0f}초 대기): {str(e)[:100]}")
                    time.sleep(wait)
            gen_sql = extract_sql(raw) if raw else ""

            if not gen_sql:
                verdict, gen_prev = "생성 실패", err or f"응답에 SQL 없음: {raw[:100]}"
            else:
                try:
                    gen_cols, gen_rows = run_sql(con, gen_sql)
                    verdict = compare(ref_rows, gen_rows, item.get("check_order", False))
                    gen_prev = preview(gen_cols, gen_rows)
                except Exception as e:
                    verdict, gen_prev = "실행 오류", str(e)

            score[(item["level"], mode)][0] += verdict in CORRECT
            score[(item["level"], mode)][1] += 1
            rows_out.append({
                "ID": item["id"], "레벨": item["level"], "질문": item["q"], "방식": mode,
                "정답 SQL": " ".join(item["ref"].split()), "생성 SQL": " ".join(gen_sql.split()),
                "정답 결과": preview(ref_cols, ref_rows), "생성 결과": gen_prev,
                "판정": verdict, "오류 유형(직접 작성)": "",
            })
            print(f"{item['id']:<5} {mode:<6} {verdict}")
            time.sleep(args.sleep)

    with open(out, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.DictWriter(f, fieldnames=list(rows_out[0].keys()))
        w.writeheader()
        w.writerows(rows_out)

    summary = out.replace(".csv", "_summary.csv")
    with open(summary, "w", newline="", encoding="utf-8-sig") as f:
        w = csv.writer(f)
        w.writerow(["레벨", "Simple 정답률", "보강 정답률"])
        tot = {"simple": [0, 0], "rich": [0, 0]}
        print(f"\n[{provider}:{model}] 레벨별 정답률")
        for lv in (1, 2, 3):
            s, r = score[(lv, "simple")], score[(lv, "rich")]
            for m, v in (("simple", s), ("rich", r)):
                tot[m][0] += v[0]
                tot[m][1] += v[1]
            w.writerow([f"Level {lv}", f"{s[0]}/{s[1]}", f"{r[0]}/{r[1]}"])
            print(f"  Level {lv}  Simple {s[0]}/{s[1]}  보강 {r[0]}/{r[1]}")
        s, r = tot["simple"], tot["rich"]
        w.writerow(["전체", f"{s[0]}/{s[1]}", f"{r[0]}/{r[1]}"])
        print(f"  전체     Simple {s[0]}/{s[1]}  보강 {r[0]}/{r[1]}")
    print(f"\n저장: {out}\n      {summary}")


if __name__ == "__main__":
    main()
