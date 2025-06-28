FROM docker.io/node:lts-alpine

ENV HOST=0.0.0.0
ENV PORT=3000

WORKDIR /app

RUN addgroup --system auth-service && \
    adduser --system -G auth-service auth-service

COPY apps/auth-service/dist auth-service/
RUN chown -R auth-service:auth-service .

# You can remove this install step if you build with `--bundle` option.
# The bundled output will include external dependencies.
RUN npm --prefix auth-service --omit=dev -f install

CMD [ "node", "auth-service" ]
