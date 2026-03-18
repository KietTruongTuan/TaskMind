FROM node:22-slim AS basefe

# enable pnpm
RUN corepack enable

WORKDIR /app

# dependencies 
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

COPY . .
EXPOSE 3000

# for run dev
FROM basefe AS development
CMD ["pnpm", "run", "dev"]

# for run prod
FROM basefe AS production
RUN pnpm run build
CMD [ "pnpm", "run", "start" ]
