FROM node:20-alpine

RUN npm install -g corepack@latest
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /api

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

RUN pnpm prune --prod

CMD ["pnpm", "start"]