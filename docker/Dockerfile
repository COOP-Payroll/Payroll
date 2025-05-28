FROM node:18-alpine
WORKDIR /app
COPY ../package.json package-lock.json ./
RUN npm install
COPY . .
RUN npx tsc
RUN npm install -g pm2
EXPOSE 3000
CMD ["pm2-runtime", "start", "dist/app.js", "--name", "api"]