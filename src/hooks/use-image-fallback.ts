/**
 * Ảnh mạng tải hỏng thì coi như không có ảnh.
 *
 * `<Image source={{ uri }}>` thất bại IM LẶNG: URL 404, file bị xoá, hay server
 * sập đều chỉ để lại một ô trống — không lỗi, không log. Mọi chỗ hiển thị ảnh
 * từ backend trong app đều đã có phương án dự phòng sẵn (chữ cái đầu của tên,
 * emoji, icon theo loại vật phẩm), nhưng phương án đó chỉ chạy khi `uri` rỗng
 * chứ không chạy khi `uri` có mà tải không được.
 *
 * Hook này bắc cầu giữa hai trạng thái đó: sau khi `onError` bắn, `uri` trả về
 * `undefined` và component rơi vào đúng nhánh dự phòng nó vốn đã có.
 */

import { useCallback, useState } from "react";

export interface ImageFallback {
  /** URL dùng được, hoặc `undefined` nếu rỗng / đã tải hỏng. */
  uri: string | undefined;
  /** Gắn vào prop `onError` của `<Image>`. */
  onError: () => void;
  /** Đúng khi có URL nhưng tải hỏng — hữu ích nếu muốn hiện thông báo riêng. */
  isBroken: boolean;
}

export function useImageFallback(uri?: string | null): ImageFallback {
  // Lưu chính URL đã hỏng chứ không phải một cờ boolean: khi component được tái
  // sử dụng cho ảnh khác (FlatList recycle một hàng bảng xếp hạng chẳng hạn),
  // URL mới phải được cho cơ hội tải lại thay vì thừa hưởng thất bại của URL cũ.
  const [failedUri, setFailedUri] = useState<string | null>(null);

  const onError = useCallback(() => {
    if (uri) setFailedUri(uri);
  }, [uri]);

  const isBroken = !!uri && failedUri === uri;

  return { uri: isBroken ? undefined : (uri ?? undefined), onError, isBroken };
}
