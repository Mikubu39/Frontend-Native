/**
 * API Error Handler & Smart Translator
 *
 * Centralized utility for extracting, normalizing, and translating API errors
 * from Spring Boot (RFC 7807 ProblemDetail, standard exceptions), FastAPI,
 * and client-side network errors into friendly, localized Vietnamese messages.
 */

export class ApiError extends Error {
  public status?: number;
  public code?: string;
  public response?: any;
  public data?: any;

  constructor(message: string, status?: number, response?: any, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.response = response;
    this.data = response?.data;
    this.code = code;

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Common English to Vietnamese error translation dictionary.
 * Matches case-insensitively against error messages or details returned by servers / SDKs.
 */
const ERROR_TRANSLATIONS: Array<{ pattern: RegExp | string; translation: string }> = [
  // Auth & Account
  {
    pattern: /email already (registered|in use|exists)/i,
    translation: "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.",
  },
  {
    pattern: /username (already taken|exists|is taken)/i,
    translation: "Tên người dùng này đã có người sử dụng. Vui lòng chọn tên khác.",
  },
  {
    pattern: /bad credentials|invalid (email or )?password|unauthorized/i,
    translation: "Email hoặc mật khẩu không chính xác.",
  },
  {
    pattern: /user (not found|doesn'?t exist)/i,
    translation: "Không tìm thấy tài khoản người dùng.",
  },
  {
    pattern: /account (is )?(locked|disabled|suspended)/i,
    translation: "Tài khoản của bạn tạm thời bị khóa. Vui lòng liên hệ hỗ trợ.",
  },
  {
    pattern: /token (is )?(expired|invalid)/i,
    translation: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  },
  {
    pattern: /cannot follow (yourself|oneself)/i,
    translation: "Bạn không thể tự theo dõi chính mình.",
  },
  {
    pattern: /already following/i,
    translation: "Bạn đã theo dõi người dùng này rồi.",
  },

  // Shop & Gamification
  {
    pattern: /insufficient (coins|funds|balance)|not enough coins/i,
    translation: "Bạn không có đủ xu để thực hiện giao dịch này.",
  },
  {
    pattern: /inventory (is )?full/i,
    translation: "Túi đồ của bạn đã đầy. Hãy dùng bớt vật phẩm trước nhé.",
  },
  {
    pattern: /item (not found|does not exist)/i,
    translation: "Vật phẩm không tồn tại hoặc đã ngừng bán.",
  },
  {
    pattern: /insufficient energy|not enough energy/i,
    translation: "Bạn không đủ năng lượng để tiếp tục bài học.",
  },

  // Social & Posts
  {
    pattern: /post (not found|does not exist|deleted)/i,
    translation: "Bài viết không tồn tại hoặc đã bị xóa.",
  },
  {
    pattern: /comment (not found|does not exist|deleted)/i,
    translation: "Bình luận không tồn tại hoặc đã bị xóa.",
  },

  // Network & System
  {
    pattern: /network error|failed to connect|net::err/i,
    translation: "Không có kết nối mạng. Vui lòng kiểm tra lại Wi-Fi hoặc 4G.",
  },
  {
    pattern: /timeout|econnaborted|timed out/i,
    translation: "Kết nối tới máy chủ quá thời gian. Vui lòng thử lại sau.",
  },
  {
    pattern: /internal server error/i,
    translation: "Hệ thống máy chủ gặp sự cố. Vui lòng thử lại sau ít phút.",
  },

  // OAuth / Google / Facebook SDKs
  {
    pattern: /developer_error/i,
    translation: "Cấu hình dịch vụ đăng nhập chưa chính xác trên thiết bị.",
  },
  {
    pattern: /play_services_not_available/i,
    translation: "Google Play Services không khả dụng trên thiết bị này.",
  },
];

/**
 * Fallback messages based on HTTP Status Codes.
 */
const HTTP_STATUS_FALLBACKS: Record<number, string> = {
  400: "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.",
  401: "Phiên đăng nhập đã hết hạn hoặc thông tin xác thực không đúng.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu yêu cầu.",
  408: "Yêu cầu đã quá thời gian phản hồi. Vui lòng thử lại.",
  409: "Dữ liệu đã tồn tại hoặc xảy ra xung đột.",
  422: "Dữ liệu gửi lên không đúng định dạng yêu cầu.",
  429: "Bạn đang thao tác quá nhanh. Vui lòng thử lại sau ít phút.",
  500: "Hệ thống máy chủ gặp sự cố. Vui lòng thử lại sau ít phút.",
  502: "Máy chủ tạm thời không thể kết nối. Vui lòng thử lại sau.",
  503: "Dịch vụ đang tạm thời bảo trì hoặc quá tải. Vui lòng thử lại sau.",
  504: "Cổng kết nối máy chủ quá thời gian phản hồi. Vui lòng thử lại sau.",
};

/**
 * Translate a message string using the dictionary if a pattern matches.
 */
export function translateErrorMessage(rawMessage: string): string {
  if (!rawMessage || typeof rawMessage !== "string") {
    return "";
  }

  const trimmed = rawMessage.trim();

  // If the message already contains Vietnamese characters (accents), return directly
  const hasVietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
    trimmed,
  );
  if (hasVietnameseChars) {
    return trimmed;
  }

  // Search dictionary
  for (const item of ERROR_TRANSLATIONS) {
    if (typeof item.pattern === "string") {
      if (trimmed.toLowerCase().includes(item.pattern.toLowerCase())) {
        return item.translation;
      }
    } else if (item.pattern.test(trimmed)) {
      return item.translation;
    }
  }

  return trimmed;
}

/**
 * Safely extracts a user-friendly error message from any error object.
 */
export function extractApiErrorMessage(error: any, fallbackMessage?: string): string {
  if (!error) {
    return fallbackMessage || "Đã xảy ra lỗi không xác định.";
  }

  // If it's already an ApiError with a localized message
  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  const response = error.response;
  const status = response?.status || error.status;
  const data = response?.data || error.data;

  // 1. Check RFC 7807 ProblemDetail `detail` (Spring Boot 3 default format for exceptions)
  if (data && typeof data.detail === "string" && data.detail.trim()) {
    const translated = translateErrorMessage(data.detail);
    if (translated) return translated;
  }

  // 2. Check standard Spring / custom response `message`
  if (data && typeof data.message === "string" && data.message.trim()) {
    const translated = translateErrorMessage(data.message);
    if (translated) return translated;
  }

  // 3. Check Spring Boot validation field errors or array
  if (data && Array.isArray(data.errors) && data.errors.length > 0) {
    const firstError = data.errors[0];
    if (typeof firstError === "string") {
      return translateErrorMessage(firstError);
    }
    if (firstError?.defaultMessage) {
      return translateErrorMessage(firstError.defaultMessage);
    }
  }

  // 4. Check FastAPI validation `detail` array: [{ loc: [...], msg: "...", type: "..." }]
  if (data && Array.isArray(data.detail) && data.detail.length > 0) {
    const firstItem = data.detail[0];
    if (typeof firstItem === "string") {
      return translateErrorMessage(firstItem);
    }
    if (firstItem?.msg) {
      return translateErrorMessage(firstItem.msg);
    }
  }

  // 5. Check standard `error` property in data
  if (data && typeof data.error === "string" && data.error.trim()) {
    const translated = translateErrorMessage(data.error);
    if (translated) return translated;
  }

  // 6. Check Axios network error or timeout codes
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    return "Kết nối tới máy chủ quá thời gian. Vui lòng kiểm tra lại mạng.";
  }
  if (error.code === "ERR_NETWORK" || (typeof error.message === "string" && /network error/i.test(error.message))) {
    return "Không có kết nối mạng. Vui lòng kiểm tra lại Wi-Fi hoặc 4G.";
  }

  // 7. Check if error.message has a status code pattern (e.g. "Request failed with status code 409")
  // Do NOT show raw Axios HTTP status text to user!
  const statusMatch = typeof error.message === "string" && error.message.match(/status code (\d+)/i);
  const matchedStatus = statusMatch ? parseInt(statusMatch[1], 10) : status;

  if (matchedStatus && HTTP_STATUS_FALLBACKS[matchedStatus]) {
    return HTTP_STATUS_FALLBACKS[matchedStatus];
  }

  // 8. If error.message exists and is NOT a raw Axios status error
  if (typeof error.message === "string" && error.message.trim()) {
    const msg = error.message.trim();
    if (!/status code \d+/i.test(msg) && !/axios/i.test(msg) && msg !== "API Error") {
      const translated = translateErrorMessage(msg);
      const hasVietnameseChars = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(
        msg,
      );
      if (translated !== msg || hasVietnameseChars) {
        return translated;
      }
      if (fallbackMessage) {
        return fallbackMessage;
      }
      return translated;
    }
  }

  // 9. Status code fallback
  if (status && HTTP_STATUS_FALLBACKS[status]) {
    return HTTP_STATUS_FALLBACKS[status];
  }

  return fallbackMessage || "Đã xảy ra lỗi. Vui lòng thử lại sau.";
}
