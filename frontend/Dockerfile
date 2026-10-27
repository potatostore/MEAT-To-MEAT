FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
# NEXT_PUBLIC_* 값과 rewrites 대상 주소는 빌드할 때 코드에 박히므로 build arg로 받는다
ARG NEXT_PUBLIC_API_MOCK=false
ARG API_BASE_URL=http://backend:8080
ENV NEXT_PUBLIC_API_MOCK=$NEXT_PUBLIC_API_MOCK \
    API_BASE_URL=$API_BASE_URL \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 TZ=Asia/Seoul
COPY --from=build /app ./
EXPOSE 3000
CMD ["npm", "start"]
