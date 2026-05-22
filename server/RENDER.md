# Render — cozy-server 배포

스크린샷처럼 **Build가 `npm install && npm run db:migrate`에서 실패**하면 아래대로 수정하세요.

## Dashboard 설정 (cozy-server)

| 항목 | 값 |
|------|-----|
| Root Directory | `server` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |

`npm run db:migrate`는 **Build에 넣지 마세요.**  
마이그레이션은 `npm start` 안에서 자동 실행됩니다.

## PostgreSQL 연결 (필수)

1. Render PostgreSQL 인스턴스 생성
2. **cozy-server** → **Connections** → PostgreSQL **Link**
3. Environment에 **`DATABASE_URL`**, **`INTERNAL_DATABASE_URL`** 이 자동으로 생겼는지 확인

**주의:** Environment에 아래처럼 **localhost** 가 들어가 있으면 삭제하세요. (로그에 `Database host: localhost` 가 보이면 이 경우입니다.)

```
DATABASE_URL=postgresql://...@localhost:5432/...
```

수동 입력 시 PostgreSQL 대시보드의 **External Database URL** 을 `DATABASE_URL` 에 붙여넣습니다.

## 환경 변수 (최소)

| 키 | 설명 |
|----|------|
| `DATABASE_URL` | Link 시 자동 (또는 External URL) |
| `CORS_ORIGIN` | 프론트 URL (예: `https://cozy-ui.onrender.com`) |

`NODE_ENV`, `PORT`는 Render가 넣는 경우 **중복 등록하지 않기**.

## 재배포

설정 저장 후 **Manual Deploy → Clear build cache & deploy**.
