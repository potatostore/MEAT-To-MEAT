"""Grafana 대시보드 JSON 생성기.

패널을 고치고 싶으면 이 파일을 수정한 뒤 아래 명령으로 다시 생성한다.
    python3 monitoring/grafana/generate_dashboard.py
Grafana UI 에서 직접 고쳐도 되지만, 그 경우 JSON 을 내보내(Export) 이 폴더에 저장해야 팀원과 공유된다.
"""
import json
from pathlib import Path

APP = 'application="meat-to-meat-backend"'
API = APP + ', uri!~"/actuator.*"'
PROM = {"type": "prometheus", "uid": "prometheus"}
LOKI = {"type": "loki", "uid": "loki"}

panels = []
y = 0


def row(title):
    global y
    panels.append({"type": "row", "title": title, "collapsed": False,
                   "gridPos": {"h": 1, "w": 24, "x": 0, "y": y}})
    y += 1


def ts(title, targets, x, w=12, h=8, unit="short", description=""):
    panels.append({
        "type": "timeseries", "title": title, "description": description, "datasource": PROM,
        "gridPos": {"h": h, "w": w, "x": x, "y": y},
        "fieldConfig": {"defaults": {"unit": unit, "custom": {"lineWidth": 2, "fillOpacity": 8}}, "overrides": []},
        "options": {"legend": {"displayMode": "table", "placement": "bottom", "calcs": ["mean", "max"]},
                    "tooltip": {"mode": "multi"}},
        "targets": [{"datasource": PROM, "expr": e, "legendFormat": l, "refId": chr(65 + i)}
                    for i, (e, l) in enumerate(targets)],
    })


def logs(title, expr, x, w=12, h=10, description=""):
    panels.append({
        "type": "logs", "title": title, "description": description, "datasource": LOKI,
        "gridPos": {"h": h, "w": w, "x": x, "y": y},
        "options": {"showTime": True, "wrapLogMessage": True, "sortOrder": "Descending"},
        "targets": [{"datasource": LOKI, "expr": expr, "refId": "A"}],
    })


row("API (백엔드)")
ts("초당 요청 수 (API별)",
   [(f'sum by (method, uri) (rate(http_server_requests_seconds_count{{{API}}}[1m]))', "{{method}} {{uri}}")],
   0, w=8, unit="reqps", description="API별 초당 처리 요청 수(RPS)")
ts("p95 응답 시간 (API별)",
   [(f'histogram_quantile(0.95, sum by (le, method, uri) (rate(http_server_requests_seconds_bucket{{{API}}}[1m])))',
     "{{method}} {{uri}}")],
   8, w=8, unit="s", description="요청 100건 중 95번째로 느린 응답 시간. 평균보다 체감 성능을 잘 보여준다")
ts("에러 응답 (상태 코드별)",
   [(f'sum by (status) (rate(http_server_requests_seconds_count{{{API}, status=~"4..|5.."}}[1m]))', "{{status}}")],
   16, w=8, unit="reqps", description="4xx(요청 오류, 재고 부족 등)와 5xx(서버 오류)")
y += 8

row("DB (커넥션 풀 · SQL)")
ts("HikariCP 커넥션 풀",
   [(f'hikaricp_connections_active{{{APP}}}', "사용 중"),
    (f'hikaricp_connections_idle{{{APP}}}', "대기(idle)"),
    (f'hikaricp_connections_pending{{{APP}}}', "커넥션을 기다리는 요청"),
    (f'hikaricp_connections_max{{{APP}}}', "최대")],
   0, w=8, description="'커넥션을 기다리는 요청'이 0보다 크면 DB 커넥션이 부족한 상태")
ts("초당 SQL 실행 수",
   [(f'sum(rate(hibernate_statements_total{{{APP}, status="prepared"}}[1m]))', "SQL/s")],
   8, w=8, unit="short", description="Hibernate 가 DB 로 보낸 SQL 문 수(초당)")
ts("요청 1건당 SQL 수 (N+1 지표)",
   [(f'sum(rate(hibernate_statements_total{{{APP}, status="prepared"}}[1m])) / '
     f'sum(rate(http_server_requests_seconds_count{{{API}}}[1m]))', "SQL / 요청")],
   16, w=8, unit="short", description="API 하나를 처리하는 데 평균 몇 개의 SQL 이 나가는지. N+1 문제가 있으면 크게 올라간다")
y += 8

row("서버 (JVM)")
ts("JVM 힙 메모리",
   [(f'sum(jvm_memory_used_bytes{{{APP}, area="heap"}})', "사용"),
    (f'sum(jvm_memory_max_bytes{{{APP}, area="heap"}})', "최대")],
   0, unit="bytes")
ts("CPU 사용률",
   [(f'process_cpu_usage{{{APP}}}', "백엔드 프로세스"), (f'system_cpu_usage{{{APP}}}', "컨테이너 전체")],
   12, unit="percentunit")
y += 8

row("부하 테스트 (k6)")
ts("가상 사용자(VU) 수", [("k6_vus", "VU")], 0, w=8)
ts("k6 초당 요청 수", [("sum(rate(k6_http_reqs_total[1m]))", "req/s")], 8, w=8, unit="reqps")
ts("k6 응답 시간",
   [("max by (name) (k6_http_req_duration_p95)", "p95 {{name}}"),
    ("max by (name) (k6_http_req_duration_avg)", "평균 {{name}}")],
   16, w=8, unit="s", description="k6(클라이언트) 쪽에서 잰 응답 시간. 네트워크 왕복까지 포함")
y += 8

row("로그 (Loki)")
logs("백엔드 에러 로그", '{service="backend"} |~ "(?i)(error|exception)"', 0,
     description="docker compose 로 띄운 backend 컨테이너의 ERROR/Exception 로그")
logs("MySQL 슬로우 쿼리", '{job="mysql-slow"}', 12,
     description="long_query_time(0.1초)보다 오래 걸린 쿼리. Query_time, Rows_examined 를 확인한다")
y += 10

dashboard = {
    "uid": "meat-to-meat",
    "title": "고기서고기 - API · DB · 부하 테스트",
    "tags": ["meat-to-meat"],
    "timezone": "browser",
    "schemaVersion": 39,
    "refresh": "10s",
    "time": {"from": "now-30m", "to": "now"},
    "panels": [dict(p, id=i + 1) for i, p in enumerate(panels)],
}

out = Path(__file__).parent / "dashboards" / "meat-to-meat.json"
out.write_text(json.dumps(dashboard, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"wrote {out} ({len(panels)} panels)")
