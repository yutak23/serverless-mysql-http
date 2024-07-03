FROM node:18-alpine3.17 AS builder

RUN mkdir /app
WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY srv/ srv/
COPY .eslintrc.cjs .prettierrc.json tsconfig.eslint.json tsconfig.json ./

RUN yarn build
RUN mkdir for-next-stage && \
    mv dist srv package.json yarn.lock for-next-stage/

FROM node:18-alpine3.17

RUN mkdir /app
COPY --from=builder /app/for-next-stage /app
WORKDIR /app

# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
# Add Tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-muslc-amd64 /usr/bin/tini
RUN chmod +x /usr/bin/tini

RUN yarn install --frozen-lockfile --production

ENV PORT=6000

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/app.js"]
EXPOSE 6000 6443 