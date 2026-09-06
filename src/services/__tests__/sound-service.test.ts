import AsyncStorage from "@react-native-async-storage/async-storage";
import { soundService } from "../sound-service";
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

    expect(createAudioPlayer).not.toHaveBeenCalled();
  });
});
