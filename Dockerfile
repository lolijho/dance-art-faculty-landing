FROM nginx:1.27-alpine

ENV PORT=3000

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY landing/ /usr/share/nginx/html/

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:${PORT:-3000}/health || exit 1