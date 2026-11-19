FROM oven/bun:1-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=8000 DATA_DIR=/app/data COOKIE_SECURE=true
COPY --chown=bun:bun server/ ./server/
COPY --chown=bun:bun platform.html platform.css platform.js navigation.js index.html styles.css accessibility.css app.js local-tools.js ./
RUN mkdir -p /app/data && chown bun:bun /app/data
USER bun
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun -e "fetch('http://127.0.0.1:8000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["bun", "server/platform.cjs"]
