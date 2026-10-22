FROM registry.lazycat.cloud/abby/library/node:8084dbd2076b7ba6 AS build
WORKDIR /app/product
COPY product/package*.json ./
RUN npm ci
COPY product/ ./
RUN npm run build

FROM registry.lazycat.cloud/abby/library/node:8084dbd2076b7ba6
WORKDIR /app
COPY server/package*.json ./server/
RUN npm --prefix server ci --omit=dev
COPY server/ ./server/
COPY lpk/run.sh ./run.sh
COPY --from=build /app/product/dist ./product/dist
ENV HOST=0.0.0.0 PORT=8888
EXPOSE 8888
CMD ["node", "server/index.js"]
