# Stage: Runtime only — uses pre-built .next/standalone from local build
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static

RUN mkdir -p ./public
COPY public ./public

USER nextjs
EXPOSE 3001
CMD ["node", "server.js"]
