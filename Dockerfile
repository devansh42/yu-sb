FROM node:alpine
ADD . /backend
RUN npm i 
RUN npm i tsc 
RUN npm run build
CMD node .