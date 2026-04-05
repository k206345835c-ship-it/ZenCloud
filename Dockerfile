FROM node:20-alpine

WORKDIR /app/panel

COPY panel/package*.json ./
RUN npm install

COPY panel .

EXPOSE 8080

CMD ["node", "server.js"]
