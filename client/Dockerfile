FROM node:20-alpine

WORKDIR /app

# Copy everything
COPY . .

# Install dependencies
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]
