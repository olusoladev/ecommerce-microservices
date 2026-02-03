# 1️⃣ Use lightweight Node image
FROM node:18-alpine

# 2️⃣ Set working directory
WORKDIR /app

# 3️⃣ Copy package files first (better caching)
COPY package*.json ./

# 4️⃣ Install dependencies
RUN npm install

# 5️⃣ Copy source code + .env
COPY . .

# 6️⃣ Build TypeScript
RUN npm run build

# 7️⃣ Expose service port
EXPOSE 3002

# 8️⃣ Run in production mode
CMD ["npm", "run", "start:prod"]
