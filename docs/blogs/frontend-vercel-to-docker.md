# 프론트엔드 배포를 Vercel에서 Docker(nginx)로 옮기기

> Vite + React SPA를 Vercel 자동배포 → 라즈베리파이(RPI) pm2 → Docker로 이전한 기록.
> 백엔드 개발자 관점에서 프론트 빌드/서빙 구조를 이해하며 겪은 함정과 의사결정을 정리한다.

---

## 1. 배경과 동기

- 기존: Vercel **자동배포**
- 1차 이전: 연구실 RPI(`daisy`)로 옮기며 **pm2**로 `vite preview` 상시 실행
- 문제의식:
  - pm2 관리가 직관적이지 않음 (`nohup.out`, `preview.log` 뒤지기)
  - 백엔드는 이미 Docker로 관리 중 → **프론트도 같은 체계로 통일하고 싶음**
  - `docker ps` 한 화면으로 프론트·백엔드·DB·Redis를 보고 싶음
  - 실무에 가까운 **온프레미스 환경**을 연습하고 싶음

### 짚고 넘어간 전제
"pm2가 불편하다 → Docker로"의 진짜 원인은 pm2 자체보다 **자동배포(Vercel) → 수동배포 전환**과 **낯선 프론트 도구**였다. Docker의 실질 이득은:
- 이미지로 **박제** → 롤백/재현 용이
- 백엔드와 **동일한 관리 체계**(`docker compose`)로 통일

---

## 2. 핵심 개념 (백엔드 개발자가 헷갈린 지점)

### 2-1. 프론트 빌드 = "택배기사" 모델
| 프론트 | 백엔드 대응 |
|---|---|
| `npm run build` | `./gradlew build` |
| 결과물 `dist/` (html·js·css) | 결과물 `app.jar` |
| `dist`엔 **실행 로직 없음** — 브라우저가 받아 실행 | jar는 서버가 직접 실행 |

→ 프론트 서버는 "일하는 서버"가 아니라 **"파일을 내려주는 택배기사"**다. 그래서 정적 파일 서버(nginx)면 충분하다.

### 2-2. SPA fallback — "없는 파일을 요청받았을 때"
SPA는 `dist`에 `index.html` 하나뿐이다. `/login`, `/app` 같은 경로의 파일은 존재하지 않는다.
- 사이트 안에서 클릭 이동 → 서버에 안 물어봄 → 문제 없음
- **주소창 직접 입력 / 새로고침(F5)** → 서버에 그 파일 요청 → 없음 → **404**

해결: "어떤 경로든 파일이 없으면 `index.html`을 돌려준다." → 브라우저가 JS 실행 → React Router가 경로 처리.

| 환경 | fallback 담당 |
|---|---|
| Vercel | `vercel.json`의 `rewrites` |
| pm2(`vite preview`) | vite가 기본 내장 (그래서 새로고침도 됐음) |
| nginx | `try_files $uri /index.html;` |

### 2-3. ⚠️ 빌드타임 env 박제 (이번 작업 최대 함정)
백엔드 환경변수는 **실행 시점**에 주입되지만, 프론트(Vite)는 **빌드 시점**에 `import.meta.env.VITE_*`를 **실제 값으로 치환해 굳혀버린다.**

```ts
// src/lib/api.ts
const BASE_URL = import.meta.env.VITE_API_URL ?? "";
```

`.env.local`에 `VITE_API_URL=http://localhost:38080`이 있었고, 이게 빌드된 `dist`에 **그대로 박혔다.**
- `localhost` = **접속자 본인 PC** → 외부 사용자는 API가 깨짐 (게다가 https 페이지에서 http 호출 = mixed content 차단)
- "잘 됐던" 이유: 백엔드가 떠 있는 **본인 PC에서만** 테스트했기 때문

**해결: `VITE_API_URL`을 비운다(또는 `.env.local` 삭제).** 그러면 `BASE_URL=""` → 호출이 `/api/...` **상대경로**가 되어:
- 개발: `vite.config.ts`의 `server.proxy`가 `/api`를 38080으로 중계
- 운영: 앞단 nginx(bastion)가 `/api`를 백엔드로 라우팅

### 2-4. CORS vs proxy — `.env`가 proxy를 무력화하고 있었다
백엔드 CORS 허용 목록에 `http://localhost:35173`이 있었다.
- `BASE_URL`이 절대주소(`localhost:38080`)면 호출이 절대 URL → vite proxy(`/api` 상대경로 매칭)를 **안 탐**
- 브라우저가 38080을 **직접** 호출하고, CORS가 그걸 허용해서 동작했던 것
- 즉 **vite proxy는 깔려만 있고 죽은 설정**이었다. `.env`가 이기고 있었다.

`.env`를 비우면 페이지와 API가 **same-origin**이 되어 proxy(개발)/bastion(운영)이 비로소 제 역할을 한다.

### 2-5. vite.config.ts 블록별 역할
| 키 | 용도 | 도커에서 |
|---|---|---|
| `plugins`, `resolve`, `assetsInclude` | 빌드 공통 | **사용됨** |
| `server` | 개발용 (`npm run dev`) | 안 쓰임 (그대로 둠) |
| `preview` | 빌드 미리보기 (`vite preview`) | 안 쓰임 → **삭제** |
| `build` | 운영 빌드 설정 | 없음 → vite 기본값 사용 |

`base`(URL 경로)도 기본값 `/`면 루트 서빙에 맞아 손댈 필요 없었다.

### 2-6. nginx가 두 곳에 등장 (혼동 주의)
| nginx | 위치 | 조치 |
|---|---|---|
| bastion nginx | 연구실 호스트(앞단) | **안 건드림** — `/api`·`/`를 daisy로 라우팅 |
| 컨테이너 nginx | `nginx:alpine` 이미지 안에 포함 | 우리가 만든 것 — daisy 도커 위에서 실행 |

→ **daisy 호스트에 nginx를 설치하지 않는다.** 이미지가 nginx를 들고 들어온다. 이게 Docker를 쓰는 핵심 이유(호스트를 더럽히지 않음).

---

## 3. 인프라 구조

```
브라우저 → bastion nginx(443, 연구실)
            ├─ /api, /ws → 192.168.30.61:38080  (백엔드 컨테이너)
            └─ /         → 192.168.30.61:35173  (프론트 nginx 컨테이너) ← pm2에서 교체
```

`/api` 라우팅을 bastion이 이미 하고 있어서, **프론트 컨테이너는 정적 서빙 + SPA fallback만** 담당한다. (`/api` 프록시를 컨테이너에 또 넣을 필요 없음)

---

## 4. 의사결정 / 트레이드오프

### 4-1. 서빙 방식: nginx vs node
**nginx 정적 서빙(multi-stage) 채택.** node `vite preview`는 프로덕션용이 아니고 RPI에서 무겁다. nginx는 가볍고 표준적이며 SPA fallback을 한 줄로 처리.

### 4-2. compose: 통합(B) vs 독립(A)
**A. 프론트 독립 compose 채택.**
- 판단 근거 1: 프론트는 백엔드와 **네트워크 통신 불필요**(bastion이 `/api` 처리) → 같은 네트워크에 묶을 기능적 이유 없음
- 판단 근거 2: **`docker ps` 가시성은 compose 통합과 무관** — 같은 데몬이면 분리해도 다 보임
- 근거 3: 레포가 분리됨(`ignoa-api`/`ignoa-web`) → 각 레포가 자기 compose를 갖는 게 실무 표준
- 트레이드오프: up/down을 두 폴더에서 각각 해야 함 (감수)

### 4-3. 커밋 분리
"기존 정리"와 "도커 도입"은 성격이 달라 **두 커밋으로 분리** (revert·리뷰 용이).

---

## 5. 최종 구성

### Dockerfile (multi-stage)
```dockerfile
# 1단계: 빌드 (node) — 최종 이미지엔 남지 않음
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2단계: 서빙 (nginx) — 가벼운 실행 이미지
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```
- `COPY package*.json` 먼저 → `npm ci` → 도커 캐시 활용(의존성 변경 없으면 재설치 스킵)
- `COPY --from=build`로 `dist`만 추출 → node·node_modules는 버려 이미지 경량화

### nginx.conf
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;   # SPA fallback
    }
}
```

### .dockerignore
```
node_modules   # npm ci로 새로 설치 + 맥 바이너리 충돌 방지
dist           # 컨테이너 안에서 새로 빌드
.git
.env*          # ★ 빌드에 env가 안 박히게(상대경로 보장) — 이중 안전장치
*.log
nohup.out
.DS_Store
Dockerfile
.dockerignore
```
> `.env*` 제외가 **이중 안전장치**다. `.env.local`을 못 지웠어도 빌드 컨텍스트에서 제외되어 `localhost`가 박힐 수 없다.

### docker-compose.yml (독립)
```yaml
services:
  web:
    build: .
    container_name: ignoa-web        # docker ps에서 ignoa-api·mysql·redis 옆에 표시
    platform: linux/arm64            # 백엔드와 일관(RPI)
    ports:
      - "35173:80"                   # 호스트 35173(bastion이 보냄) → 컨테이너 nginx 80
    restart: unless-stopped          # 재부팅/크래시 자동 복구 (pm2 역할)
```
- `depends_on`/`env_file`/`volumes`/`networks` 생략 — 정적 서빙이라 불필요

### 정리한 파일
- `vercel.json` 삭제 (Vercel 전용, RPI에선 미사용)
- `vite.config.ts`의 `preview` 블록 삭제
- `.env.local` 삭제 (`VITE_API_URL` → 상대경로 통일)

---

## 6. 트러블슈팅 기록

1. **`docker run` 먼저 실행 → `pull access denied`**
   - 원인: 이미지를 빌드하지 않고 실행함 → 로컬에 없어 원격에서 받으려다 실패
   - 해결: `docker build -t ignoa-web .` 먼저

2. **env 박힘 검증** (배포 전 최종 관문)
   ```bash
   docker run --rm ignoa-web grep -o "localhost:38080" /usr/share/nginx/html/assets/*.js \
     && echo "⚠️ 박힘" || echo "✅ 안 박힘"
   ```

3. **RPI(ARM) 호환** — `node:20-alpine`, `nginx:alpine` 모두 멀티아키텍처라 RPI에서 정상 빌드/실행 (`OS: Linux ... raspi` 로그로 확인)

---

## 7. 운영 명령 (pm2 → docker compose)

| 작업 | pm2 | docker compose |
|---|---|---|
| 상태 | `pm2 list` | `docker compose ps` / `docker ps` |
| 로그 | `pm2 logs` | `docker compose logs -f` |
| 재시작 | `pm2 restart` | `docker compose restart` |
| 재배포 | `git pull && pm2 restart` | `git pull && docker compose up -d --build` |
| 중지 | `pm2 delete` | `docker compose down` |

→ 배포 갱신이 **`git pull && docker compose up -d --build` 한 줄**로 단순화됨.

---

## 8. 남은 일 / 주의

- [ ] **git 정리 필요**: `nohup.out`, `preview.log`가 실수로 staged됨 → `git restore --staged` 후 `.gitignore`에 추가 (`nohup.out`, `*.log`)
- [ ] `Dockerfile`·`docker-compose.yml`·`nginx.conf`·`.dockerignore`를 커밋에 포함시켰는지 확인
- [ ] 외부 기기(핸드폰 데이터)로 `ignoa.wisoft.dev` 접속해 API·새로고침 최종 확인
- [ ] (선택) `vite.config.ts`의 `server` 블록은 개발용으로 유지 — 정리 여부는 추후
```
