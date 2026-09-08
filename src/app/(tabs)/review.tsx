import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { SpotlightTarget } from "@/components/tutorial";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import { useTheme } from "@/contexts/theme-context";
import { vocabularyApi } from "@/services/api/vocabulary";
import { mistakesApi } from "@/services/api/mistakes";
import { useTutorial } from "@/contexts/tutorial-context";
import { StaggeredList } from "@/components/ui/staggered-list";
import {
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
  BorderRadius,
  Shadows,
} from "@/constants/theme";
import type { TutorialScrollIntoView, TutorialTargetId } from "@/types";

interface PracticeItem {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  badge?: string;
  color: string;
  /** Mốc của tour hướng dẫn — bỏ trống thì thẻ này không được chiếu sáng. */
  tutorialTarget?: TutorialTargetId;
}

/** Chỗ mong muốn của phần tử được chiếu sáng, tính từ mép trên cửa sổ. */
const SPOTLIGHT_DESIRED_TOP = 200;

export default function PracticeHubScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { registerScroller } = useTutorial();
  const scrollRef = React.useRef<ScrollView>(null);
  const scrollYRef = React.useRef(0);
  const [mistakeCount, setMistakeCount] = React.useState<number>(0);
  const [loading, setLoading] = React.useState<boolean>(true);
  /** Số từ tới hạn ôn hôm nay — số này mới là thứ dẫn người học quay lại. */
  const [dueCount, setDueCount] = React.useState<number>(0);

  // Đọc lại MỖI LẦN màn này được tiêu điểm, không phải một lần lúc mount.
  //
  // Cả hai con số đều thay đổi ngay bên trong app: ôn xong một phiên là số từ
  // tới hạn tụt xuống, làm xong một bài là số lỗi sai đổi. Màn này nằm trong
  // `(tabs)` nên một khi đã mở là còn sống mãi — dùng `useEffect` thì người
  // học ôn xong quay về vẫn thấy y nguyên con số cũ.
  useFocusEffect(
    React.useCallback(() => {
      let cancelled = false;

      // Hỏng thì để 0 chứ không chặn cả màn hình: các mục luyện tập khác vẫn
      // phải bấm được.
      vocabularyApi
        .getDue(1)
        .then((res) => !cancelled && setDueCount(res.dueCount))
        .catch(() => !cancelled && setDueCount(0));

      mistakesApi
        .getSummary()
        .then((res) => {
          if (cancelled) return;
          setMistakeCount(res.activeCount);
          setLoading(false);
        })
        .catch(() => !cancelled && setLoading(false));

      return () => {
        cancelled = true;
      };
    }, []),
  );

  /*
   * Tour hướng dẫn chiếu tới cả những thẻ nằm dưới nếp gấp. Màn hình tự nhận
   * việc kéo chúng lên vì chỉ nó biết vị trí cuộn hiện tại — lớp phủ chỉ biết
   * toạ độ tuyệt đối của phần tử.
   */
  const scrollIntoView = React.useCallback<TutorialScrollIntoView>((rect) => {
    scrollRef.current?.scrollTo({
      y: Math.max(0, scrollYRef.current + rect.y - SPOTLIGHT_DESIRED_TOP),
      animated: true,
    });
  }, []);

  // Theo TIÊU ĐIỂM chứ không theo vòng đời: màn này nằm trong `(tabs)` nên một
  // khi đã mở là còn sống mãi, `useEffect` sẽ không chạy lại ở lần ghé sau.
  useFocusEffect(
    React.useCallback(() => {
      registerScroller(scrollIntoView);
      return () => registerScroller(null);
    }, [registerScroller, scrollIntoView]),
  );

  const primaryItems: PracticeItem[] = [
    {
      id: "p0",
      tutorialTarget: "review-vocab",
      title: "Ôn tập từ vựng",
      description:
        dueCount > 0
          ? "Có từ sắp quên — ôn lại ngay để nhớ lâu."
          : "Chưa có từ nào tới hạn. Học bài mới để mở thêm từ nhé!",
      icon: "time-outline",
      route: "/review/vocabulary",
      badge: loading ? "..." : dueCount > 0 ? `${dueCount} từ` : undefined,
      color: Colors.accent,
    },
    {
      id: "p1",
      tutorialTarget: "review-mistakes",
      title: "Luyện tập Lỗi Sai",
      description: "Xem lại và giải quyết các câu bạn từng làm sai.",
      icon: "warning-outline",
      route: "/review/mistakes",
      badge: loading
        ? "..."
        : mistakeCount > 0
          ? `${mistakeCount} lỗi`
          : undefined,
      color: Colors.error,
    },
    {
      id: "p2",
      tutorialTarget: "review-conversation",
      title: "Luyện hội thoại AI",
      description: "Đóng vai tình huống thật và nói chuyện bằng tiếng Nhật.",
      icon: "chatbubbles-outline",
      route: "/conversation",
      badge: "Mới",
      color: Colors.primary,
    },
    {
      id: "p3",
      tutorialTarget: "review-dictionary",
      title: "Sổ tay Từ điển",
      description: "Ôn tập và kiểm tra từ vựng bạn đã mở khóa.",
      icon: "book-outline",
      route: "/dictionary",
      color: Colors.primary,
    },
  ];

  const additionalItems: PracticeItem[] = [
    {
      id: "p5",
      tutorialTarget: "review-pronunciation",
      title: "Luyện phát âm chuyên sâu",
      description: "Nghe giọng bản xứ và tập nói lại chuẩn xác.",
      icon: "mic-outline",
      route: "/voice/record",
      color: Colors.success,
    },
  ];

  const renderCard = (item: PracticeItem) => {
    const card = (
      <AnimatedPressable
        key={item.id}
        style={[
          styles.card,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
        onPress={() => router.push(item.route as any)}
        pressScale={0.97}
      >
        <View
          style={[styles.iconContainer, { backgroundColor: item.color + "15" }]}
        >
          <Ionicons name={item.icon} size={28} color={item.color} />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.titleRow}>
            <Text style={[styles.itemTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            {item.badge ? (
              <View style={[styles.badge, { backgroundColor: item.color }]}>
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[styles.itemDesc, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        </View>
        <View style={styles.arrowContainer}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textSecondary}
          />
        </View>
      </AnimatedPressable>
    );

    if (!item.tutorialTarget) return card;
    return (
      <SpotlightTarget key={item.id} targetId={item.tutorialTarget}>
        {card}
      </SpotlightTarget>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Trung tâm luyện tập
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          scrollYRef.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={32}
      >
        {/* Intro Banner */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={[
            styles.introBanner,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.introIconContainer}>
            <Ionicons name="barbell" size={32} color={Colors.primary} />
          </View>
          <View style={styles.introInfo}>
            <Text style={[styles.introTitle, { color: colors.text }]}>
              Nâng cao phản xạ
            </Text>
            <Text style={[styles.introDesc, { color: colors.textSecondary }]}>
              Ôn luyện hằng ngày giúp bạn nhớ lâu hơn gấp 4 lần.
            </Text>
          </View>
        </Animated.View>

        {/* Section 1 */}
        <Animated.Text
          entering={FadeIn.delay(100).duration(400)}
          style={[styles.sectionTitle, { color: colors.textSecondary }]}
        >
          Luyện tập kỹ năng
        </Animated.Text>
        <StaggeredList staggerDelay={80} initialDelay={200}>
          {[...primaryItems, ...additionalItems].map(renderCard)}
        </StaggeredList>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingVertical: Spacing.four,
    alignItems: "center",
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    paddingBottom: 100,
  },
  introBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.xxl,
    padding: Spacing.four,
    marginBottom: Spacing.six,
    gap: Spacing.four,
    ...Shadows.sm,
    borderWidth: 1,
  },
  introIconContainer: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
  },
  introInfo: {
    flex: 1,
  },
  introTitle: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  introDesc: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.sm,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.three,
    marginLeft: Spacing.two,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.xl,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    ...Shadows.sm,
    borderWidth: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.three,
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  itemTitle: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 22,
  },
  badgeText: {
    fontFamily: Fonts.rounded,
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 0.3,
  },
  itemDesc: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  arrowContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(59, 76, 130, 0.1)", // Primary with opacity
    alignItems: "center",
    justifyContent: "center",
  },
});
