FROM python:3.12-slim

WORKDIR /tests

RUN pip install --no-cache-dir selenium

COPY test_xss.py .

CMD ["python", "test_xss.py"]
