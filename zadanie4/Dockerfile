FROM golang:1.22

WORKDIR /app

COPY . .

RUN go mod tidy

EXPOSE 8000

CMD ["go", "run", "."]
