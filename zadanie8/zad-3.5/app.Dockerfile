FROM node:20-alpine AS client
WORKDIR /client
COPY client/package.json ./
RUN npm install && npm install prop-types
COPY client/ ./
RUN npm run build

FROM node:20-alpine
WORKDIR /srv/server
COPY server/package.json server/index.js ./
RUN npm install
COPY --from=client /client/dist /srv/client/dist
EXPOSE 8000
CMD ["node", "index.js"]
