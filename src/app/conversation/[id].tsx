/**
 * Màn hình hội thoại.
 *
 * Toàn bộ logic vòng đời (lịch sử, đồng hồ 5 phút, bản tổng kết) nằm trong
 * `useConversation`; màn hình này chỉ ghép layout và xử lý tương tác bàn phím
 * / giọng nói / cuộn.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  ChatBubble,
  ChatComposer,
  CorrectionCard,
  HintChips,
  SessionSummary,
  SessionTimer,
} from "@/components/conversation";
import { useConversation } from "@/hooks/use-conversation";
import { useJapaneseSpeech } from "@/hooks/use-japanese-speech";
import { useSpeechInput } from "@/hooks/use-speech-input";
import { useTheme } from "@/contexts/theme-context";
import { WRAP_UP_WARNING_SECONDS } from "@/constants/conversation";
import {
  BorderRadius,
  Colors,
  Fonts,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import type { ConversationUtterance } from "@/types/conversation";

const TRANSLATION_PREF_KEY = "@nihongo_conversation_show_translation";

export default function ConversationChatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  // `topic` chỉ có mặt khi người học tự nhập chủ đề (route `/conversation/custom`).
  const {
    id,
    topic: customTopic,
    showTranslation: paramShowTranslation,
  } = useLocalSearchParams<{
    id: string;
    topic?: string;
    showTranslation?: string;
  }>();
  const topicId = id ?? "";

  const [showTranslation, setShowTranslation] = useState<boolean>(() => {
    if (paramShowTranslation !== undefined) {
      return paramShowTranslation === "true";
    }
    return true;
  });

  const toggleTranslation = useCallback(async () => {
    setShowTranslation((prev) => {
      const next = !prev;
      AsyncStorage.setItem(TRANSLATION_PREF_KEY, String(next));
      return next;
    });
  }, []);

  const {
    status,
    topic,
    messages,
    hints,
    remainingSeconds,
    summary,
    error,
    summaryError,
    send,
    finishNow,
    retrySummary,
    restart,
  } = useConversation(topicId, customTopic);

  const [draft, setDraft] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  // --- Giọng nói: đọc và nghe, LUÔN song song với việc gõ chữ ---
  const { speak, stop: stopSpeaking, speakingText } = useJapaneseSpeech();

  /** Tự đọc câu của bot. Bật sẵn vì đây là bài luyện NÓI, nhưng tắt được. */
  const [autoSpeak, setAutoSpeak] = useState(true);

  const speech = useSpeechInput({
    // Transcript rơi vào ô nhập chứ không gửi thẳng — người học đọc lại rồi
    // mới bấm gửi. Xem ghi chú trong `use-speech-input.ts`.
    onFinalTranscript: useCallback((text: string) => setDraft(text), []),
  });

  const handleToggleMic = useCallback(() => {
    if (speech.status === "listening") {
      speech.stop();
    } else {
      // Micro và loa không được chạy cùng lúc, nếu không máy sẽ nghe lại chính
      // giọng đọc của bot.
      stopSpeaking();
      speech.start();
    }
  }, [speech, stopSpeaking]);

  const handleSpeak = useCallback(
    (text: string) => {
      if (speakingText === text) {
        stopSpeaking();
        return;
      }
      speak(text);
    },
    [speak, speakingText, stopSpeaking],
  );

  // Tự đọc lượt mới nhất của bot khi nó vừa tới.
  const lastSpokenId = useRef<string | null>(null);
  useEffect(() => {
    if (!autoSpeak) return;
    const last = messages[messages.length - 1];
    if (!last || last.author !== "bot" || !last.ja.trim()) return;
    if (lastSpokenId.current === last.id) return;
    // Đang nghe micro thì không đọc chen vào.
    if (speech.status === "listening") return;

    lastSpokenId.current = last.id;
    speak(last.ja);
  }, [messages, autoSpeak, speak, speech.status]);

  const finished = status === "finished";
  const summarizing = status === "summarizing";
  const sessionOver = finished || summarizing;

  // Thoát khi phiên còn đang diễn ra (chưa `finished`/`summarizing`) sẽ huỷ
  // cuộc hội thoại - cần xác nhận trước, giống flow đăng xuất. Thoát khi
  // phiên đã kết thúc thì vô hại, không cần hỏi lại.
  const handleExit = useCallback(() => {
    if (sessionOver) {
      router.back();
      return;
    }
    Alert.alert("Thoát hội thoại?", "Cuộc hội thoại đang diễn ra sẽ bị huỷ.", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Thoát",
        style: "destructive",
        onPress: () => router.back(),
      },
    ]);
  }, [sessionOver, router]);

  // Phiên kết thúc thì im ngay - để bot đọc nốt câu dở trong khi bản tổng kết
  // hiện ra là thừa và gây nhiễu.
  useEffect(() => {
    if (sessionOver) {
      stopSpeaking();
      if (speech.status === "listening") speech.stop();
    }
  }, [sessionOver, stopSpeaking, speech]);

  // Cuộn xuống cuối mỗi khi có tin nhắn mới - người học phải luôn thấy lượt
  // mới nhất mà không phải tự vuốt.
  useEffect(() => {
    const timer = setTimeout(
      () => scrollRef.current?.scrollToEnd({ animated: true }),
      80,
    );
    return () => clearTimeout(timer);
  }, [messages.length, hints, summary]);

  const pickedHintTranslation = useRef<string>("");

  const handlePickHint = useCallback((hint: ConversationUtterance) => {
    // Điền vào ô nhập chứ KHÔNG gửi luôn: người học còn kịp đọc và sửa, tức là
    // vẫn học được gì đó chứ không chỉ bấm cho xong.
    setDraft(hint.ja);
    pickedHintTranslation.current = hint.vi;
  }, []);

  const handleSend = useCallback(async () => {
    const text = draft;
    const vi = pickedHintTranslation.current;
    setDraft("");
    pickedHintTranslation.current = "";
    await send(text, vi);
  }, [draft, send]);

  const spokenTurns = messages.filter((m) => m.author === "user").length;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <AnimatedPressable
          onPress={handleExit}
          pressScale={0.9}
          accessibilityRole="button"
          accessibilityLabel="Thoát hội thoại"
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </AnimatedPressable>

        <View style={styles.headerTitleBox}>
          <Text
            style={[styles.headerTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {topic?.title ?? "Hội thoại"}
          </Text>
          {topic?.personaName ? (
            <Text
              style={[styles.headerSubtitle, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {topic.personaEmoji} {topic.personaName}
            </Text>
          ) : null}
        </View>

        <SessionTimer
          remainingSeconds={remainingSeconds}
          paused={status === "loading" || status === "error"}
        />

        {/* Nút bật/tắt nhanh hiển thị bản dịch tiếng Việt */}
        <AnimatedPressable
          onPress={toggleTranslation}
          pressScale={0.9}
          accessibilityRole="button"
          accessibilityLabel={
            showTranslation ? "Tắt hiện tiếng Việt" : "Bật hiện tiếng Việt"
          }
          accessibilityState={{ selected: showTranslation }}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          style={styles.headerButton}
        >
          <Ionicons
            name={showTranslation ? "language" : "language-outline"}
            size={20}
            color={showTranslation ? Colors.primary : colors.textSecondary}
          />
        </AnimatedPressable>

        <AnimatedPressable
          onPress={() => {
            // Tắt tự đọc thì im ngay, đừng bắt nghe hết câu đang dở.
            if (autoSpeak) stopSpeaking();
            setAutoSpeak((on) => !on);
          }}
          pressScale={0.9}
          accessibilityRole="button"
          accessibilityLabel={autoSpeak ? "Tắt tự động đọc" : "Bật tự động đọc"}
          accessibilityState={{ selected: autoSpeak }}
          hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          style={styles.headerButton}
        >
          <Ionicons
            name={autoSpeak ? "volume-medium" : "volume-mute"}
            size={20}
            color={autoSpeak ? Colors.primary : colors.textSecondary}
          />
        </AnimatedPressable>
      </View>

      {/*
        `behavior="padding"` cho CẢ Android chứ không chỉ iOS.
        Từ Android 15 trở lên, chế độ edge-to-edge (Expo SDK 54 bật mặc định)
        khiến `android:windowSoftInputMode="adjustResize"` trong manifest bị
        BỎ QUA - cửa sổ không còn tự co lại khi bàn phím hiện. Để `undefined`
        như mặc định của RN thì ô nhập bị bàn phím che hoàn toàn; đã kiểm
        chứng trên emulator Android 16 (SDK 37).
      */}
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        {status === "loading" ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.centerText, { color: colors.textSecondary }]}>
              Đang kết nối với AI…
            </Text>
          </View>
        ) : status === "error" ? (
          <View style={styles.centerBox}>
            <Ionicons
              name="cloud-offline-outline"
              size={40}
              color={colors.textSecondary}
            />
            <Text style={[styles.centerText, { color: colors.textSecondary }]}>
              {error}
            </Text>
            <AnimatedPressable
              onPress={restart}
              pressScale={0.95}
              accessibilityRole="button"
              accessibilityLabel="Thử lại"
              style={[styles.retryButton, { backgroundColor: Colors.primary }]}
            >
              <Text style={styles.retryText}>Thử lại</Text>
            </AnimatedPressable>
          </View>
        ) : (
          <>
            <ScrollView
              ref={scrollRef}
              style={styles.flex}
              contentContainerStyle={styles.messages}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {messages.map((message) => (
                <React.Fragment key={message.id}>
                  <ChatBubble
                    message={message}
                    hideTranslation={!showTranslation}
                    onSpeak={handleSpeak}
                    speaking={speakingText === message.ja}
                  />
                  {/*
                    Góp ý nằm dưới chính câu của NGƯỜI HỌC, không phải dưới câu
                    đáp của AI - mắt phải nối được lỗi với chỗ viết sai.
                  */}
                  {message.corrections?.length ? (
                    <CorrectionCard corrections={message.corrections} />
                  ) : null}
                </React.Fragment>
              ))}

              {summarizing ? (
                <View style={styles.summarizingBox}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text
                    style={[styles.centerText, { color: colors.textSecondary }]}
                  >
                    Hết giờ rồi! AI đang xem lại cả buổi nói chuyện…
                  </Text>
                </View>
              ) : null}

              {finished && summary ? (
                <SessionSummary summary={summary} />
              ) : null}

              {finished && summaryError ? (
                <View
                  style={[
                    styles.summaryErrorCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={28}
                    color={Colors.warning}
                  />
                  <Text
                    style={[styles.centerText, { color: colors.textSecondary }]}
                  >
                    {summaryError}
                  </Text>
                  {spokenTurns > 0 ? (
                    <AnimatedPressable
                      onPress={retrySummary}
                      pressScale={0.95}
                      accessibilityRole="button"
                      accessibilityLabel="Thử tổng kết lại"
                      style={[
                        styles.retryButton,
                        { backgroundColor: Colors.primary },
                      ]}
                    >
                      <Text style={styles.retryText}>Thử tổng kết lại</Text>
                    </AnimatedPressable>
                  ) : null}
                </View>
              ) : null}

              {finished ? (
                <View style={styles.finishedActions}>
                  <AnimatedPressable
                    onPress={restart}
                    pressScale={0.95}
                    accessibilityRole="button"
                    accessibilityLabel="Luyện lại chủ đề này"
                    style={[
                      styles.primaryButton,
                      { backgroundColor: Colors.primary },
                    ]}
                  >
                    <Ionicons name="refresh" size={18} color="#FFFFFF" />
                    <Text style={styles.retryText}>Luyện lại</Text>
                  </AnimatedPressable>

                  <AnimatedPressable
                    onPress={() => router.back()}
                    pressScale={0.95}
                    accessibilityRole="button"
                    accessibilityLabel="Chọn chủ đề khác"
                    style={[
                      styles.secondaryButton,
                      { borderColor: colors.border },
                    ]}
                  >
                    <Text
                      style={[styles.secondaryText, { color: colors.text }]}
                    >
                      Chọn chủ đề khác
                    </Text>
                  </AnimatedPressable>
                </View>
              ) : null}
            </ScrollView>

            {/*
              Lỗi micro hiển thị cùng chỗ với lỗi mạng, nhưng KHÔNG chặn gì cả:
              gõ chữ vẫn dùng được bình thường. Giọng nói là tuỳ chọn thêm, hỏng
              nó không được làm hỏng cả bài luyện.
            */}
            {!sessionOver && (error || speech.error) ? (
              <View style={styles.errorBanner}>
                <Ionicons
                  name="warning-outline"
                  size={14}
                  color={Colors.error}
                />
                <Text style={styles.errorBannerText}>
                  {error ?? speech.error}
                </Text>
              </View>
            ) : null}

            {!sessionOver ? (
              <>
                <HintChips
                  hints={hints}
                  prominent={
                    spokenTurns === 0 ||
                    remainingSeconds <= WRAP_UP_WARNING_SECONDS
                  }
                  showTranslation={showTranslation}
                  onPick={handlePickHint}
                />
                <ChatComposer
                  value={draft}
                  onChangeText={setDraft}
                  onSend={handleSend}
                  sending={status === "sending"}
                  listening={speech.status === "listening"}
                  partialTranscript={speech.partialTranscript}
                  lowConfidence={speech.lowConfidence}
                  onToggleMic={handleToggleMic}
                />
                <AnimatedPressable
                  onPress={finishNow}
                  pressScale={0.97}
                  accessibilityRole="button"
                  accessibilityLabel="Kết thúc sớm và xem tổng kết"
                  style={styles.finishEarlyButton}
                >
                  <Ionicons
                    name="flag-outline"
                    size={14}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.finishEarlyText,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Kết thúc và xem tổng kết
                  </Text>
                </AnimatedPressable>
              </>
            ) : null}
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleBox: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.extrabold,
  },
  headerSubtitle: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.xs,
    marginTop: 1,
  },
  messages: {
    padding: Spacing.four,
    paddingBottom: Spacing.eight,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    padding: Spacing.six,
  },
  centerText: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.sm,
    textAlign: "center",
  },
  summarizingBox: {
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.six,
  },
  summaryErrorCard: {
    alignItems: "center",
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.five,
    marginTop: Spacing.three,
  },
  finishedActions: {
    gap: Spacing.three,
    marginTop: Spacing.four,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.four,
    borderRadius: BorderRadius.full,
  },
  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    paddingVertical: Spacing.four,
    borderRadius: BorderRadius.full,
  },
  secondaryText: {
    fontFamily: Fonts.rounded,
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  retryButton: {
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.full,
  },
  retryText: {
    fontFamily: Fonts.rounded,
    color: "#FFFFFF",
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    backgroundColor: Colors.errorLight,
  },
  errorBannerText: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: FontSizes.xs,
    color: Colors.error,
  },
  finishEarlyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.one,
  },
  finishEarlyText: {
    fontFamily: Fonts.sans,
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.semibold,
  },
});
