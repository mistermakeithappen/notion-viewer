# Deployment Guide

This guide covers deploying the Notion Viewer application to various platforms.

## Vercel (Recommended)

The easiest way to deploy is using Vercel, the creators of Next.js.

### Deploy with Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Run deployment:
```bash
vercel
```

3. Follow the prompts to link or create a project

### Deploy with Git

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository on [vercel.com](https://vercel.com)
3. Vercel will automatically detect Next.js and configure the build

### Environment Setup

No environment variables needed - API keys are handled client-side.

## Netlify

1. Build command: `npm run build`
2. Publish directory: `.next`
3. Add the following `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t notion-viewer .
docker run -p 3000:3000 notion-viewer
```

## Railway

1. Connect your GitHub repository
2. Railway will auto-detect Next.js
3. No additional configuration needed

## Render

1. Create a new Web Service
2. Connect your GitHub repository
3. Build Command: `npm install && npm run build`
4. Start Command: `npm start`

## Self-Hosting

For self-hosting on a VPS:

1. Clone the repository
2. Install dependencies: `npm install`
3. Build: `npm run build`
4. Start: `npm start`

Use PM2 for process management:
```bash
npm install -g pm2
pm2 start npm --name "notion-viewer" -- start
pm2 save
pm2 startup
```

## Production Considerations

### Security

- The application doesn't store API keys
- All Notion API calls are proxied through your server
- Implement rate limiting if needed

### Performance

- Enable caching headers for static assets
- Consider using a CDN for global distribution
- Monitor API usage to stay within Notion's limits

### Monitoring

- Set up error tracking (e.g., Sentry)
- Monitor server resources
- Track API response times

## Troubleshooting

### Build Errors

- Ensure Node.js 18+ is installed
- Clear `.next` folder and rebuild
- Check for TypeScript errors: `npm run type-check`

### Runtime Errors

- Verify API routes are accessible
- Check CORS settings if deploying to a subdomain
- Ensure proper error handling for API failures

### Performance Issues

- Implement pagination for large databases
- Add caching for frequently accessed data
- Optimize bundle size with next/dynamic imports