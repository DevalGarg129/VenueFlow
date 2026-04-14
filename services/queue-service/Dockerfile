FROM node:18-alpine

WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install --production
COPY shared/ ./

WORKDIR /app/services/queue-service
COPY services/queue-service/package*.json ./
RUN npm install --production
COPY services/queue-service/ ./

EXPOSE 4003
CMD ["npm", "start"]
