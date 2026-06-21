FROM python:3.12-slim

WORKDIR /tests

RUN pip install --no-cache-dir selenium

COPY test_csrf.py .

CMD ["python", "test_csrf.py"]
