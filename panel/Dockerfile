# Używamy oficjalnego obrazu Node.js
FROM node:20-alpine

# Ustawiamy katalog roboczy w kontenerze
WORKDIR /app

# Kopiujemy package.json i package-lock.json
COPY package*.json ./

# Instalujemy zależności
RUN npm install --production

# Kopiujemy resztę plików
COPY . .

# Eksponujemy port
EXPOSE 8080

# Start serwera
CMD ["node", "server.js"]
