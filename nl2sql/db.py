"""MySQL 안전 실행과 결과 비교.

LLM이 만든 SQL은 nl2sql_reader 계정(SELECT 권한만)으로 실행한다.
그 위에 코드에서도 한 번 더 막는다.
  - SELECT/WITH 조회문 한 개만 허용
  - 데이터·권한을 바꾸는 키워드 차단
  - 비밀번호 해시(user_pw), 전화번호(phone_number)는 SQL에 쓰거나 결과에 나오면 거부
  - 읽기 전용 트랜잭션, 실행 시간 5초 제한, 결과 최대 500행
"""
import os
import re

import pymysql

MAX_ROWS = 500
FORBIDDEN = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|RENAME|GRANT|REVOKE|"
    r"LOCK|UNLOCK|CALL|LOAD|HANDLER|SET|INTO\s+OUTFILE|INTO\s+DUMPFILE)\b", re.I)
SENSITIVE = ("user_pw", "phone_number")


def connect():
    con = pymysql.connect(
        host=os.getenv("NL2SQL_DB_HOST", "localhost"),
        port=int(os.getenv("NL2SQL_DB_PORT", "3306")),
        user=os.getenv("NL2SQL_DB_USER", "nl2sql_reader"),
        password=os.getenv("NL2SQL_DB_PASSWORD", "reader_pw_change_me"),
        database=os.getenv("NL2SQL_DB_NAME", "meat_to_meat"),
        charset="utf8mb4",
        autocommit=True,
    )
    with con.cursor() as cur:
        cur.execute("SET SESSION TRANSACTION READ ONLY")
        try:
            cur.execute("SET SESSION MAX_EXECUTION_TIME = 5000")      # MySQL
        except pymysql.MySQLError:
            cur.execute("SET SESSION max_statement_time = 5")         # MariaDB (로컬 테스트용)
    return con


def check_sql(sql):
    s = sql.strip().rstrip(";").strip()
    if not re.match(r"^(SELECT|WITH)\b", s, re.I):
        raise ValueError("SELECT/WITH 조회문만 실행할 수 있습니다")
    if ";" in s:
        raise ValueError("SQL 문은 하나만 실행할 수 있습니다")
    if FORBIDDEN.search(s):
        raise ValueError("데이터를 바꾸는 키워드가 포함되어 있습니다")
    if any(col in s.lower() for col in SENSITIVE):
        raise ValueError("조회할 수 없는 컬럼(비밀번호, 전화번호)이 포함되어 있습니다")
    return s


def run_sql(con, sql):
    """(컬럼명 목록, 행 목록)을 돌려준다. 막힌 SQL이면 ValueError."""
    s = check_sql(sql)
    with con.cursor() as cur:
        cur.execute(s)
        cols = [d[0] for d in cur.description] if cur.description else []
        if any(c.lower() in SENSITIVE for c in cols):          # SELECT * FROM users 같은 경우
            raise ValueError("결과에 조회할 수 없는 컬럼(비밀번호, 전화번호)이 포함되어 있습니다")
        rows = [list(r) for r in cur.fetchmany(MAX_ROWS)]
    return cols, rows


def _norm(v):
    if v is None:
        return "NULL"
    try:
        return f"{round(float(v), 2):.2f}"          # 정수·소수·Decimal을 같은 형태로
    except (TypeError, ValueError):
        return str(v).strip()


def _norm_rows(rows):
    return [tuple(_norm(v) for v in r) for r in rows]


def compare(ref_rows, gen_rows, check_order=False):
    """정답 결과와 생성 결과를 비교한다.

    정답          : 값이 같음 (check_order가 아니면 행 순서 무시)
    정답(열 차이) : 행 수가 같고 정답의 값이 생성 결과 각 행에 모두 들어 있음 (열이 더 붙은 경우, 사람이 확인)
    결과 불일치   : 실행은 됐지만 값이 다름 → '의도와 다른 결과' 오류 사례
    """
    a, b = _norm_rows(ref_rows), _norm_rows(gen_rows)
    if (a == b) if check_order else (sorted(a) == sorted(b)):
        return "정답"
    if a and len(a) == len(b):
        pool = [list(r) for r in b]
        for ra in a:
            for i, rb in enumerate(pool):
                rest = list(rb)
                if all(v in rest and not rest.remove(v) for v in ra):
                    pool.pop(i)
                    break
            else:
                return "결과 불일치"
        return "정답(열 차이)"
    return "결과 불일치"
