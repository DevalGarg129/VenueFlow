FROM node:18-alpine

WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install --production
COPY shared/ ./

WORKDIR /app/gateway
COPY gateway/package*.json ./
RUN npm install --production
COPY gateway/ ./

EXPOSE 8080
CMD ["npm", "start"]
