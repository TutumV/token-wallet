FROM node:20.8.1
WORKDIR /code
COPY . /code/
RUN npm install --quiet
