FROM mhart/alpine-node:10

WORKDIR /app

COPY ./app/package.json package.json
COPY ./app/yarn.lock yarn.lock
RUN yarn --pure-lockfile

ADD ./app /app

RUN yarn && yarn build
