/**
 * StrokeOrderCanvas - Bảng tập viết theo thứ tự nét.
 *
 * Không dùng `hanzi-writer` (thư viện đó cần DOM của trình duyệt, không chạy
 * được trên React Native). Thay vào đó: `react-native-svg` để vẽ nét mẫu +
 * bộ chấm điểm trong `@/utils/stroke-order` để bắt lỗi sai nét / ngược chiều.
 */

import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/contexts/theme-context";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import {
  estimateViewBoxSize,
  gradeStroke,
  parseStrokeOrderData,
  sampleStrokePath,
  toSvgPathData,
  type StrokeGrade,
  type StrokePoint,
} from "@/utils/stroke-order";

interface StrokeOrderCanvasProps {
  symbol: string;
  strokeOrderData?: string | null;
  /** Cạnh của khung vẽ (px). */
  size?: number;
  /** Vẽ sai quá số lần này thì câu vẫn qua nhưng bị tính là SAI. */
  maxMistakes?: number;
  onComplete: (isCorrect: boolean) => void;
}

const FEEDBACK_MESSAGES: Record<NonNullable<StrokeGrade["reason"]>, string> = {
  reversed: "Nét bị vẽ ngược chiều. Hãy viết từ điểm chấm xanh đi ra nhé!",
  "off-path": "Chưa bám sát nét mẫu. Tô theo nét mờ thử lại nào!",
  "too-short": "Nét quá ngắn. Kéo trọn nét rồi hãy nhấc tay lên.",
};

export function StrokeOrderCanvas({
  symbol,
  strokeOrderData,
  size = 280,
  maxMistakes = 2,
  onComplete,
}: StrokeOrderCanvasProps) {
  const { colors, isDark } = useTheme();

  const strokes = useMemo(
    () => parseStrokeOrderData(strokeOrderData),
    [strokeOrderData],
  );
  const viewBoxSize = useMemo(() => estimateViewBoxSize(strokes), [strokes]);
  const sampledStrokes = useMemo(
    () => strokes.map((stroke) => sampleStrokePath(stroke.path)),
    [strokes],
  );
  const hasGuide = strokes.length > 0;

  const [strokeIndex, setStrokeIndex] = useState(0);
  const strokeIndexRef = useRef(0);
  // Số lần vẽ sai chỉ dùng cho việc chấm điểm, không hiển thị -> giữ trong ref.
  const mistakesRef = useRef(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [drawing, setDrawing] = useState<StrokePoint[]>([]);
  // Nét đang vẽ được giữ trong ref: các sự kiện chạm bắn ra nhanh hơn nhịp
  // re-render, đọc từ state sẽ mất điểm.
  const drawingRef = useRef<StrokePoint[]>([]);
  /** Nét tự do (khi backend chưa có strokeOrderData). */
  const [freePaths, setFreePaths] = useState<StrokePoint[][]>([]);
  const completedRef = useRef(false);

  const scale = viewBoxSize / size;
  const toViewBox = useCallback(
    (event: GestureResponderEvent): StrokePoint => ({
      x: event.nativeEvent.locationX * scale,
      y: event.nativeEvent.locationY * scale,
    }),
    [scale],
  );

  const handleTouchStart = (event: GestureResponderEvent) => {
    if (completedRef.current) return;
    setFeedback(null);
    drawingRef.current = [toViewBox(event)];
    setDrawing(drawingRef.current);
  };

  const handleTouchMove = (event: GestureResponderEvent) => {
    if (completedRef.current) return;
    drawingRef.current = [...drawingRef.current, toViewBox(event)];
    setDrawing(drawingRef.current);
  };

  const handleTouchEnd = () => {
    if (completedRef.current) return;
    const points = drawingRef.current;
    drawingRef.current = [];
    setDrawing([]);
    if (points.length === 0) return;

    if (!hasGuide) {
      setFreePaths((previous) => [...previous, points]);
      return;
    }

    const currentIndex = strokeIndexRef.current;
    const grade = gradeStroke(
      points,
      sampledStrokes[currentIndex],
      viewBoxSize,
    );

    if (!grade.passed) {
      const nextMistakes = mistakesRef.current + 1;
      mistakesRef.current = nextMistakes;
      setFeedback(
        FEEDBACK_MESSAGES[grade.reason ?? "off-path"] ??
          FEEDBACK_MESSAGES["off-path"],
      );
      if (nextMistakes >= maxMistakes) setShowHint(true);
      return;
    }

    const nextIndex = currentIndex + 1;
    strokeIndexRef.current = nextIndex;
    setStrokeIndex(nextIndex);
    setShowHint(false);
    setFeedback(null);

    if (nextIndex >= sampledStrokes.length) {
      completedRef.current = true;
      onComplete(mistakesRef.current <= maxMistakes);
    }
  };

  const hasDrawn = freePaths.length > 0 || drawing.length > 0;

  const finishFreeDrawing = () => {
    if (completedRef.current || !hasDrawn) return;
    completedRef.current = true;
    onComplete(true);
  };

  const isCompound = symbol.length > 1;
  const strokeWidth = viewBoxSize * (isCompound ? 0.045 : 0.07);
  const ghostFontSize = Math.round(size * (isCompound ? 0.36 : 0.55));
  const target = sampledStrokes[strokeIndex];
  const canvasBackground = isDark ? "#232338" : Colors.cream;

  return (
    <View style={styles.container}>
      <View style={styles.metaRow}>
        <Text style={[styles.meta, { color: colors.textSecondary }]}>
          {hasGuide
            ? `Nét ${Math.min(strokeIndex + 1, strokes.length)}/${strokes.length}`
            : "Viết tự do"}
        </Text>
        {hasGuide && (
          <AnimatedPressable
            onPress={() => setShowHint((value) => !value)}
            pressScale={0.94}
            accessibilityLabel="Xem gợi ý nét viết"
            style={styles.hintButton}
          >
            <Ionicons name="bulb-outline" size={16} color={Colors.accent} />
            <Text style={styles.hintText}>Gợi ý</Text>
          </AnimatedPressable>
        )}
      </View>

      <View
        testID="stroke-order-canvas"
        style={[
          styles.canvas,
          {
            width: size,
            height: size,
            backgroundColor: canvasBackground,
            borderColor: colors.border,
          },
        ]}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <Svg
          width={size}
          height={size}
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        >
          {/* Ô kẻ ly */}
          <Line
            x1={viewBoxSize / 2}
            y1={0}
            x2={viewBoxSize / 2}
            y2={viewBoxSize}
            stroke={colors.borderSubtle}
            strokeWidth={1}
            strokeDasharray="6 6"
          />
          <Line
            x1={0}
            y1={viewBoxSize / 2}
            x2={viewBoxSize}
            y2={viewBoxSize / 2}
            stroke={colors.borderSubtle}
            strokeWidth={1}
            strokeDasharray="6 6"
          />

          {/* Nét mẫu còn lại (mờ) */}
          {sampledStrokes.map((points, index) =>
            index >= strokeIndex ? (
              <Path
                key={`ghost-${index}`}
                d={toSvgPathData(points)}
                stroke={colors.border}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={index === strokeIndex ? 0.55 : 0.25}
              />
            ) : null,
          )}

          {/* Nét đã viết đúng */}
          {sampledStrokes.map((points, index) =>
            index < strokeIndex ? (
              <Path
                key={`done-${index}`}
                d={toSvgPathData(points)}
                stroke={Colors.primary}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ) : null,
          )}

          {/* Gợi ý: nét đang cần viết + điểm bắt đầu */}
          {hasGuide && target && (showHint || strokeIndex === 0) && (
            <>
              {showHint && (
                <Path
                  d={toSvgPathData(target)}
                  stroke={Colors.accent}
                  strokeWidth={strokeWidth * 0.5}
                  strokeLinecap="round"
                  strokeDasharray={`${viewBoxSize * 0.04} ${viewBoxSize * 0.04}`}
                  fill="none"
                />
              )}
              <Circle
                cx={target[0].x}
                cy={target[0].y}
                r={viewBoxSize * 0.035}
                fill={Colors.success}
              />
            </>
          )}

          {/* Nét tự do đã vẽ (khi không có dữ liệu nét mẫu) */}
          {freePaths.map((points, index) => (
            <Path
              key={`free-${index}`}
              d={toSvgPathData(points)}
              stroke={Colors.primary}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}

          {/* Nét đang vẽ */}
          {drawing.length > 0 && (
            <Path
              d={toSvgPathData(drawing)}
              stroke={Colors.secondary}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </Svg>

        {!hasGuide && (
          <Text
            style={[styles.ghostSymbol, { fontSize: ghostFontSize }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            pointerEvents="none"
          >
            {symbol}
          </Text>
        )}
      </View>

      {feedback && (
        <View style={styles.feedbackBox}>
          <Ionicons name="alert-circle" size={16} color={Colors.error} />
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      <View style={styles.actionRow}>
        <AnimatedPressable
          onPress={() => {
            drawingRef.current = [];
            strokeIndexRef.current = 0;
            setDrawing([]);
            setFreePaths([]);
            setStrokeIndex(0);
            setShowHint(false);
            setFeedback(null);
          }}
          pressScale={0.94}
          style={[styles.secondaryAction, { borderColor: colors.border }]}
          accessibilityLabel="Viết lại từ đầu"
        >
          <Ionicons name="refresh" size={16} color={colors.textSecondary} />
          <Text style={[styles.secondaryText, { color: colors.textSecondary }]}>
            Viết lại
          </Text>
        </AnimatedPressable>

        {!hasGuide && (
          <AnimatedPressable
            onPress={finishFreeDrawing}
            disabled={!hasDrawn}
            pressScale={0.94}
            style={[styles.primaryAction, !hasDrawn && styles.actionDisabled]}
            accessibilityLabel="Xác nhận đã viết xong"
          >
            <Text
              style={[
                styles.primaryText,
                !hasDrawn && styles.actionDisabledText,
              ]}
            >
              Tôi đã viết xong
            </Text>
          </AnimatedPressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: Spacing.three,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  meta: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  hintButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  hintText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.accent,
  },
  canvas: {
    borderRadius: BorderRadius.xxl,
    borderWidth: 2,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  ghostSymbol: {
    position: "absolute",
    color: "rgba(59, 76, 130, 0.12)",
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  feedbackBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.errorLight,
    borderRadius: BorderRadius.lg,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  feedbackText: {
    flex: 1,
    fontSize: FontSizes.sm,
    color: Colors.error,
    fontWeight: FontWeights.semibold,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  secondaryText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  primaryAction: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.extrabold,
  },
  actionDisabled: {
    opacity: 0.45,
  },
  actionDisabledText: {
    opacity: 0.8,
  },
});
