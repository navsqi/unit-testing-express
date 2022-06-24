FROM --platform=linux/amd64 node:14.19.1 as build

# Set Working Directory
WORKDIR /app

# Copy Node Packages Requirement
COPY package*.json /app/package.json

RUN npm install

# Copy Node Source Code File
COPY . .

RUN npm run build

# Remove src directory
RUN rm -rf src

# Expose Application Port
EXPOSE 4000

# Run The Application
CMD ["npm", "start"]