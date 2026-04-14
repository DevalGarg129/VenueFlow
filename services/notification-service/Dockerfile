FROM node:18-alpine

WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install --production
COPY shared/ ./

WORKDIR /app/services/notification-service
COPY services/notification-service/package*.json ./
RUN npm install --production
COPY services/notification-service/ ./

EXPOSE 5000
CMD ["npm", "start"]
