/**
 * SpotlightTarget — bọc quanh phần tử muốn tour chiếu đèn vào.
 *
 * Chỉ làm đúng một việc: giữ một ref và đăng ký nó với `TutorialContext` để lúc
 * chạy tour context đo được toạ độ. Không có provider thì thành phần này chỉ là
 * một `<View>` trong suốt, nên gắn vào màn hình nào cũng an toàn.
 */

import React, { useEffect, useRef } from "react";
import { View, type StyleProp, type ViewStyle } from "react-native";

import { useTutorial } from "@/contexts/tutorial-context";
import type { TutorialTargetId } from "@/types";

interface SpotlightTargetProps {
  targetId: TutorialTargetId;
  /** Đặt `false` khi phần tử này không phải là cái cần chiếu (vd node không active). */
  enabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function SpotlightTarget({
  targetId,
  enabled = true,
  style,
  children,
}: SpotlightTargetProps) {
  const { registerTarget } = useTutorial();
  const ref = useRef<View>(null);

  useEffect(() => {
    if (!enabled) {
      registerTarget(targetId, null);
      return;
    }
    registerTarget(targetId, ref.current);
    return () => registerTarget(targetId, null);
  }, [enabled, targetId, registerTarget]);

  return (
    // `collapsable={false}` là bắt buộc: nếu không, Android gộp View "rỗng" này
    // vào cha và ref trỏ vào hư không, `measureInWindow` trả về 0.
    <View ref={ref} collapsable={false} style={style}>
      {children}
    </View>
  );
}
