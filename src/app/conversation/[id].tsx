/**
 * Màn hình hội thoại.
 *
 * Toàn bộ logic vòng đời nằm trong `useConversation`; màn hình này chỉ ghép
 * layout và xử lý tương tác bàn phím / cuộn.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  ChatBubble,
  ChatComposer,
  GrammarNoteCard,
  HintChips,
} from "@/components/conversation";
import { useConversation } from "@/hooks/use-conversation";
import { useJapaneseSpeech } from "@/hooks/use-japanese-speech";
import { useSpeechInput } from "@/hooks/use-speech-input";
import { useTheme } from "@/contexts/theme-context";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import type { ConversationUtterance } from "@/types/conversation";

export default function ConversationChatScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const scenarioId = id ?? "";

  const { status, messages, hints, failures, rescue, error, send, restart } =
    useConversation(scenarioId);

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

  // Cuộn xuống cuối mỗi khi có tin nhắn mới - người học phải luôn thấy lượt
  // mới nhất mà không phải tự vuốt.
  useEffect(() => {
    const timer = setTimeout(
      () => scrollRef.current?.scrollToEnd({ animated: true }),
      80,
    );
    return () => clearTimeout(timer);
  }, [messages.length, hints]);

  const handleSend = useCallback(async () => {
    const text = draft;
    setDraft("");
    await send(text);
  }, [draft, send]);

  const handlePickHint = useCallback((hint: ConversationUtterance) => {
    // Điền vào ô nhập chứ KHÔNG gửi luôn: người học còn kịp đọc và sửa, tức là
    // vẫn học được gì đó chứ không chỉ bấm cho xong.
    setDraft(hint.ja);
  }, []);

  const finished = status === "finished";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <AnimatedPressable
          onPress={() => router.back()}
          pressScale={0.9}
          accessibilityRole="button"
          accessibilityLabel="Thoát hội thoại"
          style={styles.headerButton}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </AnimatedPressable>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Hội thoại
        </Text>

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
          style={styles.headerButton}
        >
          <Ionicons
            name={autoSpeak ? "volume-medium" : "volume-mute"}
            size={20}
            color={autoSpeak ? Colors.primary : colors.textSecondary}
          />
        </AnimatedPressable>

        <AnimatedPressable
          onPress={restart}
          pressScale={0.9}
          accessibilityRole="button"
          accessibilityLabel="Bắt đầu lại"
          style={styles.headerButton}
        >
          <Ionicons name="refresh" size={20} color={colors.textSecondary} />
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
                    onSpeak={handleSpeak}
                    speaking={speakingText === message.ja}
                  />
                  {message.grammarNotes?.length ? (
                    <GrammarNoteCard notes={message.grammarNotes} />
                  ) : null}
                </React.Fragment>
              ))}

              {finished ? (
                <View
                  style={[
                    styles.finishedCard,
                    {
                      backgroundColor: Colors.accent + "18",
                      borderColor: Colors.accent,
                    },
                  ]}
                >
                  <Ionicons name="trophy" size={28} color={Colors.accent} />
                  <Text style={[styles.finishedTitle, { color: colors.text }]}>
                    Hoàn thành hội thoại!
                  </Text>
                  <Text
                    style={[
                      styles.finishedDesc,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Bạn đã đi hết tình huống này bằng tiếng Nhật.
                  </Text>
                  <AnimatedPressable
                    onPress={restart}
                    pressScale={0.95}
                    accessibilityRole="button"
                    accessibilityLabel="Luyện lại tình huống này"
                    style={[
                      styles.retryButton,
                      { backgroundColor: Colors.primary },
                    ]}
                  >
                    <Text style={styles.retryText}>Luyện lại</Text>
                  </AnimatedPressable>
                </View>
              ) : null}
            </ScrollView>

            {/*
              Lỗi micro hiển thị cùng chỗ với lỗi mạng, nhưng KHÔNG chặn gì cả:
              gõ chữ vẫn dùng được bình thường. Giọng nói là tuỳ chọn thêm, hỏng
              nó không được làm hỏng cả bài luyện.
            */}
            {error || speech.error ? (
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

            {!finished ? (
              <>
                <HintChips
                  hints={hints}
                  failures={failures}
                  rescue={rescue}
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
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.extrabold,
  },
  messages: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
    padding: Spacing.six,
  },
  centerText: {
    fontSize: FontSizes.sm,
    textAlign: "center",
  },
  retryButton: {
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.three,
    borderRadius: BorderRadius.full,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
  },
  finishedCard: {
    alignItems: "center",
    gap: Spacing.two,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.five,
    marginTop: Spacing.three,
  },
  finishedTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
  },
  finishedDesc: {
    fontSize: FontSizes.sm,
    textAlign: "center",
    marginBottom: Spacing.two,
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
    fontSize: FontSizes.xs,
    color: Colors.error,
  },
});
