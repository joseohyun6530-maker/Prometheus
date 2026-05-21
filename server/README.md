# COZY API Server

Express.js 기반 백엔드 (`ui/` 프런트엔드와 분리).

## 요구 사항

- Node.js 18+

## 설치

```bash
cd server
npm install
```

## 환경 변수

`.env.example`을 복사해 `.env`를 만듭니다.

```bash
copy .env.example .env
```

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `PORT` | `3000` | 서버 포트 |
| `NODE_ENV` | `development` | 실행 환경 |
| `CORS_ORIGIN` | `http://localhost:5173` | Vite 프런트 허용 origin |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/cozy` | PostgreSQL 연결 문자열 |

## PostgreSQL 설정

1. `.env`의 `DATABASE_URL`에서 **사용자·비밀번호**를 본인 PostgreSQL 설치 값으로 수정합니다.
2. 마이그레이션( DB 생성 + 테이블 + 시드 데이터):

```bash
npm run db:migrate
```

생성되는 DB 이름: URL 경로의 `cozy` (예: `.../cozy`)

## 실행

```bash
# 개발 (파일 변경 시 자동 재시작, Node --watch)
npm run dev

# 일반 실행
npm start
```

## 엔드포인트 (초기)

| Method | Path | 설명 |
|--------|------|------|
| GET | `/` | API 안내 |
| GET | `/api/v1/health` | 헬스 체크 (DB 연결 포함) |

API 상세는 `../docs/PRD.md` Part 2 참고.

## 폴더 구조

```
server/
  src/
    index.js          # 진입점
    app.js            # Express 앱 설정
    config.js         # 환경 설정
    routes/           # API 라우트
    middleware/       # 공통 미들웨어
    db/
      pool.js         # PostgreSQL 연결 풀
      schema.sql      # 테이블 정의
      migrate.js      # DB 생성·마이그레이션·시드
      seedData.js     # 초기 메뉴 데이터
```
