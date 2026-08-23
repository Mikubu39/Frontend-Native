# Ảnh triển khai cho dịch vụ AI hội thoại.
#
# Mô hình được HUẤN LUYỆN NGAY LÚC BUILD chứ không commit file .joblib vào git.
# Như vậy trọng số mô hình luôn khớp với dataset trong cùng một commit - không
# bao giờ xảy ra cảnh mô hình cũ chạy trên dữ liệu mới mà không ai biết.
# Huấn luyện chỉ mất ~2 giây nên hoàn toàn nằm gọn trong thời gian build.

FROM python:3.12-slim

WORKDIR /app

# Cài phụ thuộc trước, tách khỏi mã nguồn, để tận dụng cache tầng của Docker.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/
COPY data/ ./data/

ENV PYTHONPATH=/app/src \
    PYTHONUNBUFFERED=1

# Huấn luyện lúc build -> ảnh chứa sẵn mô hình, khởi động runtime rất nhanh.
RUN python -m nihongo_ai.train

EXPOSE 8000

# Gói hosting miễn phí cấp cổng qua biến $PORT; mặc định 8000 khi chạy cục bộ.
CMD ["sh", "-c", "uvicorn nihongo_ai.api:app --host 0.0.0.0 --port ${PORT:-8000}"]
