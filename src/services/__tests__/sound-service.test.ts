import AsyncStorage from "@react-native-async-storage/async-storage";
import { CORRECT_LADDER_STEPS, soundService } from "../sound-service";
import { createAudioPlayer } from "expo-audio";

jest.mock("expo-audio", () => {
  const mockPlayer = {
    play: jest.fn(),
    pause: jest.fn(),
    seekTo: jest.fn(),
    remove: jest.fn(),
  };
  return {
    createAudioPlayer: jest.fn(() => mockPlayer),
    setAudioModeAsync: jest.fn().mockResolvedValue(undefined),
  };
});

describe("soundService", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
    await soundService.setSoundEnabled(true);
  });

  afterEach(() => {
    soundService.cleanup();
  });

  it("mặc định bật âm thanh khi khởi tạo", async () => {
    const enabled = await soundService.init();
    expect(enabled).toBe(true);
    expect(soundService.isSoundEnabled()).toBe(true);
  });

  it("lưu và đọc đúng trạng thái bật/tắt vào AsyncStorage", async () => {
    await soundService.setSoundEnabled(false);
    expect(soundService.isSoundEnabled()).toBe(false);
    expect(await AsyncStorage.getItem("@nihongo_sfx_enabled")).toBe("false");

    await soundService.setSoundEnabled(true);
    expect(soundService.isSoundEnabled()).toBe(true);
    expect(await AsyncStorage.getItem("@nihongo_sfx_enabled")).toBe("true");
  });

  it("tự động đọc cài đặt từ legacy key nếu chưa có key mới", async () => {
    await AsyncStorage.clear();
    await AsyncStorage.setItem("@kotodama_sfx_enabled", "false");
    await soundService.cleanup();
    // reset module state through private fields via init
    const enabled = await soundService.init();
    expect(enabled).toBe(false);
  });

  it("phát âm thanh Đúng khi SFX được bật", async () => {
    await soundService.setSoundEnabled(true);
    await soundService.playCorrect();

    expect(createAudioPlayer).toHaveBeenCalled();
    const player = (createAudioPlayer as jest.Mock).mock.results[0].value;
    expect(player.play).toHaveBeenCalled();
  });

  it("phát âm thanh Sai khi SFX được bật", async () => {
    await soundService.setSoundEnabled(true);
    await soundService.playIncorrect();

    expect(createAudioPlayer).toHaveBeenCalled();
    const player = (createAudioPlayer as jest.Mock).mock.results[0].value;
    expect(player.play).toHaveBeenCalled();
  });

  it("không phát âm thanh khi SFX bị tắt", async () => {
    await soundService.setSoundEnabled(false);
    await soundService.playCorrect();
    await soundService.playIncorrect();
    await soundService.playLessonComplete();
    await soundService.playAchievement();
    await soundService.playStreak();

    expect(createAudioPlayer).not.toHaveBeenCalled();
  });

  it("phát âm thanh Hoàn thành bài học khi SFX được bật", async () => {
    await soundService.setSoundEnabled(true);
    await soundService.playLessonComplete();

    expect(createAudioPlayer).toHaveBeenCalled();
    const player = (createAudioPlayer as jest.Mock).mock.results[0].value;
    expect(player.play).toHaveBeenCalled();
  });

  it("phát âm thanh Thành tựu khi SFX được bật", async () => {
    await soundService.setSoundEnabled(true);
    await soundService.playAchievement();

    expect(createAudioPlayer).toHaveBeenCalled();
    const player = (createAudioPlayer as jest.Mock).mock.results[0].value;
    expect(player.play).toHaveBeenCalled();
  });

  it("phát tiếng gõ gỗ khi chọn đáp án", async () => {
    await soundService.setSoundEnabled(true);
    await soundService.playTap();

    expect(createAudioPlayer).toHaveBeenCalled();
    const player = (createAudioPlayer as jest.Mock).mock.results[0].value;
    expect(player.play).toHaveBeenCalled();
  });

  describe("bậc thang combo của tiếng trả lời đúng", () => {
    // Jest gộp mọi `require(*.wav)` về cùng một giá trị nên không thể so sánh
    // nguồn file trực tiếp. Thay vào đó kiểm chứng qua số player được tạo:
    // mỗi bậc một player riêng nghĩa là key không đụng nhau.
    it("mỗi bậc tạo một player riêng", async () => {
      await soundService.setSoundEnabled(true);

      for (let step = 0; step < CORRECT_LADDER_STEPS; step++) {
        await soundService.playCorrect(step);
      }

      expect(createAudioPlayer).toHaveBeenCalledTimes(CORRECT_LADDER_STEPS);
    });

    it("chạm trần ở bậc cuối thay vì vượt ra ngoài mảng", async () => {
      await soundService.setSoundEnabled(true);

      await soundService.playCorrect(CORRECT_LADDER_STEPS - 1);
      expect(createAudioPlayer).toHaveBeenCalledTimes(1);

      // Chuỗi 50 câu phải kẹp về bậc cao nhất: dùng lại đúng player đó, không
      // tạo thêm player và không require một phần tử ngoài mảng.
      await soundService.playCorrect(50);
      expect(createAudioPlayer).toHaveBeenCalledTimes(1);
      const player = (createAudioPlayer as jest.Mock).mock.results[0].value;
      expect(player.play).toHaveBeenCalledTimes(2);
    });

    it("kẹp bậc âm về bậc thấp nhất", async () => {
      await soundService.setSoundEnabled(true);

      await soundService.playCorrect(0);
      expect(createAudioPlayer).toHaveBeenCalledTimes(1);

      await soundService.playCorrect(-3);
      expect(createAudioPlayer).toHaveBeenCalledTimes(1);
    });

    it("tái sử dụng player đã tạo khi lặp lại cùng một bậc", async () => {
      await soundService.setSoundEnabled(true);

      await soundService.playCorrect(2);
      await soundService.playCorrect(2);

      expect(createAudioPlayer).toHaveBeenCalledTimes(1);
      const player = (createAudioPlayer as jest.Mock).mock.results[0].value;
      expect(player.play).toHaveBeenCalledTimes(2);
      expect(player.seekTo).toHaveBeenCalledWith(0);
    });
  });
});
