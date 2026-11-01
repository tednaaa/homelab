# Layer cache

Docker builds an image line by line, top to bottom, and caches the result of each line. On the next build it reuses cached results until the first line where something changed - from there on, every line runs again.

## Order

Rarely changing lines go first: copy only `package*.json`, install dependencies, and only then copy the code that changes with every commit.

```dockerfile
FROM node:20-alpine
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
```

Dependencies reinstall only when `package.json` or the lockfile changes.

## Wrong order

```dockerfile
FROM node:20-alpine
COPY . .
COPY package*.json ./
RUN npm ci --omit=dev
```

`COPY . .` above `npm ci` means any code edit invalidates the cache, and every CI build reinstalls all dependencies from scratch.

`FROM` is always first: it is the base image everything else builds on.
