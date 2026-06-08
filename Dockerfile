# === 1단계: 빌드 (node) — dist를 만드는 재료, 최종 이미지엔 남지 않음 ===
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# === 2단계: 서빙 (nginx) — 실제로 배포되는 가벼운 이미지 ===
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
