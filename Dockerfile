FROM registry.lazycat.cloud/abby/library/node:8084dbd2076b7ba6 AS frontend
WORKDIR /build/product
COPY product/package*.json ./
RUN npm ci --no-audit --no-fund
COPY product/ ./
RUN npm run build

FROM registry.lazycat.cloud/abby/library/node:8084dbd2076b7ba6
WORKDIR /app
COPY server/package*.json ./server/
RUN npm --prefix server ci --omit=dev --no-audit --no-fund
COPY server/ ./server/
COPY --from=frontend /build/product/dist ./product/dist
COPY lpk/start.sh ./start.sh
ENV HOST=0.0.0.0 PORT=8888 LOTTERY_DATA_DIR=/lzcapp/var/upstream-lottery
EXPOSE 8888
CMD ["/app/start.sh"]
