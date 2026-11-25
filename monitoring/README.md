# 모니터링 · 부하 테스트 가이드 (Prometheus + Loki + Grafana + k6)

고기서고기 백엔드에 부하를 걸고(k6), 그동안 서버와 DB가 어떻게 반응하는지(Prometheus, Loki)를
한 화면(Grafana)에서 보기 위한 구성이다. SQL 튜닝 전후를 같은 조건으로 비교하는 데 쓴다.

## 1. 전체 구조

```
                 ┌──────────── 부하 ────────────┐
   k6 ──────────▶│ backend (Spring Boot :8080)  │──▶ MySQL (:3306)
   │             │  /actuator/prometheus        │      │ slow.log
   │             └──────────────┬───────────────┘      │
   │ 결과 push(remote write)     │ 15초마다 수집(scrape)  │
   ▼                            ▼                      │
 Prometheus (:9090) ◀───────────┘                      │
                                                       ▼
 Loki (:3100) ◀──── Alloy (:12345) ◀── 컨테이너 로그 + MySQL 슬로우 쿼리 로그
   │                    │
   └──────┬─────────────┘
          ▼
   Grafana (:3001)  대시보드 "고기서고기 - API · DB · 부하 테스트"
```

| 도구 | 하는 일 | 데이터 종류 |
|---|---|---|
| **Spring Actuator + Micrometer** | 백엔드 안에서 지표를 계산해 `/actuator/prometheus` 로 노출 | 숫자(지표) |
| **Prometheus** | 15초마다 위 주소를 긁어(scrape) 시계열로 저장. k6 결과도 받아서 저장 | 숫자(지표) |
| **Alloy** | Docker 컨테이너 로그와 MySQL 슬로우 쿼리 로그를 읽어 Loki 로 전송 | 글자(로그) |
| **Loki** | 로그 저장소. 라벨(`service="backend"`)로 골라 검색 | 글자(로그) |
| **Grafana** | Prometheus(지표)와 Loki(로그)를 한 대시보드에 시간축으로 맞춰 보여줌 | 화면 |
| **k6** | 가상 사용자(VU) N명이 시나리오(JS)대로 API 를 호출해 부하를 만든다 | 부하 |

**지표(metric)와 로그(log)의 차이**: 지표는 "초당 요청 68건, p95 37ms"처럼 숫자로 추세를 본다.
로그는 "Deadlock found when trying to get lock"처럼 무슨 일이 있었는지 문장으로 본다.
그래프에서 이상한 구간을 찾고(지표) → 그 시간대의 로그로 원인을 확인(로그)하는 식으로 같이 쓴다.

## 2. 의존성과 설정 (어디에 무엇을 넣었나)

### 2-1. 백엔드 `build.gradle`

```gradle
// 지표 엔드포인트(/actuator/*)를 제공
implementation 'org.springframework.boot:spring-boot-starter-actuator'
// 지표를 Prometheus 형식으로 내보내는 레지스트리
runtimeOnly 'io.micrometer:micrometer-registry-prometheus'
// Hibernate 통계(실행된 SQL 수 등)를 Micrometer 지표로 연결 → N+1 측정
implementation 'org.hibernate.orm:hibernate-micrometer'
```

버전을 적지 않은 이유: `io.spring.dependency-management` 플러그인이 Spring Boot(3.3.11)와
호환되는 버전을 자동으로 골라 준다. (actuator 3.3.11, micrometer 1.13.x, hibernate-micrometer 6.5.x)

### 2-2. 백엔드 `application.properties`

```properties
management.endpoints.web.exposure.include=health,prometheus        # 노출할 엔드포인트
management.metrics.tags.application=meat-to-meat-backend           # 모든 지표에 붙는 라벨
management.metrics.distribution.percentiles-histogram.http.server.requests=true  # p95/p99 계산용 히스토그램
spring.jpa.properties.hibernate.generate_statistics=true          # SQL 실행 수 집계
spring.jpa.show-sql=${SHOW_SQL:true}                                # docker 에서는 false (로그 폭주 방지)
```

`SecurityConfig` 에서 `/actuator/health`, `/actuator/prometheus` 는 로그인 없이 열어 두었다.
(Prometheus 가 토큰 없이 수집해야 하므로. 운영 환경이라면 내부망에서만 열어야 한다)

### 2-3. 인프라 설정 파일

```
monitoring/
├── prometheus/prometheus.yml          # 무엇을 몇 초마다 수집할지
├── loki/loki-config.yml               # 로그 저장 방식(파일), 보관 기간(7일)
├── alloy/config.alloy                 # 어떤 로그를 읽어 Loki 로 보낼지
└── grafana/
    ├── provisioning/datasources/      # Grafana 시작 시 Prometheus, Loki 자동 연결
    ├── provisioning/dashboards/       # 아래 JSON 을 대시보드로 자동 등록
    ├── dashboards/meat-to-meat.json   # 대시보드 (generate_dashboard.py 로 생성)
    └── generate_dashboard.py          # 패널을 고칠 때 이 파일을 수정 후 실행
loadtest/k6/
├── common.js                          # BASE_URL, 로그인 헬퍼
├── products.js                        # 시나리오 1: 상품 둘러보기 (읽기 위주)
├── orders.js                          # 시나리오 2: 주문 목록/상세 (N+1 확인)
└── stock-race.js                      # 시나리오 3: 같은 상품 동시 주문 (동시성 확인)
```

`docker-compose.yml` 에는 서비스를 프로필로 나눠 두었다.

| 프로필 | 서비스 | 용도 |
|---|---|---|
| (기본) | mysql | DB 만 |
| `full` | backend, frontend | 앱 전체 |
| `monitoring` | prometheus, loki, alloy, grafana | 모니터링 |
| `loadtest` | k6 | 부하 테스트 (실행하고 끝나면 사라짐) |

MySQL 에는 슬로우 쿼리 로그를 켜 두었다(`--long-query-time=0.1` → 0.1초 이상 걸린 쿼리 기록).

## 3. 실행 방법

### 3-1. 앱 + 모니터링 띄우기

```bash
docker compose --profile full --profile monitoring up -d --build
```

| 주소 | 내용 |
|---|---|
| http://localhost:3001 | **Grafana** (로그인 없이 대시보드 보기 가능, 편집은 admin / admin) |
| http://localhost:9090 | Prometheus (Status → Targets 에서 수집 대상이 UP 인지 확인) |
| http://localhost:8080/actuator/prometheus | 백엔드가 내보내는 원본 지표 |
| http://localhost:3000 | 쇼핑몰 프론트 |

### 3-2. 부하 걸기 (k6)

```bash
# 시나리오 1: 상품 둘러보기 (가상 사용자 최대 30명, 약 2분)
docker compose --profile loadtest run --rm k6 run /scripts/products.js

# 시나리오 2: 주문 목록 (N+1)
docker compose --profile loadtest run --rm k6 run /scripts/orders.js

# 시나리오 3: 같은 상품 동시 주문 (상품 2번을 30명이 동시에)
docker compose --profile loadtest run --rm k6 run -e PRODUCT_ID=2 -e USERS=30 /scripts/stock-race.js
```

- k6 는 터미널에 요약 결과(p95, 실패율, 임계값 통과 여부 ✓/✗)를 찍고, 같은 결과를
  Prometheus 로도 보낸다(`K6_OUT=experimental-prometheus-rw`). 그래서 Grafana 의 "부하 테스트(k6)" 줄에서 보인다.
- `thresholds` 는 합격 기준이다. 예: `http_req_duration: ["p(95)<500"]` → 95% 요청이 500ms 안이면 통과.
- 시나리오 3 은 실행할 때마다 테스트 회원(`race_...`)을 만들고 재고를 줄인다. 초기화는 5장 참고.

### 3-3. 대시보드 읽는 법

| 패널 | 보는 포인트 |
|---|---|
| 초당 요청 수 | 부하가 실제로 들어갔는지 |
| p95 응답 시간 | 튜닝 전후 비교의 핵심 지표. 평균보다 느린 요청을 잘 드러냄 |
| 에러 응답 | 4xx(재고 부족 등), 5xx(서버 오류). 1초 안에 끝나는 짧은 테스트는 15초 수집 간격 때문에 안 잡힐 수 있으니 k6 결과와 로그로 확인 |
| HikariCP 커넥션 풀 | "커넥션을 기다리는 요청"이 0보다 크면 DB 커넥션 부족 (기본 최대 10개) |
| 요청 1건당 SQL 수 | **N+1 지표**. 주문 목록처럼 연관 데이터를 읽는 API 에서 크게 올라가면 N+1 |
| 백엔드 에러 로그 | 예외 메시지 (데드락, 락 대기 등) |
| MySQL 슬로우 쿼리 | `Query_time`(실행 시간), `Lock_time`(락 대기), `Rows_examined`(읽은 행 수) |

### 3-4. 직접 조회해 보기 (Grafana → Explore)

**PromQL** (Prometheus 질의어, 데이터 소스 Prometheus 선택)
```promql
# API별 초당 요청 수
sum by (uri) (rate(http_server_requests_seconds_count{uri!~"/actuator.*"}[1m]))
# API별 p95 응답 시간
histogram_quantile(0.95, sum by (le, uri) (rate(http_server_requests_seconds_bucket[1m])))
```
`rate(...[1m])` = 최근 1분 동안 초당 증가량. 카운터(계속 늘어나는 값)를 "초당 얼마"로 바꿀 때 쓴다.

**LogQL** (Loki 질의어, 데이터 소스 Loki 선택)
```logql
{service="backend"} |~ "Deadlock"          # 백엔드 로그 중 Deadlock 포함
{job="mysql-slow"} |= "order_item"          # 슬로우 쿼리 중 order_item 관련
```
`{...}` 로 로그 묶음(라벨)을 고르고, `|=`(포함) `|~`(정규식) 으로 거른다.

## 4. 첫 측정 결과 (2026-11-25, 목데이터 상품 20개 기준)

| 시나리오 | 결과 | 해석 |
|---|---|---|
| 상품 둘러보기 (30 VU) | 68 req/s, p95 37.8ms, 실패 0% | 데이터가 20건뿐이라 아직 빠름 → 대량 데이터가 있어야 인덱스 효과가 보임 |
| 주문 목록 (20 VU) | p95 48.0ms, **요청당 SQL 약 9개** | 주문 목록이 N+1 (주문 1번 + 주문마다 상품 조회) |
| 동시 주문 (재고 18, 30명) | 성공 5건 / 재고 감소 3개, 실패 25건 중 23건 데드락 | **Lost Update**(2건이 재고 차감 없이 판매) + **데드락**(order_item INSERT 의 FK 공유 락 → product UPDATE 배타 락 대기) |

다음 단계(SQL 튜닝)에서 이 세 가지를 고치고, 같은 시나리오로 다시 측정해 전후를 비교한다.

## 5. 자주 쓰는 명령

```bash
# 모니터링만 내리기 (앱은 유지)
docker compose --profile monitoring stop

# 전부 내리기 (데이터 유지)
docker compose --profile full --profile monitoring down

# DB 를 V1 + V2 목데이터 상태로 초기화 (테스트로 바뀐 재고/주문/회원 삭제)
docker compose --profile full --profile monitoring down -v
docker compose --profile full --profile monitoring up -d --build
```
`down -v` 는 MySQL, Prometheus, Loki, Grafana 데이터를 모두 지운다.

## 6. 문제 해결

| 증상 | 확인 |
|---|---|
| Grafana 패널이 No data | Prometheus(:9090) → Status → Targets 에서 `backend:8080` 이 UP 인지. 백엔드를 IntelliJ 로 띄웠다면 `prometheus.yml` 의 `host.docker.internal:8080` 대상 주석을 풀고 `docker compose restart prometheus` |
| k6 패널만 비어 있음 | k6 를 `docker compose --profile loadtest run` 으로 실행했는지 (그래야 Prometheus 로 결과가 감) |
| 로그 패널이 비어 있음 | `docker logs m2m-alloy` 에 에러가 없는지, http://localhost:12345 (Alloy UI) 에서 컴포넌트가 정상인지 |
| 맥이 느려짐 | 전체 구성은 Docker 메모리 약 2~3GB 를 쓴다. 테스트하지 않을 때는 `--profile monitoring stop` |

## 7. 측정의 한계 (보고서에 적을 것)

부하를 거는 k6 와 부하를 받는 백엔드·MySQL 이 같은 노트북(M1, 8GB)에서 CPU 와 메모리를 나눠 쓴다.
그래서 "초당 몇 건까지 버틴다" 같은 절대 수치는 실제 서버와 다르다. 이 구성은 **튜닝 전후를 같은 조건에서
상대 비교**하는 용도로 쓰고, 보고서에도 그렇게 해석한다.
