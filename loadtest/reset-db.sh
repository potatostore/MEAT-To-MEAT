#!/usr/bin/env bash
# 성능 측정 전후를 같은 조건으로 만들기 위해 DB 를 매번 같은 상태로 되돌린다.
#   1) MySQL 볼륨 삭제 → 2) 백엔드 기동(Flyway 가 V1 스키마 + V2 목데이터 적용) → 3) 대량 데이터 적재
#   4) performance_schema 쿼리 통계 초기화 → 5) 로그 수집기(Alloy) 재기동
# Prometheus / Loki / Grafana 데이터는 지우지 않는다 (전후 그래프를 같이 봐야 하므로).
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; . ./.env; set +a
COMPOSE="docker compose --profile full --profile monitoring"

echo "[1/5] MySQL 볼륨 초기화"
$COMPOSE stop backend >/dev/null
$COMPOSE rm -sf mysql alloy >/dev/null          # alloy 도 mysql-data 볼륨을 마운트하므로 함께 내린다
docker volume rm meat-to-meat_mysql-data >/dev/null
$COMPOSE up -d mysql >/dev/null
until [ "$(docker inspect -f '{{.State.Health.Status}}' m2m-mysql)" = healthy ]; do sleep 2; done

echo "[2/5] 백엔드 기동 (Flyway V1, V2 적용)"
since=$(date -u +%Y-%m-%dT%H:%M:%SZ)
$COMPOSE up -d backend >/dev/null
until docker logs --since "$since" m2m-backend 2>&1 | grep -q -E "Started .*Application|APPLICATION FAILED"; do sleep 2; done
docker logs --since "$since" m2m-backend 2>&1 | grep -E "Successfully applied|up to date|APPLICATION FAILED" | tail -1

echo "[3/5] 대량 데이터 적재 (db/bench/bulk-data.sql)"
start=$(date +%s)
docker exec -i m2m-mysql mysql --default-character-set=utf8mb4 -uroot -p"$MYSQL_ROOT_PASSWORD" meat_to_meat < db/bench/bulk-data.sql 2>&1 | grep -v -E "Warning|^Table|status" || true
echo "      $(( $(date +%s) - start ))초"
docker exec m2m-mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" meat_to_meat -N -e \
  "SELECT CONCAT('      users=',(SELECT COUNT(*) FROM users),' product=',(SELECT COUNT(*) FROM product),' orders=',(SELECT COUNT(*) FROM orders),' order_item=',(SELECT COUNT(*) FROM order_item),' cart_item=',(SELECT COUNT(*) FROM cart_item))" 2>/dev/null

echo "[4/5] 쿼리 통계 초기화 (performance_schema)"
docker exec m2m-mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e \
  "TRUNCATE TABLE performance_schema.events_statements_summary_by_digest;" 2>/dev/null

echo "[5/5] 로그 수집기 재기동"
$COMPOSE up -d alloy >/dev/null
echo "완료"
