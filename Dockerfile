FROM artifactory.pegadaian.co.id:8084/node:16.15.0-alpine as build

# Set Working Directory
WORKDIR /app

# Copy Node Packages Requirement
COPY package.json ./
COPY package-lock.json ./

RUN npm install

# Copy Node Source Code File
COPY . ./

RUN npm run build

# Remove src directory
RUN rm -rf src

# Expose Application Port
EXPOSE 4000

# Run The Application
CMD ["npm", "start"]