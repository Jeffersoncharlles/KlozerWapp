FROM golang:1.27-bookworm AS builder

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=1 GOOS=linux go build -trimpath -buildvcs=false -ldflags="-s -w" -o /out/klozer ./cmd

FROM debian:bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates wget \
    && rm -rf /var/lib/apt/lists/*

RUN useradd --system --uid 10001 --create-home --home-dir /app klozer

WORKDIR /app
COPY --from=builder /out/klozer /app/klozer

RUN mkdir -p /data \
    && chown -R klozer:klozer /app /data

USER klozer
EXPOSE 3000

ENTRYPOINT ["/app/klozer"]
