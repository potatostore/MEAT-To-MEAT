# Docker로 실행하기

## 준비

1. Docker Desktop 설치 후 실행 (Windows는 설치 시 WSL2 사용)
2. 루트에서 설정 파일 만들기
   ```bash
   cp .env.example .env        # Windows: copy .env.example .env
   ```
   `.env` 안의 비밀번호를 바꿉니다. `.env`는 `.gitignore`에 들어 있어 깃에 올라가지 않습니다.

## 1) DB만 띄우기 (지금 바로 가능)

```bash
docker compose up -d
docker compose ps            # m2m-mysql 이 healthy 면 준비 완료
```

백엔드는 IntelliJ에서 평소처럼 실행하되, 환경변수만 `.env`와 맞춥니다.

```
DB_URL=jdbc:mysql://localhost:3306/meat_to_meat?serverTimezone=Asia/Seoul&characterEncoding=UTF-8
DB_USERNAME=meat_app
DB_PASSWORD=(.env의 MYSQL_PASSWORD)
```

IntelliJ: Run → Edit Configurations → Environment variables 에 위 세 줄 입력.
테이블은 지금 설정(`ddl-auto=update`)대로 JPA가 첫 실행 때 만듭니다.

DB 접속 확인:

```bash
docker exec -it m2m-mysql mysql -umeat_app -p meat_to_meat
mysql> SHOW TABLES;
```

## 2) 전체 띄우기 (DB + 백엔드 + 프론트)

```bash
docker compose --profile full up -d --build
```

| 서비스 | 주소 |
|---|---|
| 프론트엔드 | http://localhost:3000 |
| 백엔드 | http://localhost:8080 |
| MySQL | localhost:3306 |

브라우저의 `/api/*` 요청은 프론트 컨테이너가 `http://backend:8080`으로 넘겨 주므로 CORS 설정이 필요 없습니다.
프론트만 mock으로 보고 싶으면 `.env`에서 `NEXT_PUBLIC_API_MOCK=true`로 바꾸고 `--build`로 다시 띄웁니다.

코드를 고친 뒤에는 `--build`를 붙여야 새 코드로 다시 빌드됩니다.

## 자주 쓰는 명령

```bash
docker compose logs -f backend       # 백엔드 로그 보기
docker compose --profile full down   # 전부 중지 (데이터는 유지)
docker compose down -v               # 중지 + DB 데이터 삭제 (db/init 스크립트를 다시 돌릴 때)
```

## 파일 설명

| 파일 | 역할 |
|---|---|
| `docker-compose.yml` | MySQL, 백엔드, 프론트엔드 컨테이너 설정 |
| `backend/m2m-shoppingmall-api/Dockerfile` | Gradle 8.14로 빌드 후 JRE 17 이미지로 실행 |
| `frontend/Dockerfile` | `npm ci` → `next build` → `next start` |
| `db/init/01_nl2sql_reader.sql` | NL2SQL용 읽기 전용 계정 (DB 최초 생성 시 1회 실행) |
| `db/ddl/schema.sql` | 보고서 물리 모델 DDL (자동 실행 안 함, 아래 참고) |

## DDL과 JPA

지금은 `ddl-auto=update`라서 엔터티 클래스 기준으로 JPA가 테이블을 만듭니다.
`db/ddl/schema.sql`은 보고서 5장 물리 모델을 그대로 옮긴 DDL인데, 현재 엔터티와 테이블·컬럼 이름이 달라서 자동 실행하지 않습니다.
엔터티를 DDL에 맞춘 뒤에는 이 파일을 `db/init/00_schema.sql`로 옮기고 `ddl-auto=validate`로 바꾸면 됩니다.
