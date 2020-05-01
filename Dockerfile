FROM node:alpine
ADD . /backend
WORKDIR /backend
#RUN apk update
RUN apk update
RUN apk add sqlite alpine-sdk python3 python

RUN npm i
 
CMD node . > /var/log/backend.log 2>&1
