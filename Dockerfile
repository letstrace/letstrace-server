FROM node:12
COPY package.json package-lock.json /app/
WORKDIR /app
RUN npm install
COPY . /app
EXPOSE 3000
CMD npm start
