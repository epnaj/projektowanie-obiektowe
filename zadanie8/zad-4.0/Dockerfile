FROM python:3.12-slim

WORKDIR /tests

RUN pip install --no-cache-dir selenium

COPY test_cart_multitab.py .

CMD ["python", "test_cart_multitab.py"]
