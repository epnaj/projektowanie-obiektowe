FROM python:alpine3.22

RUN apk --no-cache add curl

RUN mkdir /testenv

WORKDIR /testenv

COPY . .

ENTRYPOINT [ "sh", "-c", "python3 test_products.py && echo '' && python3 test_categories.py && echo '' && python3 test_orders.py" ]
