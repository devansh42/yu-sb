FROM node:alpine
ADD . /backend
WORKDIR /backend
RUN npm i 
RUN npm i tsc 
RUN npm run build
CMD node . > /var/log/backend.log 2>&1
