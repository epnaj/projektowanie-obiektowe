FROM node:20-alpine
WORKDIR /app
COPY . .
RUN cd client && npm install && npm run build
CMD ["node", "server/index.js"]
