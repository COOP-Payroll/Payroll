# FROM node:18-alpine
FROM node:22-alpine
#CREATE APP DIRECTORY
WORKDIR /app
# INSTALL APP DEPENDENCY

COPY package*.json ./
# RUN NPM INSTALL
RUN npm install

# COPY .env .env

#BUNDLE APP SOURCE 
COPY . .
# COPY . .
#EXPOSE PORT

EXPOSE  4400
#EXCUTABLE COMMAND
CMD [ "npm","start" ]
