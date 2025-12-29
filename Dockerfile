FROM node:20-bookworm-slim

WORKDIR /app

# Prisma等を使う場合にも困りにくい
RUN apt-get update && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

EXPOSE 3000
CMD ["npm", "run", "dev"]

