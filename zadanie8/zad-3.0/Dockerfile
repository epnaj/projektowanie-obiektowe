FROM python:3.12-slim

WORKDIR /tests

RUN pip install --no-cache-dir requests

COPY test_register.py .

CMD ["python", "test_register.py"]
