FROM python:alpine3.22

RUN apk --no-cache add curl

RUN mkdir /testenv

WORKDIR /testenv

COPY . .

ENTRYPOINT [ "python3", "test_products.py" ]