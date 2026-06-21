FROM node:20-alpine
WORKDIR /srv

COPY client/package.json client/
RUN cd client && npm install && npm install prop-types
COPY client/ client/
RUN cd client && npm run build


COPY server/package.json server/index.js server/
RUN cd server && npm install
WORKDIR /srv/server
EXPOSE 8000
CMD ["node", "index.js"]
