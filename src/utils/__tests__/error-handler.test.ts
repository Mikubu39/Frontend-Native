import {
  ApiError,
  extractApiErrorMessage,
  translateErrorMessage,
} from "../error-handler";

describe("error-handler utilities", () => {
  describe("translateErrorMessage", () => {
    it("translates common English backend messages to Vietnamese", () => {
      expect(translateErrorMessage("Email already registered")).toBe(
        "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.",
      );
      expect(translateErrorMessage("Bad credentials")).toBe(
        "Email hoặc mật khẩu không chính xác.",
      );
      expect(translateErrorMessage("User not found")).toBe(
        "Không tìm thấy tài khoản người dùng.",
      );
      expect(translateErrorMessage("Username already taken")).toBe(
        "Tên người dùng này đã có người sử dụng. Vui lòng chọn tên khác.",
      );
      expect(translateErrorMessage("Insufficient coins")).toBe(
        "Bạn không có đủ xu để thực hiện giao dịch này.",
      );
      expect(translateErrorMessage("Inventory full")).toBe(
        "Túi đồ của bạn đã đầy. Hãy dùng bớt vật phẩm trước nhé.",
      );
      expect(translateErrorMessage("Cannot follow yourself")).toBe(
        "Bạn không thể tự theo dõi chính mình.",
      );
      expect(translateErrorMessage("Network Error")).toBe(
        "Không có kết nối mạng. Vui lòng kiểm tra lại Wi-Fi hoặc 4G.",
      );
    });

    it("preserves messages that are already in Vietnamese", () => {
      const vnMessage = "Email hoặc mật khẩu không đúng";
      expect(translateErrorMessage(vnMessage)).toBe(vnMessage);
    });
  });

  describe("extractApiErrorMessage", () => {
    it("extracts and translates Spring Boot 3 RFC 7807 ProblemDetail", () => {
      const error = {
        response: {
          status: 409,
          data: {
            title: "Conflict",
            status: 409,
            detail: "Email already registered",
            instance: "/api/v1/auth/register",
          },
        },
      };
      expect(extractApiErrorMessage(error)).toBe(
        "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.",
      );
    });

    it("extracts Spring Boot standard message", () => {
      const error = {
        response: {
          status: 401,
          data: {
            error: "Unauthorized",
            message: "Email hoặc mật khẩu không đúng",
            status: 401,
          },
        },
      };
      expect(extractApiErrorMessage(error)).toBe(
        "Email hoặc mật khẩu không đúng",
      );
    });

    it("extracts Spring Boot validation errors array", () => {
      const error = {
        response: {
          status: 400,
          data: {
            errors: ["Email không hợp lệ"],
          },
        },
      };
      expect(extractApiErrorMessage(error)).toBe("Email không hợp lệ");
    });

    it("extracts FastAPI detail array", () => {
      const error = {
        response: {
          status: 422,
          data: {
            detail: [
              {
                loc: ["body", "password"],
                msg: "Field required",
                type: "value_error.missing",
              },
            ],
          },
        },
      };
      expect(extractApiErrorMessage(error)).toBe("Field required");
    });

    it("suppresses raw Axios status code text and falls back to Vietnamese status message", () => {
      const error = {
        message: "Request failed with status code 403",
        response: {
          status: 403,
          data: {},
        },
      };
      expect(extractApiErrorMessage(error)).toBe(
        "Bạn không có quyền thực hiện thao tác này.",
      );
    });

    it("handles Network Error properly", () => {
      const error = {
        code: "ERR_NETWORK",
        message: "Network Error",
      };
      expect(extractApiErrorMessage(error)).toBe(
        "Không có kết nối mạng. Vui lòng kiểm tra lại Wi-Fi hoặc 4G.",
      );
    });

    it("handles timeout error properly", () => {
      const error = {
        code: "ECONNABORTED",
        message: "timeout of 10000ms exceeded",
      };
      expect(extractApiErrorMessage(error)).toBe(
        "Kết nối tới máy chủ quá thời gian. Vui lòng kiểm tra lại mạng.",
      );
    });

    it("handles ApiError instance directly", () => {
      const apiError = new ApiError("Lỗi tùy biến", 400);
      expect(extractApiErrorMessage(apiError)).toBe("Lỗi tùy biến");
    });
  });

  describe("ApiError class", () => {
    it("instantiates properly with status and response retained", () => {
      const res = { data: { foo: "bar" } };
      const err = new ApiError("Thông báo lỗi", 400, res, "CUSTOM_ERR");

      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(ApiError);
      expect(err.message).toBe("Thông báo lỗi");
      expect(err.status).toBe(400);
      expect(err.response).toBe(res);
      expect(err.data).toEqual({ foo: "bar" });
      expect(err.code).toBe("CUSTOM_ERR");
    });
  });
});
