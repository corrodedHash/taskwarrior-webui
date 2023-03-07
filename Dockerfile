FROM alpine:latest as npm_base
RUN apk --no-cache add nodejs npm build-base


FROM npm_base as frontend_builder
RUN mkdir -p /src/frontend
COPY ./frontend/package.json ./frontend/package-lock.json /src/frontend
WORKDIR /src/frontend
RUN npm install
COPY ./frontend /src/frontend
RUN npm run generate


FROM npm_base as backend_builder
RUN mkdir -p /src/backend
COPY ./backend/package.json ./backend/package-lock.json /src/backend
WORKDIR /src/backend
RUN npm install
COPY ./backend /src/backend
RUN npm run build \
	&& npm prune --production \
	&& rm -r /src/backend/src


FROM npm_base as runner
RUN apk --no-cache add  nginx task python3
COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
COPY ./nginx/server.conf /etc/nginx/conf.d/default.conf
COPY ./docker/start.sh /start.sh
COPY --from=frontend_builder /src/frontend/.output/public /static
COPY --from=backend_builder /src/backend /src/backend

ENV TASKRC="/.taskrc"
ENV TASKDATA="/.task"

EXPOSE 80

# Taskwarrior data volume
VOLUME [ "/.task", "/.taskrc" ]

CMD ["/start.sh"]
