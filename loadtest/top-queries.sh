#!/usr/bin/env bash
# MySQL 이 실제로 시간을 가장 많이 쓴 쿼리 순위 (performance_schema 의 쿼리 모양별 집계)
#   reset-db.sh 가 집계를 비운 뒤부터 쌓인 값이다. 부하 테스트 직후에 실행한다.
#   사용: loadtest/top-queries.sh [개수=15]
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
LIMIT="${1:-15}"
docker exec m2m-mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" --table -e "
SELECT
  LEFT(REGEXP_REPLACE(DIGEST_TEXT, '\\\\s+', ' '), 110)        AS query,
  COUNT_STAR                                                 AS calls,
  ROUND(SUM_TIMER_WAIT / 1e12, 2)                            AS total_s,
  ROUND(AVG_TIMER_WAIT / 1e9, 2)                             AS avg_ms,
  ROUND(SUM_LOCK_TIME / 1e12, 2)                             AS lock_s,
  ROUND(SUM_ROWS_EXAMINED / COUNT_STAR)                      AS rows_examined_avg,
  SUM_NO_INDEX_USED                                          AS no_index,
  SUM_SORT_ROWS                                              AS sort_rows
FROM performance_schema.events_statements_summary_by_digest
WHERE SCHEMA_NAME = 'meat_to_meat'
ORDER BY SUM_TIMER_WAIT DESC
LIMIT ${LIMIT};" 2>/dev/null
