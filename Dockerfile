FROM node:18-alpine3.17

RUN mkdir /app
WORKDIR /app

# https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md#handling-kernel-signals
# Add Tini
ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-muslc-amd64 /usr/bin/tini
RUN chmod +x /usr/bin/tini

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY srv/ srv/
COPY .eslintrc.cjs .prettierrc.json tsconfig.eslint.json tsconfig.json ./

RUN yarn build && \
    rm -rf node_modules && \
    yarn install --frozen-lockfile --production

ENV PORT=6306

ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "dist/app.js"]
EXPOSE 6306