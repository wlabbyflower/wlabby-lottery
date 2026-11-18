FROM registry.lazycat.cloud/abby/library/node:8084dbd2076b7ba6 AS builder
WORKDIR /build
RUN npm install --global pnpm@10.26.1
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build

FROM registry.lazycat.cloud/abby/library/node:8084dbd2076b7ba6
WORKDIR /app
COPY --from=builder /build/dist ./dist
COPY lpk/serve.mjs ./serve.mjs
ENV HOST=0.0.0.0 PORT=8080
CMD ["node","/app/serve.mjs"]
