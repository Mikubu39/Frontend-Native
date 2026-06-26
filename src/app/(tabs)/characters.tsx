/**
 * Characters / Học Chữ Cái Screen - Interactive Hiragana & Katakana tables
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontSizes, FontWeights, Spacing, BorderRadius } from '@/constants/theme';

const { width } = Dimensions.get('window');
const GRID_CELL_SIZE = (width - 48 - 24) / 5; // 5 columns layout

interface Character {
  kana: string;
  romaji: string;
}

const HIRAGANA_DATA: Character[] = [
  { kana: 'あ', romaji: 'a' }, { kana: 'い', romaji: 'i' }, { kana: 'う', romaji: 'u' }, { kana: 'え', romaji: 'e' }, { kana: 'お', romaji: 'o' },
  { kana: 'か', romaji: 'ka' }, { kana: 'き', romaji: 'ki' }, { kana: 'く', romaji: 'ku' }, { kana: 'け', romaji: 'ke' }, { kana: 'こ', romaji: 'ko' },
  { kana: 'さ', romaji: 'sa' }, { kana: 'し', romaji: 'shi' }, { kana: 'す', romaji: 'su' }, { kana: 'せ', romaji: 'se' }, { kana: 'そ', romaji: 'so' },
  { kana: 'た', romaji: 'ta' }, { kana: 'ち', romaji: 'chi' }, { kana: 'つ', romaji: 'tsu' }, { kana: 'て', romaji: 'te' }, { kana: 'と', romaji: 'to' },
  { kana: 'な', romaji: 'na' }, { kana: 'に', romaji: 'ni' }, { kana: 'ぬ', romaji: 'nu' }, { kana: 'ね', romaji: 'ne' }, { kana: 'の', romaji: 'no' },
  { kana: 'は', romaji: 'ha' }, { kana: 'ひ', romaji: 'hi' }, { kana: 'ふ', romaji: 'fu' }, { kana: 'へ', romaji: 'he' }, { kana: 'ほ', romaji: 'ho' },
  { kana: 'ま', romaji: 'ma' }, { kana: 'み', romaji: 'mi' }, { kana: 'む', romaji: 'mu' }, { kana: 'め', romaji: 'me' }, { kana: 'も', romaji: 'mo' },
  { kana: 'や', romaji: 'ya' }, { kana: '', romaji: '' }, { kana: 'ゆ', romaji: 'yu' }, { kana: '', romaji: '' }, { kana: 'よ', romaji: 'yo' },
  { kana: 'ら', romaji: 'ra' }, { kana: 'り', romaji: 'ri' }, { kana: 'る', romaji: 'ru' }, { kana: 'れ', romaji: 're' }, { kana: 'ろ', romaji: 'ro' },
  { kana: 'わ', romaji: 'wa' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: 'を', romaji: 'wo' },
  { kana: 'ん', romaji: 'n' },
];

const KATAKANA_DATA: Character[] = [
  { kana: 'ア', romaji: 'a' }, { kana: 'イ', romaji: 'i' }, { kana: 'ウ', romaji: 'u' }, { kana: 'エ', romaji: 'e' }, { kana: 'オ', romaji: 'o' },
  { kana: 'カ', romaji: 'ka' }, { kana: 'キ', romaji: 'ki' }, { kana: 'ク', romaji: 'ku' }, { kana: 'ケ', romaji: 'ke' }, { kana: 'コ', romaji: 'ko' },
  { kana: 'サ', romaji: 'sa' }, { kana: 'シ', romaji: 'shi' }, { kana: 'ス', romaji: 'su' }, { kana: 'セ', romaji: 'se' }, { kana: 'ソ', romaji: 'so' },
  { kana: 'タ', romaji: 'ta' }, { kana: 'チ', romaji: 'chi' }, { kana: 'ツ', romaji: 'tsu' }, { kana: 'テ', romaji: 'te' }, { kana: 'ト', romaji: 'to' },
  { kana: 'ナ', romaji: 'na' }, { kana: 'ニ', romaji: 'ni' }, { kana: 'ヌ', romaji: 'nu' }, { kana: 'ネ', romaji: 'ne' }, { kana: 'ノ', romaji: 'no' },
  { kana: 'ハ', romaji: 'ha' }, { kana: 'ヒ', romaji: 'hi' }, { kana: 'フ', romaji: 'fu' }, { kana: 'ヘ', romaji: 'he' }, { kana: 'ホ', romaji: 'ho' },
  { kana: 'マ', romaji: 'ma' }, { kana: 'ミ', romaji: 'mi' }, { kana: 'ム', romaji: 'mu' }, { kana: 'メ', romaji: 'me' }, { kana: 'モ', romaji: 'mo' },
  { kana: 'ヤ', romaji: 'ya' }, { kana: '', romaji: '' }, { kana: 'ユ', romaji: 'yu' }, { kana: '', romaji: '' }, { kana: 'ヨ', romaji: 'yo' },
  { kana: 'ラ', romaji: 'ra' }, { kana: 'リ', romaji: 'ri' }, { kana: 'ル', romaji: 'ru' }, { kana: 'レ', romaji: 're' }, { kana: 'ロ', romaji: 'ro' },
  { kana: 'ワ', romaji: 'wa' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: '', romaji: '' }, { kana: 'ヲ', romaji: 'wo' },
  { kana: 'ン', romaji: 'n' },
];

export default function CharactersScreen() {
  const [activeTab, setActiveTab] = useState<'hiragana' | 'katakana'>('hiragana');
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);

  const currentData = activeTab === 'hiragana' ? HIRAGANA_DATA : KATAKANA_DATA;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header Tabs */}
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'hiragana' && styles.activeTabButton]}
            onPress={() => {
              setActiveTab('hiragana');
              setSelectedChar(null);
            }}
          >
            <Text style={[styles.tabText, activeTab === 'hiragana' && styles.activeTabText]}>
              Hiragana (あ)
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'katakana' && styles.activeTabButton]}
            onPress={() => {
              setActiveTab('katakana');
              setSelectedChar(null);
            }}
          >
            <Text style={[styles.tabText, activeTab === 'katakana' && styles.activeTabText]}>
              Katakana (ア)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Character Detail Preview Panel */}
        {selectedChar ? (
          <View style={styles.previewPanel}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewLabel}>KÝ TỰ ĐANG CHỌN</Text>
              <TouchableOpacity onPress={() => setSelectedChar(null)}>
                <Text style={styles.closeBtn}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.previewBody}>
              <Text style={styles.bigChar}>{selectedChar.kana}</Text>
              <View style={styles.charInfo}>
                <Text style={styles.romajiLabel}>Phiên âm: /{selectedChar.romaji}/</Text>
                <TouchableOpacity style={styles.audioBtn} activeOpacity={0.8}>
                  <Text style={styles.audioEmoji}>🔊 Nghe phát âm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.infoBanner}>
            <Text style={styles.infoEmoji}>💡</Text>
            <Text style={styles.infoText}>
              Chạm vào bất kỳ chữ cái nào để xem chi tiết cách phiên âm, nghe phát âm mẫu và học viết!
            </Text>
          </View>
        )}

        {/* Character Grid */}
        <View style={styles.grid}>
          {currentData.map((item, index) => {
            if (!item.kana) {
              // Empty spacer cell
              return <View key={`empty-${index}`} style={styles.emptyCell} />;
            }

            const isSelected = selectedChar?.kana === item.kana;

            return (
              <TouchableOpacity
                key={item.kana}
                style={[styles.cell, isSelected && styles.selectedCell]}
                onPress={() => setSelectedChar(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.cellKana, isSelected && styles.selectedCellText]}>
                  {item.kana}
                </Text>
                <Text style={styles.cellRomaji}>{item.romaji}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderBottomWidth: 2,
    borderBottomColor: Colors.lockedBg,
    alignItems: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.lg,
    padding: 4,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
    width: '100%',
    maxWidth: 400,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.primaryDark,
    fontWeight: FontWeights.extrabold,
  },
  scrollContent: {
    paddingHorizontal: Spacing.six,
    paddingVertical: Spacing.six,
    paddingBottom: 100,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
    marginBottom: Spacing.five,
    gap: Spacing.three,
  },
  infoEmoji: {
    fontSize: 24,
  },
  infoText: {
    flex: 1,
    fontSize: FontSizes.xs,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  previewPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: Spacing.five,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.lockedBg,
    paddingBottom: 8,
    marginBottom: Spacing.four,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: FontWeights.extrabold,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  closeBtn: {
    fontSize: 24,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  previewBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.six,
  },
  bigChar: {
    fontSize: 64,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  charInfo: {
    flex: 1,
    gap: 8,
  },
  romajiLabel: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  audioBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  audioEmoji: {
    color: '#FFFFFF',
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.extrabold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'space-between',
  },
  cell: {
    width: GRID_CELL_SIZE,
    height: GRID_CELL_SIZE + 10,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.lockedBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCell: {
    borderColor: Colors.primary,
    backgroundColor: '#F5F3FF',
  },
  cellKana: {
    fontSize: 22,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
  },
  selectedCellText: {
    color: Colors.primaryDark,
  },
  cellRomaji: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  emptyCell: {
    width: GRID_CELL_SIZE,
    height: GRID_CELL_SIZE + 10,
    backgroundColor: 'transparent',
  },
});
