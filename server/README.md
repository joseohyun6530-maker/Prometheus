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

| 변수 | 로컬 | 배포 시 | 설명 |
|------|------|---------|------|
| `PORT` | `3000` | 호스트가 자동 설정하는 경우 **등록하지 않음** | 서버 포트 |
| `NODE_ENV` | (선택) | 호스트가 `production`으로 넣는 경우 **중복 등록 금지** | `Duplicate key 'NODE_ENV'` 오류 원인 |
| `CORS_ORIGIN` | `http://localhost:5173` | **필수** — 배포된 프런트 URL | 쉼표로 여러 origin 가능 |
| `DATABASE_URL` | 로컬 DB URL | **필수** — 배포 DB URL | PostgreSQL 연결 문자열 |

### 배포 시 환경 변수 (대시보드)

호스트(Render, Railway 등)에 **키당 한 줄**만 등록합니다. `Add from .env`로 붙여넣을 때 `NODE_ENV`가 두 번 들어가면 저장이 거부됩니다.

| 키 | 값 예시 |
|----|---------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/cozy` |
| `CORS_ORIGIN` | `https://your-app.vercel.app` (로컬도 허용하려면 `https://...,http://localhost:5173`) |

`NODE_ENV`, `PORT`는 플랫폼 기본값이 있으면 **추가하지 마세요**. 잘못된 키(예: `kal`)는 삭제합니다.

### Render 배포 설정

| 항목 | 값 |
|------|-----|
| **Root Directory** | `server` |
| **Build Command** | **`npm install` 만** (`npm run db:migrate` 넣으면 빌드 실패 — DB는 빌드 네트워크에서 Internal URL 접속 불가) |
| **Start Command** | **`npm start`** (`db:migrate` 후 서버 시작) |

**주의:** `node index.js`만 쓰려면 Root Directory가 반드시 **`server`** 여야 합니다.  
`src/server`처럼 잘못 지정하면 `Cannot find module .../index.js` 오류가 납니다.

`npm start`는 내부적으로 `node src/index.js`를 실행합니다.

또는 저장소 루트의 `render.yaml` Blueprint를 사용합니다.

**`Exited with status 1`이 나올 때**

1. `DATABASE_URL`이 Render PostgreSQL **Internal/External URL**로 설정됐는지 확인
2. Build Command에 `db:migrate`가 있으면 제거 (마이그레이션은 Start의 `npm start`에서만 실행)
3. Root Directory가 `server`가 아니면 `npm start`가 실패함

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
