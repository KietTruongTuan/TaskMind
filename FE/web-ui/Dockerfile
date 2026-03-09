FROM node:22-slim

# enable pnpm
RUN corepack enable

WORKDIR /app

# dependencies 
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY . .
EXPOSE 3000

RUN pnpm run build

CMD [ "pnpm", "run", "start" ]