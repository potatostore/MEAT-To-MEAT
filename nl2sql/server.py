"""NL2SQL API 서버 (FastAPI)

POST /ask   {"question": "VIP 회원 보여줘", "mode": "rich"}
         →  {"question", "mode", "sql", "columns", "rows", "error"}
GET  /health

실행: uvicorn server:app --host 0.0.0.0 --port 8000
이 서버는 다른 회원의 데이터까지 조회할 수 있는 관리자용 기능이다. 외부에 공개하지 말 것.
"""
from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel, Field

from db import connect, run_sql
from llm import extract_sql, make_llm
from prompts import build_prompt

app = FastAPI(title="meat-to-meat NL2SQL")
_llm = None


def llm():
    global _llm
    if _llm is None:
        _llm = make_llm()
    return _llm[0]


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=300)
    mode: Literal["simple", "rich"] = "rich"


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ask")
def ask(req: AskRequest):
    res = {"question": req.question, "mode": req.mode, "sql": None, "columns": [], "rows": [], "error": None}
    try:
        res["sql"] = extract_sql(llm()(build_prompt(req.mode), req.question))
    except Exception as e:
        res["error"] = f"LLM 호출 실패: {e}"
        return res
    try:
        con = connect()
    except Exception as e:
        res["error"] = f"DB 접속 실패: {type(e).__name__}: {e}"
        return res
    try:
        res["columns"], res["rows"] = run_sql(con, res["sql"])
    except Exception as e:
        res["error"] = f"실행 오류: {e}"
    finally:
        con.close()
    return res
