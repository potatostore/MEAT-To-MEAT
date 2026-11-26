"""NL2SQL API 서버 (FastAPI)

POST /ask   {"question": "VIP 회원 보여줘", "mode": "rich"}
         →  {"question", "mode", "sql", "columns", "rows", "error", "elapsed_ms"}
GET  /me     지금 로그인한 회원이 관리자인지 → {"admin", "loginId", "authRequired"}
GET  /samples 평가용 질문 15개 (화면의 예시 질문 버튼)
GET  /health

관리자 확인 (NL2SQL_ADMIN_LOGIN_IDS)
  - 값이 있으면: 요청의 Authorization: Bearer <JWT>를 백엔드 GET /members/me 로 보내 회원을 확인하고,
    loginId가 목록(쉼표 구분)에 있을 때만 허용한다. 백엔드에 ROLE이 없어서 아이디 목록으로 대신한다.
  - 값이 비어 있으면: 확인하지 않는다 (내 PC에서 curl, evaluate.py로 시험할 때).
  - 백엔드 주소는 NL2SQL_BACKEND_URL (기본 http://localhost:8080)

실행: uvicorn server:app --host 0.0.0.0 --port 8000
이 서버는 다른 회원의 데이터까지 조회할 수 있는 관리자용 기능이다. 외부에 공개하지 말 것.
"""
import json
import os
import time
import urllib.error
import urllib.request
from typing import Literal, Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel, Field

from db import connect, run_sql
from llm import DEFAULT_MODELS, extract_sql, make_llm
from prompts import build_prompt, today
from questions import QUESTIONS

app = FastAPI(title="meat-to-meat NL2SQL")
_llm = None


def llm():
    global _llm
    if _llm is None:
        _llm = make_llm()
    return _llm[0]


def model_name():
    provider = os.getenv("NL2SQL_PROVIDER", "groq")
    return provider, os.getenv("NL2SQL_MODEL") or DEFAULT_MODELS.get(provider, "?")


BACKEND_URL = os.getenv("NL2SQL_BACKEND_URL", "http://localhost:8080").rstrip("/")
ADMIN_IDS = {x.strip() for x in os.getenv("NL2SQL_ADMIN_LOGIN_IDS", "").split(",") if x.strip()}


def current_member(authorization: Optional[str] = Header(default=None)):
    """백엔드에 토큰을 보내 로그인한 회원 정보를 받아 온다. 관리자 확인이 꺼져 있으면 None."""
    if not ADMIN_IDS:
        return None
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(401, "로그인이 필요합니다.")
    req = urllib.request.Request(f"{BACKEND_URL}/members/me",
                                 headers={"Authorization": authorization, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=5) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            raise HTTPException(401, "로그인이 만료되었습니다. 다시 로그인해 주세요.")
        raise HTTPException(502, f"회원 확인 실패 (백엔드 {e.code})")
    except Exception as e:
        raise HTTPException(502, f"백엔드에 연결할 수 없습니다: {type(e).__name__}")


def require_admin(member=Depends(current_member)):
    if member is not None and member.get("loginId") not in ADMIN_IDS:
        raise HTTPException(403, "관리자만 사용할 수 있습니다.")
    return member


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=300)
    mode: Literal["simple", "rich"] = "rich"


def _json(v):
    """Decimal, 날짜 같은 값을 화면에 그대로 보이게 문자열/숫자로 바꾼다."""
    if v is None or isinstance(v, (int, float, str, bool)):
        return v
    from decimal import Decimal
    if isinstance(v, Decimal):
        return int(v) if v == v.to_integral_value() else float(v)
    return str(v)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/samples")
def samples():
    provider, model = model_name()
    return {"today": today().isoformat(), "provider": provider, "model": model,
            "questions": [{"id": q["id"], "level": q["level"], "question": q["q"]} for q in QUESTIONS]}


@app.get("/me")
def me(member=Depends(current_member)):
    if member is None:
        return {"admin": True, "loginId": None, "authRequired": False}
    return {"admin": member.get("loginId") in ADMIN_IDS, "loginId": member.get("loginId"), "authRequired": True}


@app.post("/ask")
def ask(req: AskRequest, _=Depends(require_admin)):
    res = {"question": req.question, "mode": req.mode, "sql": None, "columns": [], "rows": [], "error": None,
           "elapsed_ms": None}
    t0 = time.perf_counter()
    try:
        res["sql"] = extract_sql(llm()(build_prompt(req.mode), req.question))
    except Exception as e:
        res["error"] = f"LLM 호출 실패: {e}"
        res["elapsed_ms"] = round((time.perf_counter() - t0) * 1000)
        return res
    try:
        con = connect()
    except Exception as e:
        res["error"] = f"DB 접속 실패: {type(e).__name__}: {e}"
        return res
    try:
        res["columns"], rows = run_sql(con, res["sql"])
        res["rows"] = [[_json(v) for v in r] for r in rows]
    except Exception as e:
        res["error"] = f"실행 오류: {e}"
    finally:
        con.close()
    res["elapsed_ms"] = round((time.perf_counter() - t0) * 1000)
    return res
