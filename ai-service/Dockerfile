# Ảnh triển khai cho dịch vụ AI hội thoại.
#
# Từ bản 2.0 không còn bước huấn luyện lúc build: phần hiểu ngôn ngữ do Gemini
# đảm nhiệm, nên ảnh chỉ còn FastAPI + PyYAML. Kích thước rơi từ ~140 MB xuống
# ~15 MB và container khởi động gần như tức thì.
#
# Khoá Gemini KHÔNG được nướng vào ảnh. Truyền lúc chạy:
#   docker run -e GEMINI_API_KEY=... -p 8000:8000 nihongo-ai

FROM python:3.12-slim

WORKDIR /app

# Cài phụ thuộc trước, tách khỏi mã nguồn, để tận dụng cache tầng của Docker.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY data/ ./data/

ENV PYTHONPATH=/app/src \
    PYTHONUNBUFFERED=1

EXPOSE 8000

# Gói hosting miễn phí cấp cổng qua biến $PORT; mặc định 8000 khi chạy cục bộ.
CMD ["sh", "-c", "uvicorn nihongo_ai.api:app --host 0.0.0.0 --port ${PORT:-8000}"]
