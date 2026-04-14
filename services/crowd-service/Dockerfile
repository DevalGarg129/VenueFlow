FROM node:18-alpine

WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install --production
COPY shared/ ./

WORKDIR /app/services/crowd-service
COPY services/crowd-service/package*.json ./
RUN npm install --production
COPY services/crowd-service/ ./

EXPOSE 4002
CMD ["npm", "start"]
