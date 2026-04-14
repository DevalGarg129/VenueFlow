FROM node:18-alpine

WORKDIR /app/shared
COPY shared/package*.json ./
RUN npm install --production
COPY shared/ ./

WORKDIR /app/services/match-service
COPY services/match-service/package*.json ./
RUN npm install --production
COPY services/match-service/ ./

EXPOSE 4004
CMD ["npm", "start"]
