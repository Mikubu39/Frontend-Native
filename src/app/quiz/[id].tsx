/**
 * Quiz Screen — Impeccable redesign.
 * Theme-aware immersive question experience.
 */

import {
  FillBlankQuestionCard,
  FlashcardQuestionCard,
  KanaQuestionCard,
  KanjiFillQuestionCard,
  ListeningQuestionCard,
  MatchingQuestionCard,
  PictureQuestionCard,
  QuizBottomBar,
  QuizHeader,
  SpeakingQuestionCard,
  TeachCardView,
  VocabQuestionCard,
} from "@/components/quiz";
import { GradientButton } from "@/components/ui/gradient-button";
import { ModalCard } from "@/components/ui/modal-card";
import {
  Colors,
  Spacing,
  FontSizes,
  FontWeights,
  BorderRadius,
  Fonts,
} from "@/constants/theme";
import { useGamification } from "@/contexts/gamification-context";
import { useTheme } from "@/contexts/theme-context";
import { useToast } from "@/contexts/toast-context";
import { lessonAttemptApi } from "@/services/api/lessons";
import type { TeachCard } from "@/types/lesson-intro";
import type { QuizQuestion } from "@/types/quiz";
import { buildTeachCards } from "@/utils/lesson-intro";
import { mapApiQuestionsToQuizQuestions } from "@/utils/quiz-mapper";
import { useSoundEffect } from "@/hooks/use-sound-effect";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInRight,
  FadeInUp,
  FadeOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// 3 mascot mới, hiện ngẫu nhiên ở mọi loại câu hỏi (khác với happy/confuse_mascot
// chỉ dùng riêng cho panel feedback sau khi trả lời).
const QUESTION_MASCOTS = [
  require("../../../assets/animations/character1.json"),
  require("../../../assets/animations/character2.json"),
  require("../../../assets/animations/character3.json"),
];

export default function QuizScreen() {
  const router = useRouter();
  const { lessonId = "lp1" } = useLocalSearchParams<{ lessonId: string }>();
  const { isDark } = useTheme();
  const { playCorrect, playIncorrect } = useSoundEffect();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [currentIsCorrect, setCurrentIsCorrect] = useState<boolean>(false);
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isShowingRedoIntro, setIsShowingRedoIntro] = useState<boolean>(false);
  const [originalQuestionsLength, setOriginalQuestionsLength] =
    useState<number>(0);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  // Phần "dạy trước khi hỏi": bộ thẻ giới thiệu chữ/từ mới, suy ra từ chính đề
  // bài của phiên này nên luôn khớp với những gì sắp được hỏi.
  const [teachCards, setTeachCards] = useState<TeachCard[]>([]);
  const [teachIndex, setTeachIndex] = useState(0);
  const [isTeaching, setIsTeaching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: number; selectedOptionId: number }[]
  >([]);
  const startTime = useRef(Date.now());
  const { deductEnergy, maxEnergy } = useGamification();
  const { showError } = useToast();

  const [lessonType, setLessonType] = useState<string>("NORMAL");
  const [isReplay, setIsReplay] = useState<boolean>(false);
  const [heartsRemaining, setHeartsRemaining] = useState<number>(3);
  const [comboCount, setComboCount] = useState<number>(0);

  // Đồng hồ đếm giờ cho TIMED_REVIEW: chạy thật (wall-clock) + cộng dồn phạt
  // ngay khi trả lời sai (xem checkAnswer). `penaltySecondsRef` là nguồn sự
  // thật cho phần phạt vì setInterval bên dưới đọc qua closure — dùng ref để
  // không phải huỷ/tạo lại interval mỗi lần bị phạt.
  const penaltySecondsRef = useRef(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [penaltyTick, setPenaltyTick] = useState(0);
  const TIME_PENALTY_SECONDS = 10;

  const { refillEnergy, watchAdToRefill } = useGamification();
  const [showEnergyPopup, setShowEnergyPopup] = useState(false);
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [adError, setAdError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await lessonAttemptApi.startLesson(lessonId as string);
      const mappedQuestions = mapApiQuestionsToQuizQuestions(
        response.questions,
      );
      setQuestions(mappedQuestions);
      setOriginalQuestionsLength(mappedQuestions.length);

      const cards = buildTeachCards(response.questions);
      setTeachCards(cards);
      setTeachIndex(0);
      setIsTeaching(cards.length > 0);
      setLessonType(response.lessonType);
      setIsReplay(response.isReplay);

      if (response.totalEnergyDeducted > 0) {
        deductEnergy(response.totalEnergyDeducted);
      }

      startTime.current = Date.now();
      penaltySecondsRef.current = 0;
      setElapsedSeconds(0);
      setPenaltyTick(0);
    } catch (error: any) {
      console.error("Failed to start lesson:", error);
      const errorMsg = error?.message || error?.response?.data?.message || "";
      if (
        errorMsg.toLowerCase().includes("nang luong") ||
        errorMsg.toLowerCase().includes("năng lượng")
      ) {
        setShowEnergyPopup(true);
      } else {
        Alert.alert(
          "Lỗi",
          errorMsg || "Không thể bắt đầu bài học. Vui lòng kiểm tra kết nối.",
          [{ text: "OK", onPress: () => router.back() }],
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // Đồng hồ đếm giờ chỉ chạy cho TIMED_REVIEW — tick mỗi giây, luôn cộng thêm
  // phần phạt đã dồn (penaltySecondsRef) để hiển thị đúng con số sẽ gửi lên
  // server lúc /submit.
  useEffect(() => {
    if (lessonType !== "TIMED_REVIEW") return;
    const tick = () => {
      setElapsedSeconds(
        Math.floor((Date.now() - startTime.current) / 1000) +
          penaltySecondsRef.current,
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lessonType]);

  const currentQuestion = questions[currentIndex];

  // Random 1 trong 3 mascot mỗi khi sang câu mới (currentIndex đổi),
  // không đổi liên tục mỗi lần re-render trong lúc đang làm câu đó.
  const currentMascot = useMemo(
    () => QUESTION_MASCOTS[Math.floor(Math.random() * QUESTION_MASCOTS.length)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIndex],
  );

  const progress =
    originalQuestionsLength > 0
      ? Math.min((currentIndex + 1) / originalQuestionsLength, 1)
      : 0;
  const isLastQuestion = currentIndex >= questions.length - 1;

  const shakeOffset = useSharedValue(0);

  const getCorrectAnswerText = (q: QuizQuestion): string | null => {
    switch (q.type) {
      case "vocab":
      case "listening":
        return q.answers.find((a: any) => a.isCorrect)?.text || null;
      case "picture": {
        const correct = q.images.find((a: any) => a.isCorrect);
        return correct?.text || (correct as any)?.metadataJson?.label || null;
      }
      case "kana":
        return q.correctOrder.join("");
      case "fill-blank":
        return q.correctAnswer;
      case "kanji-fill":
        return Object.values(q.correctFills).join(", ");
      case "speaking":
        return q.textToSpeak;
      case "flashcard":
        return q.backText;
      default:
        return null;
    }
  };

  const checkAnswer = () => {
    setHasSubmitted(true);
    if (currentIsCorrect) {
      setComboCount((prev) => prev + 1);
      playCorrect();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    } else {
      setComboCount(0);
      playIncorrect();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {},
      );
      shakeOffset.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );

      if (lessonType === "JUMP_TEST") {
        setHeartsRemaining((prev) => Math.max(0, prev - 1));
      }

      if (lessonType === "TIMED_REVIEW") {
        // Phạt giờ tức thì — đồng hồ trên header nhảy thêm +10s ngay khi sai,
        // không đợi tick giây kế tiếp mới cộng dồn.
        penaltySecondsRef.current += TIME_PENALTY_SECONDS;
        setElapsedSeconds(
          Math.floor((Date.now() - startTime.current) / 1000) +
            penaltySecondsRef.current,
        );
        setPenaltyTick((prev) => prev + 1);
      }

      if (lessonType !== "JUMP_TEST") {
        setQuestions((prev) => [
          ...prev,
          { ...currentQuestion, isRedo: true } as any,
        ]);
      }
    }

    if (!(currentQuestion as any).isRedo) {
      if (currentIsCorrect) {
        setCorrectCount((prev) => prev + 1);
      } else {
        setMistakeCount((prev) => prev + 1);
      }

      // Chỉ ghi nhận khi người học THẬT SỰ bấm vào một lựa chọn có id.
      //
      // Câu sắp xếp (kana) và câu nói (speaking) không có lựa chọn nào để bấm,
      // nên `selectedAnswerId` là null. Mã cũ lấp chỗ trống bằng cách nhặt đại
      // "một lựa chọn sai bất kỳ" của câu đó rồi gửi lên — Mistake Bank vì thế
      // ghi nhận đáp án người học chưa từng chọn, và màn ôn tập lỗi sai hiện ra
      // những phương án họ chưa bao giờ nhìn thấy. Không có bằng chứng thì đừng
      // báo cáo gì cả: backend tự chấm lại từ DB và bỏ qua phần thiếu.
      const optionId = Number(selectedAnswerId);
      if (selectedAnswerId !== null && Number.isFinite(optionId)) {
        setAnswers((prev) => [
          ...prev,
          {
            questionId: Number(currentQuestion.id),
            selectedOptionId: optionId,
          },
        ]);
      }
    }
  };

  /** Sang thẻ dạy kế tiếp; hết thẻ thì bước vào phần câu hỏi. */
  const advanceTeaching = () => {
    if (teachIndex >= teachCards.length - 1) {
      setIsTeaching(false);
    } else {
      setTeachIndex((prev) => prev + 1);
    }
  };

  /** Cho người đã biết phần này (hoặc đang học lại) vào thẳng câu hỏi. */
  const skipTeaching = () => {
    setIsTeaching(false);
  };

  const proceedToNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswerId(null);
    setCurrentIsCorrect(false);
    setHasInteracted(false);
    setHasSubmitted(false);
    setIsShowingRedoIntro(false);
  };

  const moveToNextQuestion = async () => {
    const isFailed = lessonType === "JUMP_TEST" && heartsRemaining <= 0;

    if (isLastQuestion || isFailed) {
      setIsSubmitting(true);
      try {
        const timeTaken =
          Math.floor((Date.now() - startTime.current) / 1000) +
          penaltySecondsRef.current;
        const response = await lessonAttemptApi.submitLesson(
          lessonId as string,
          {
            totalQuestions: originalQuestionsLength,
            totalCorrect: correctCount,
            totalMistakes: mistakeCount,
            timeTakenSeconds: timeTaken,
            heartsRemaining: heartsRemaining,
            isReplay: isReplay,
            answers: answers,
          },
        );

        router.replace({
          pathname: "/quiz/result",
          params: {
            status: response.status,
            expEarned: response.expEarned,
            starsEarned: response.starsEarned,
            correctCount: correctCount,
            wrongCount: mistakeCount,
            currentEnergy: response.currentEnergy,
            coinsEarned: response.coinsEarned,
            isPromoted: response.isPromoted ? "true" : "false",
            newRankName: response.newRankName || "",
            lessonType: lessonType,
          },
        });
      } catch (error: any) {
        // Trước đây chỉ console.error rồi tắt spinner: người học đứng ở câu cuối,
        // không biết mình đã mất toàn bộ kết quả và cũng không có gì để bấm.
        // Trạng thái bài làm vẫn còn nguyên trong state nên bấm lại là nộp lại
        // được — chỉ cần nói cho họ biết.
        console.error("Failed to submit lesson:", error);
        setIsSubmitting(false);
        showError(
          "Chưa nộp được bài",
          error?.message ||
            "Kiểm tra kết nối mạng rồi bấm lại nút hoàn thành nhé.",
        );
      }
    } else {
      if (
        currentIndex === originalQuestionsLength - 1 &&
        questions.length > originalQuestionsLength
      ) {
        setIsShowingRedoIntro(true);
      } else {
        proceedToNext();
      }
    }
  };

  const handleAnswerSelection = (isCorrect: boolean) => {
    setCurrentIsCorrect(isCorrect);
    setHasInteracted(true);
  };

  /**
   * Đóng màn hình bài học. Khi bài học đã bắt đầu (không ở màn hình lỗi hay nạp năng lượng),
   * việc thoát giữa chừng sẽ làm mất tiến trình và năng lượng đã trừ, vì vậy luôn hiển thị
   * hộp thoại xác nhận (cả khi bấm nút ✕ trên header hay khi vuốt/bấm phím Back trên Android).
   */
  const handleClose = React.useCallback(() => {
    if (showEnergyPopup || isLoading) {
      router.back();
      return;
    }
    setShowExitModal(true);
  }, [showEnergyPopup, isLoading, router]);

  // Bắt cử chỉ vuốt mép và phím Back phần cứng trên Android
  useEffect(() => {
    const onBackPress = () => {
      if (showExitModal) {
        setShowExitModal(false);
        return true;
      }
      handleClose();
      return true;
    };

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      onBackPress,
    );

    return () => subscription.remove();
  }, [handleClose, showExitModal]);

  const renderExitModal = () => {
    if (!showExitModal) return null;
    return (
      <ModalCard onClose={() => setShowExitModal(false)}>
        <View style={styles.exitModalContent}>
          <View
            style={[
              styles.exitIconBadge,
              {
                backgroundColor: isDark
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(239, 68, 68, 0.08)",
              },
            ]}
          >
            <Ionicons name="log-out-outline" size={34} color={Colors.error} />
          </View>

          <Text
            style={[
              styles.exitTitle,
              { color: isDark ? "#F9FAFB" : Colors.textPrimary },
            ]}
          >
            Dừng buổi học?
          </Text>

          <Text
            style={[
              styles.exitSubtitle,
              {
                color: isDark
                  ? "rgba(255,255,255,0.6)"
                  : Colors.textSecondary,
              },
            ]}
          >
            Tiến trình làm bài hiện tại sẽ không được lưu và bạn sẽ mất lượt này.
          </Text>

          <View style={styles.exitBtnGroup}>
            <GradientButton
              title="TIẾP TỤC HỌC"
              onPress={() => setShowExitModal(false)}
              style={{ width: "100%" }}
            />
            <GradientButton
              title="RỜI KHỎI BÀI"
              variant="outline"
              onPress={() => {
                setShowExitModal(false);
                router.back();
              }}
              style={{ width: "100%", borderWidth: 0 }}
              textStyle={{ color: Colors.error }}
            />
          </View>
        </View>
      </ModalCard>
    );
  };

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }],
  }));

  const renderQuestionCard = () => {
    switch (currentQuestion.type) {
      case "vocab":
        return (
          <VocabQuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswerId}
            mascotSource={currentMascot}
            onSelectAnswer={(answerId) => {
              setSelectedAnswerId(answerId);
              const answer = currentQuestion.answers.find(
                (a) => a.id === answerId,
              );
              handleAnswerSelection(answer?.isCorrect ?? false);
            }}
          />
        );
      case "kana":
        return (
          <KanaQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect, arrangedString) => {
              setCurrentIsCorrect(isCorrect);
              setHasInteracted(arrangedString.length > 0);
            }}
          />
        );
      case "picture":
        return (
          <PictureQuestionCard
            question={currentQuestion as any}
            selectedAnswerId={selectedAnswerId}
            hasSubmitted={hasSubmitted}
            onSelectAnswer={(answerId, isCorrect) => {
              setSelectedAnswerId(answerId);
              handleAnswerSelection(isCorrect);
            }}
          />
        );
      case "kanji-fill":
        return (
          <KanjiFillQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect, fills) => {
              setCurrentIsCorrect(isCorrect);
              setHasInteracted(Object.keys(fills).length > 0);
            }}
          />
        );
      case "matching":
        return (
          <MatchingQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect) => {
              handleAnswerSelection(isCorrect);
            }}
          />
        );
      case "flashcard":
        return (
          <FlashcardQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect) => {
              handleAnswerSelection(isCorrect);
            }}
          />
        );
      case "fill-blank":
        return (
          <FillBlankQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect) => {
              handleAnswerSelection(isCorrect);
            }}
          />
        );
      case "listening":
        return (
          <ListeningQuestionCard
            question={currentQuestion}
            selectedAnswer={selectedAnswerId}
            onSelectAnswer={(answerId) => {
              setSelectedAnswerId(answerId);
              const answer = currentQuestion.answers.find(
                (a) => a.id === answerId,
              );
              handleAnswerSelection(answer?.isCorrect ?? false);
            }}
          />
        );
      case "speaking":
        return (
          <SpeakingQuestionCard
            question={currentQuestion}
            onAnswerChange={(isCorrect) => {
              handleAnswerSelection(isCorrect);
            }}
            onSkipSpeaking={() => {
              const remainingSpeakingCount = questions
                .slice(currentIndex)
                .filter((q) => q.type === "speaking").length;

              const futureNonSpeaking = questions
                .slice(currentIndex + 1)
                .filter((q) => q.type !== "speaking");

              setOriginalQuestionsLength(
                (prev) => prev - remainingSpeakingCount,
              );

              if (futureNonSpeaking.length === 0) {
                // If there are no more questions, we just mark this as correct so the user can finish
                handleAnswerSelection(true);
              } else {
                setQuestions((prev) => {
                  const past = prev.slice(0, currentIndex);
                  return [...past, ...futureNonSpeaking];
                });
                setSelectedAnswerId(null);
                setCurrentIsCorrect(false);
                setHasInteracted(false);
                setHasSubmitted(false);
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  const bg = isDark ? Colors.dark.background : Colors.light.background;

  // ── Energy popup ──────────────────────────────────────────────────────────
  if (showEnergyPopup) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: bg }]}>
        <ModalCard onClose={() => router.back()}>
          <View style={styles.energyPopupContent}>
            <LinearGradient
              colors={[Colors.accent + "33", Colors.accent + "11"]}
              style={styles.energyIconBadge}
            >
              <Ionicons name="flash" size={36} color={Colors.accent} />
            </LinearGradient>

            <Text
              style={[
                styles.energyTitle,
                { color: isDark ? "#F9FAFB" : Colors.textPrimary },
              ]}
            >
              Hết năng lượng!
            </Text>
            <Text
              style={[
                styles.energySubtitle,
                {
                  color: isDark
                    ? "rgba(255,255,255,0.55)"
                    : Colors.textSecondary,
                },
              ]}
            >
              Bạn không đủ năng lượng để bắt đầu bài học này. Năng lượng tối đa
              là {maxEnergy}. Hãy mua bằng xu hoặc xem quảng cáo để hồi phục.
            </Text>

            {adError && <Text style={styles.adErrorText}>{adError}</Text>}

            <View style={styles.energyBtnGroup}>
              <GradientButton
                title="MUA FULL (400 COIN)"
                onPress={async () => {
                  try {
                    await refillEnergy();
                    setShowEnergyPopup(false);
                    fetchQuestions();
                  } catch (e: any) {
                    setAdError(e?.response?.data?.message || "Không đủ xu");
                  }
                }}
                style={{ width: "100%" }}
              />
              <GradientButton
                title="XEM QUẢNG CÁO (+5 NL)"
                variant="outline"
                onPress={async () => {
                  try {
                    setAdError(null);
                    await watchAdToRefill();
                    setShowEnergyPopup(false);
                    fetchQuestions();
                  } catch (e: any) {
                    setAdError(
                      e?.response?.data?.message || "Lỗi kết nối quảng cáo",
                    );
                  }
                }}
                style={{ width: "100%" }}
              />
              <GradientButton
                title="ĐỂ SAU"
                variant="outline"
                onPress={() => {
                  setShowEnergyPopup(false);
                  setAdError(null);
                  router.back();
                }}
                style={{ width: "100%", borderWidth: 0 }}
              />
            </View>
          </View>
        </ModalCard>
      </SafeAreaView>
    );
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: bg }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text
          style={[
            styles.loadingText,
            { color: isDark ? "rgba(255,255,255,0.4)" : Colors.textSecondary },
          ]}
        >
          Đang tải bài học…
        </Text>
      </SafeAreaView>
    );
  }

  // ── No questions ──────────────────────────────────────────────────────────
  if (!currentQuestion) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: bg }]}>
        <Text
          style={[
            styles.emptyText,
            { color: isDark ? "rgba(255,255,255,0.45)" : Colors.textSecondary },
          ]}
        >
          Không tìm thấy câu hỏi nào.
        </Text>
      </SafeAreaView>
    );
  }

  // ── Phần dạy (trước khi hỏi) ──────────────────────────────────────────────
  // Người học mới phải được nhìn thấy mặt chữ, nghe cách đọc và biết nghĩa
  // trước khi bị hỏi về nó. Bỏ qua được để lần học lại không phải xem lại.
  if (isTeaching && teachCards.length > 0) {
    const teachCard = teachCards[teachIndex];
    const isLastTeachCard = teachIndex >= teachCards.length - 1;

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        {isDark && (
          <>
            <View style={styles.orbTL} pointerEvents="none" />
            <View style={styles.orbBR} pointerEvents="none" />
          </>
        )}

        <QuizHeader
          progress={(teachIndex + 1) / teachCards.length}
          onClose={handleClose}
          lessonType={lessonType}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            key={teachCard.id}
            entering={FadeInRight.duration(300).springify()}
            exiting={FadeOutLeft.duration(200)}
            style={styles.content}
          >
            <TeachCardView
              card={teachCard}
              index={teachIndex}
              total={teachCards.length}
            />
          </Animated.View>
        </ScrollView>

        <View
          style={[
            styles.bottomBar,
            {
              backgroundColor: isDark
                ? Colors.dark.background
                : Colors.light.background,
            },
          ]}
        >
          <GradientButton
            title={isLastTeachCard ? "BẮT ĐẦU LUYỆN TẬP" : "TIẾP TỤC"}
            onPress={advanceTeaching}
            style={styles.nextButton}
          />
          <GradientButton
            title="TÔI ĐÃ BIẾT — BỎ QUA"
            variant="outline"
            onPress={skipTeaching}
            style={styles.skipTeachButton}
          />
        </View>
        {renderExitModal()}
      </SafeAreaView>
    );
  }

  // ── Redo intro ────────────────────────────────────────────────────────────
  if (isShowingRedoIntro) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
        {isDark && (
          <>
            <View style={styles.orbTL} pointerEvents="none" />
            <View style={styles.orbBR} pointerEvents="none" />
          </>
        )}
        <View style={styles.redoIntroContainer}>
          <LottieView
            source={require("../../../assets/animations/school_mascot.json")}
            style={styles.redoIntroLottie}
            autoPlay={true}
            loop={true}
          />
          <Animated.View
            entering={FadeInUp.delay(200).springify()}
            style={styles.redoTextGroup}
          >
            <View
              style={[
                styles.redoPill,
                {
                  backgroundColor: Colors.warning + "22",
                  borderColor: Colors.warning + "55",
                },
              ]}
            >
              <Text style={[styles.redoPillText, { color: Colors.warning }]}>
                ÔN LẠI LỖI SAI
              </Text>
            </View>
            <Text
              style={[
                styles.redoIntroTitle,
                { color: isDark ? "#F9FAFB" : Colors.textPrimary },
              ]}
            >
              Cố lên nào! 💪
            </Text>
            <Text
              style={[
                styles.redoIntroText,
                {
                  color: isDark
                    ? "rgba(255,255,255,0.55)"
                    : Colors.textSecondary,
                },
              ]}
            >
              Hãy cùng ôn lại các câu bạn chưa đúng nhé.
            </Text>
            <GradientButton
              title="BẮT ĐẦU ÔN TẬP"
              onPress={proceedToNext}
              style={styles.redoIntroButton}
            />
          </Animated.View>
        </View>
        {renderExitModal()}
      </SafeAreaView>
    );
  }

  // ── Main quiz ─────────────────────────────────────────────────────────────
  const correctAnswerText = getCorrectAnswerText(currentQuestion);
  // Chuỗi trả lời đúng liên tiếp ≥3 câu thì đổi nhãn ăn mừng — tính năng riêng
  // của màn quiz chính, panel dùng chung (QuizBottomBar) không biết về combo
  // nên truyền đè bằng prop thay vì tự vẽ lại panel ở đây.
  const correctFeedbackLabel =
    currentIsCorrect && comboCount >= 3
      ? `🔥 ${comboCount} câu đúng liên tiếp! Tuyệt vời!`
      : undefined;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      {isDark && (
        <>
          <View style={styles.orbTL} pointerEvents="none" />
          <View style={styles.orbBR} pointerEvents="none" />
        </>
      )}

      <QuizHeader
        progress={progress}
        onClose={handleClose}
        lessonType={lessonType}
        heartsRemaining={heartsRemaining}
        elapsedSeconds={elapsedSeconds}
        penaltyTick={penaltyTick}
        comboCount={comboCount}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.content, shakeStyle]}>
          <Animated.View
            key={currentIndex}
            entering={FadeInRight.duration(300).springify()}
            exiting={FadeOutLeft.duration(200)}
            style={{ width: "100%" }}
          >
            <View pointerEvents={hasSubmitted ? "none" : "auto"}>
              {/* Mascot minh hoạ dùng chung - hiện ở các loại câu hỏi CHƯA tự tích hợp
                  mascot + bong bóng riêng (vd "vocab" đã tự vẽ trong VocabQuestionCard,
                  nên bỏ qua ở đây để tránh hiện trùng 2 con mascot cùng lúc). */}
              {currentQuestion.type !== "vocab" && (
                <View style={styles.questionMascotWrap}>
                  <LottieView
                    source={currentMascot}
                    autoPlay
                    loop
                    style={styles.questionMascotLottie}
                  />
                </View>
              )}
              {renderQuestionCard()}
            </View>
          </Animated.View>
        </Animated.View>
      </ScrollView>

      {/* Bottom feedback + CTA — panel dùng chung với voice/record.tsx, tránh
          lệch chữ/màu giữa hai màn cho cùng một sự kiện đúng/sai. */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: isDark
              ? Colors.dark.background
              : Colors.light.background,
          },
        ]}
      >
        <QuizBottomBar
          key={`quiz-bar-${currentIndex}`}
          hasInteracted={hasInteracted}
          hasSubmitted={hasSubmitted}
          isSubmitting={isSubmitting}
          isCorrect={currentIsCorrect}
          correctAnswerText={correctAnswerText}
          correctFeedbackLabel={correctFeedbackLabel}
          onCheck={checkAnswer}
          onNext={moveToNextQuestion}
          finishLabel="HOÀN THÀNH"
          submittingLabel="ĐANG NỘP BÀI..."
          isLastQuestion={isLastQuestion}
        />
      </View>
      {renderExitModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  skipTeachButton: {
    width: "100%",
    borderWidth: 0,
    marginTop: Spacing.two,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.three,
  },
  loadingText: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.three,
  },
  emptyText: {
    fontSize: FontSizes.md,
  },
  orbTL: {
    position: "absolute",
    top: -80,
    left: -80,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: Colors.primary,
    opacity: 0.06,
  },
  orbBR: {
    position: "absolute",
    bottom: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 999,
    backgroundColor: Colors.secondary,
    opacity: 0.05,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    paddingBottom: Spacing.eight,
  },
  exitModalContent: {
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  exitIconBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.one,
  },
  exitTitle: {
    fontSize: FontSizes.xl,
    fontFamily: Fonts.rounded,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  exitSubtitle: {
    fontSize: FontSizes.sm,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: Spacing.two,
  },
  exitBtnGroup: {
    width: "100%",
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  content: {
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  bottomBar: {
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.five,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  nextButton: {
    width: "100%",
  },
  // Redo intro
  redoIntroContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.six,
    gap: Spacing.six,
  },
  questionMascotWrap: {
    alignItems: "center",
    marginBottom: Spacing.two,
  },
  questionMascotLottie: {
    width: 100,
    height: 125,
  },
  redoIntroLottie: {
    width: 220,
    height: 220,
  },
  redoTextGroup: {
    alignItems: "center",
    gap: Spacing.four,
    width: "100%",
  },
  redoPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  redoPillText: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.extrabold,
    letterSpacing: 1.5,
  },
  redoIntroTitle: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  redoIntroText: {
    fontSize: FontSizes.md,
    textAlign: "center",
    lineHeight: 22,
  },
  redoIntroButton: {
    width: "100%",
    maxWidth: 300,
    marginTop: Spacing.two,
  },
  // Energy popup
  energyPopupContent: {
    alignItems: "center",
    gap: Spacing.four,
    marginTop: Spacing.three,
  },
  energyIconBadge: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  energyTitle: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.extrabold,
    textAlign: "center",
  },
  energySubtitle: {
    fontSize: FontSizes.md,
    textAlign: "center",
    lineHeight: 22,
  },
  adErrorText: {
    fontSize: FontSizes.sm,
    color: Colors.error,
    textAlign: "center",
  },
  energyBtnGroup: {
    width: "100%",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
});
