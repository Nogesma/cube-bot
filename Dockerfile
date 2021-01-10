FROM node:14

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY package.json .
COPY yarn.lock .

RUN yarn

COPY app app/
COPY index.js .

CMD ["yarn", "run", "prod"]
