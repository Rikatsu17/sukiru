FROM python:3.11-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1

COPY . .

EXPOSE 3000

CMD ["python", "-m", "http.server", "3000", "--bind", "0.0.0.0"]
