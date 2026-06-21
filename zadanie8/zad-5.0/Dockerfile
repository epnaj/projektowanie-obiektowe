FROM mcr.microsoft.com/playwright:v1.49.0-noble

WORKDIR /tests

RUN npm install -g @playwright/test@1.49.0

ENV NODE_PATH=/usr/lib/node_modules

COPY playwright.config.js e2e.spec.js ./

CMD ["npx", "playwright", "test"]
