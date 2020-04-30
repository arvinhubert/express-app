FROM node:12

COPY . .

RUN npm install

CMD node server.js