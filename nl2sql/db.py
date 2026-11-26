"""MySQL 안전 실행과 결과 비교.

LLM이 만든 SQL은 nl2sql_reader 계정(SELECT 권한만)으로 실행한다.
그 위에 코드에서도 한 번 더 막는다.
  - SELECT/WITH 조회문 한 개만 허용
  - 데이터·권한을 바꾸는 키워드 차단
  - 비밀번호 해시(user_pw), 전화번호(phone_number)는 SQL에 쓰거나 결과에 나오면 거부
  - 읽기 전용 트랜잭션, 실행 시간 제한 (화면 5초, 평가 30초)
  - 결과 행 수 제한 (화면 500행, 평가는 제한 없음)

화면용 행 제한은 SQL 끝에 LIMIT 501을 붙여 DB가 501행에서 멈추게 한다 (with_limit).
결과는 SSCursor(결과를 한 행씩 받아 오는 커서)로 받는다. 기본 커서는 결과 전체를 메모리에 받은 다음
잘라서, 10만 행짜리 결과면 10만 행을 다 받아 온다. 평가에서는 잘린 결과끼리 비교하면 판정이 틀어지므로
(앞 500행만 같고 뒤가 다른 경우 등) LIMIT 없이 전체를 받아서 비교한다.
"""
import itertools
import os
import re
from collections import Counter

import pymysql
import pymysql.cursors

MAX_ROWS = 500                  # 화면(/ask)에 돌려주는 최대 행 수
TIMEOUT_MS = int(os.getenv("NL2SQL_TIMEOUT_MS", "5000"))
FORBIDDEN = re.compile(
    r"\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|RENAME|GRANT|REVOKE|"
    r"LOCK|UNLOCK|CALL|LOAD|HANDLER|SET|INTO\s+OUTFILE|INTO\s+DUMPFILE)\b", re.I)
SENSITIVE = ("user_pw", "phone_number")


def connect(timeout_ms=None):
    """timeout_ms: 쿼리 하나의 최대 실행 시간. 비우면 NL2SQL_TIMEOUT_MS(기본 5000)."""
    timeout_ms = int(timeout_ms or TIMEOUT_MS)
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
            cur.execute(f"SET SESSION MAX_EXECUTION_TIME = {timeout_ms}")              # MySQL
        except pymysql.MySQLError:
            cur.execute(f"SET SESSION max_statement_time = {timeout_ms / 1000:g}")     # MariaDB (로컬 테스트용)
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


TRAILING_LIMIT = re.compile(r"\bLIMIT\s+(\d+)(?:\s*,\s*(\d+))?(?:\s+OFFSET\s+(\d+))?\s*$", re.I)


def with_limit(sql, n):
    """맨 바깥 쿼리가 n행에서 멈추게 LIMIT을 붙인다. 이미 LIMIT이 있으면 n 이하로만 줄인다.

    SSCursor만 쓰면 메모리에는 안 쌓이지만, 커서를 닫을 때 남은 행을 서버에서 끝까지 받아 버려서
    10만 행 조회는 여전히 10만 행 전송 시간이 든다. LIMIT을 붙이면 DB가 n행에서 멈춘다.
    끝이 ')'인 경우(서브쿼리 안의 LIMIT)는 바깥 LIMIT이 아니므로 새로 붙인다.
    """
    m = TRAILING_LIMIT.search(sql)
    if not m:
        return f"{sql}\nLIMIT {n}"
    if m.group(2):                                   # LIMIT offset, count
        return sql[:m.start()] + f"LIMIT {m.group(1)}, {min(int(m.group(2)), n)}"
    offset = m.group(3)
    return sql[:m.start()] + f"LIMIT {min(int(m.group(1)), n)}" + (f" OFFSET {offset}" if offset else "")


def run_sql(con, sql, max_rows=MAX_ROWS):
    """(컬럼명 목록, 행 목록, 잘림 여부)를 돌려준다. 막힌 SQL이면 ValueError.

    max_rows=None 이면 전체 행을 돌려준다 (평가용).
    화면용은 LIMIT max_rows+1 을 붙여 DB가 거기서 멈추게 하고, 1행 더 왔으면 잘린 것으로 본다.
    """
    s = check_sql(sql)
    if max_rows is not None:
        s = with_limit(s, max_rows + 1)
    with con.cursor(pymysql.cursors.SSCursor) as cur:
        cur.execute(s)
        cols = [d[0] for d in cur.description] if cur.description else []
        if any(c.lower() in SENSITIVE for c in cols):          # SELECT * FROM users 같은 경우
            raise ValueError("결과에 조회할 수 없는 컬럼(비밀번호, 전화번호)이 포함되어 있습니다")
        if max_rows is None:
            return cols, [list(r) for r in cur.fetchall()], False
        rows = [list(r) for r in cur.fetchmany(max_rows + 1)]
    truncated = len(rows) > max_rows
    return cols, rows[:max_rows], truncated


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
    if (a == b) if check_order else (Counter(a) == Counter(b)):
        return "정답"
    if a and len(a) == len(b) and _covers(a, b):
        return "정답(열 차이)"
    return "결과 불일치"


def _covers(a, b, max_tries=2000):
    """b의 열 중 일부를 골라 a와 똑같은 결과를 만들 수 있는지 (생성 SQL이 열을 더 붙인 경우).

    열 단위로 값 묶음이 같은 후보를 먼저 찾고, 후보 조합마다 행 단위로 확인한다.
    행마다 모든 행을 비교하던 방식은 10만 행에서 끝나지 않아서 바꿨다.
    """
    ncol_a, ncol_b = len(a[0]), len(b[0])
    if ncol_a > ncol_b:
        return False
    col_b = [Counter(r[k] for r in b) for k in range(ncol_b)]
    cands = []
    for j in range(ncol_a):
        ca = Counter(r[j] for r in a)
        ks = [k for k in range(ncol_b) if col_b[k] == ca]
        if not ks:
            return False
        cands.append(ks)
    target = Counter(a)
    for pick in itertools.islice(itertools.product(*cands), max_tries):
        if len(set(pick)) == len(pick) and Counter(tuple(r[k] for k in pick) for r in b) == target:
            return True
    return False
