FROM python:3.12-slim

WORKDIR /tests

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY test_register_ui.py test_register.py ./

CMD ["python", "test_register_ui.py"]
