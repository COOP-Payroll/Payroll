FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npx prisma generate
RUN npm run build
RUN npm install -g pm2
EXPOSE 3000
CMD ["pm2-runtime", "start", "build/src/index.js", "--name", "api"]