#Use a base image with Node.js and npm installed. --- version: 20.11.0
FROM node:20.11.0 AS builder

#Set up the working directory within the container.
WORKDIR /usr/src/app

#Copy package.json and package-lock.json files into the container.
COPY package*.json ./

#Install dependencies using npm.
RUN npm install

#Copy the rest of the application code into the container.
COPY . /usr/src/app/

#Expose this port 8080 to allow external access to the application.
EXPOSE 8080

#Install react
RUN npm install react react-dom

#Generate the production build of the React application.
ENTRYPOINT npm run start
