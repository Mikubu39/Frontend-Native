export type AvatarConfig = {
  seed: string;
  skin: string;
  hair: string;
  facialHair: string;
  outfit: string;
  accessory: string;
  background: string;
};

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  seed: 'duolingo-user',
  skin: '#F4C7A1',
  hair: 'short',
  facialHair: 'none',
  outfit: '#4A90D9',
  accessory: 'none',
  background: '#F4E8FF',
};

// Các giá trị gợi ý nhanh (preset) trong UI picker - người dùng vẫn có thể
// nhập mã HEX riêng ngoài danh sách này (xem CustomColorInput trong modal).
export const avatarOptions = {
  skin: ['#F4C7A1', '#D9A066', '#7B4B2A', '#E7C2A2', '#B76E3B'],
  hair: ['short', 'long', 'curly', 'bob', 'bun'],
  // Râu/ria - tuỳ chọn tự do, không gắn với khái niệm giới tính nào cả,
  // ai cũng chọn được nếu muốn.
  facialHair: ['none', 'beard', 'moustache'],
  outfit: ['#4A90D9', '#F48FB1', '#66BB6A', '#FFD54F', '#9575CD'],
  // Bỏ "headphones" vì DiceBear (style avataaars) không có phụ kiện này.
  accessory: ['none', 'glasses', 'hat'],
  background: ['#F4E8FF', '#E0F2FE', '#DCFCE7', '#FEF3C7', '#FCE7F3'],
};

/**
 * DiceBear (style avataaars) chỉ nhận đúng 1 tập giá trị cố định (enum) cho các
 * tham số "top" (tóc/mũ), "facialHair", "accessories". Bảng dưới đây dịch giá
 * trị thân thiện trong UI -> giá trị thật DiceBear hiểu.
 * Xem danh sách đầy đủ tại: https://www.dicebear.com/styles/avataaars/
 */
const HAIR_TO_TOP: Record<string, string> = {
  short: 'shortFlat',
  long: 'longButNotTooLong',
  curly: 'curly',
  bob: 'bob',
  bun: 'bun',
};
const TOP_TO_HAIR: Record<string, string> = Object.fromEntries(
  Object.entries(HAIR_TO_TOP).map(([hair, top]) => [top, hair])
);

const FACIAL_HAIR_TO_PARAM: Record<string, string> = {
  beard: 'beardMedium',
  moustache: 'moustacheFancy',
};
const PARAM_TO_FACIAL_HAIR: Record<string, string> = Object.fromEntries(
  Object.entries(FACIAL_HAIR_TO_PARAM).map(([label, param]) => [param, label])
);

const DEFAULT_CLOTHING_TYPE = 'shirtCrewNeck';

/** Kiểm tra 1 chuỗi có phải mã HEX màu hợp lệ không (#RRGGBB hoặc RRGGBB). */
export function isValidHexColor(value: string): boolean {
  return /^#?[0-9A-Fa-f]{6}$/.test(value.trim());
}

/** Chuẩn hoá về dạng "#RRGGBB" (thêm dấu # nếu thiếu, viết hoa cho đồng nhất). */
export function normalizeHexColor(value: string): string {
  const trimmed = value.trim().replace('#', '').toUpperCase();
  return `#${trimmed}`;
}

export type RgbColor = { r: number; g: number; b: number };

/** Chuyển "#RRGGBB" -> {r,g,b}. Trả về đen (0,0,0) nếu chuỗi không hợp lệ. */
export function hexToRgb(hex: string): RgbColor {
  if (!isValidHexColor(hex)) return { r: 0, g: 0, b: 0 };
  const clean = hex.trim().replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

/** Chuyển {r,g,b} (mỗi kênh 0-255) -> "#RRGGBB". */
export function rgbToHex({ r, g, b }: RgbColor): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const toHex = (n: number) => clamp(n).toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function buildAvatarUrl(config: Partial<AvatarConfig> = {}): string {
  const safeConfig: AvatarConfig = {
    ...DEFAULT_AVATAR_CONFIG,
    ...config,
  };

  const isHat = safeConfig.accessory === 'hat';
  const isGlasses = safeConfig.accessory === 'glasses';
  const hasFacialHair = safeConfig.facialHair !== 'none';

  const params = new URLSearchParams({
    seed: safeConfig.seed,
    skinColor: safeConfig.skin.replace('#', ''),
    // "hat" trong avataaars thực chất là 1 kiểu "top" (thay thế tóc), không phải accessory riêng.
    top: isHat ? 'hat' : HAIR_TO_TOP[safeConfig.hair] ?? HAIR_TO_TOP.short,
    clothing: DEFAULT_CLOTHING_TYPE,
    clothesColor: safeConfig.outfit.replace('#', ''),
    // Tham số nền đúng tên DiceBear là "backgroundColor", không phải "background".
    backgroundColor: safeConfig.background.replace('#', ''),
  });

  // DiceBear KHÔNG chấp nhận accessories="none" hay facialHair="none"
  // (không nằm trong danh sách giá trị hợp lệ) -> phải bỏ hẳn tham số, không gửi "none".
  if (isGlasses) {
    params.set('accessories', 'round');
    params.set('accessoriesProbability', '100');
  }
  if (hasFacialHair) {
    params.set('facialHair', FACIAL_HAIR_TO_PARAM[safeConfig.facialHair] ?? FACIAL_HAIR_TO_PARAM.beard);
    params.set('facialHairProbability', '100');
  }

  // Dùng PNG thay vì SVG: <Image> gốc của React Native KHÔNG tự render được
  // ảnh SVG từ URL trên iOS/Android (chỉ web mới hiện được nhờ trình duyệt).
  return `https://api.dicebear.com/9.x/avataaars/png?${params.toString()}`;
}

export function parseAvatarUrl(url?: string): AvatarConfig {
  if (!url) {
    return DEFAULT_AVATAR_CONFIG;
  }

  try {
    const parsed = new URL(url);
    const params = parsed.searchParams;

    const top = params.get('top') ?? '';
    const accessories = params.get('accessories') ?? 'none';
    const accessory = top === 'hat' ? 'hat' : accessories === 'round' ? 'glasses' : 'none';

    const facialHairParam = params.get('facialHair') ?? '';
    const facialHair = PARAM_TO_FACIAL_HAIR[facialHairParam] || 'none';

    return {
      seed: params.get('seed') || DEFAULT_AVATAR_CONFIG.seed,
      skin: params.get('skinColor') ? `#${params.get('skinColor')}` : DEFAULT_AVATAR_CONFIG.skin,
      hair: TOP_TO_HAIR[top] || DEFAULT_AVATAR_CONFIG.hair,
      facialHair,
      outfit: params.get('clothesColor') ? `#${params.get('clothesColor')}` : DEFAULT_AVATAR_CONFIG.outfit,
      accessory,
      background: params.get('backgroundColor')
        ? `#${params.get('backgroundColor')}`
        : DEFAULT_AVATAR_CONFIG.background,
    };
  } catch {
    return DEFAULT_AVATAR_CONFIG;
  }
}