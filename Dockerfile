FROM node:14

WORKDIR /app

COPY . .

RUN npm install

CMD [ "node", "-e", "\"require('./init.js')\"", "-i" ]

