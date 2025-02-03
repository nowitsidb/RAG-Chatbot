FROM node:18-alpine
WORKDIR /app

COPY package*.json ./

RUN npm install && \
    npm install lucide-react --save

COPY . .

CMD ["npm", "start"]