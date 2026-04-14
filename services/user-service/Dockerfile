FROM node:18-alpine

WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install --production
COPY shared/ ./

WORKDIR /app/services/user-service
COPY services/user-service/package*.json ./
RUN npm install --production
COPY services/user-service/ ./

EXPOSE 4001
CMD ["npm", "start"]
