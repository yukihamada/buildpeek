# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
ARG NPM_TOKEN
ENV NODE_ENV=production
RUN npm config set //registry.npmjs.org/:_authToken=${NPM_TOKEN}
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY .env /app/.env
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
