# Build stage
FROM golang:1.21-alpine3.19 AS builder

ARG APP_VERSION=dev
ARG BUILD_TIME
ARG GIT_COMMIT

# Установка зависимостей Go
RUN apk add --no-cache git
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download

# Добавление исходных файлов
COPY . .

# Сборка
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-X 'main.appVersion=${APP_VERSION}' -X 'main.buildTime=${BUILD_TIME}' -X 'main.gitCommit=${GIT_COMMIT}'" \
    -a -o /app/wg-ui .

# Release stage
FROM alpine:3.19

RUN addgroup -S wgui && adduser -S -D -G wgui wgui
RUN apk --no-cache add ca-certificates wireguard-tools jq iptables

WORKDIR /app

COPY --from=builder /app/wg-ui .
RUN chmod +x wg-ui

# Применение правил iptables с использованием sudo
COPY iptables.rules /etc/iptables.rules
RUN sudo iptables-restore < /etc/iptables.rules

# Удаление кэша и ненужных пакетов
RUN rm -rf /var/cache/apk/*

EXPOSE 5000/tcp
ENTRYPOINT ["./wg-ui"]