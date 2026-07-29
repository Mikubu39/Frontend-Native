import React, { useState } from 'react';
import { Text, StyleSheet, Modal, View, TouchableOpacity, type TextStyle } from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing, Shadows } from '@/constants/theme';
import * as Haptics from 'expo-haptics';

interface JapaneseTextProps {
  text: string;
  style?: TextStyle | TextStyle[];
}

// Simple local dictionary for the prototype
const DICTIONARY: Record<string, string> = {
  'こんにちは': 'Xin chào (Dùng ban ngày)',
  'ありがとう': 'Cám ơn',
  'さようなら': 'Tạm biệt',
  '先生': 'Giáo viên (Sensei)',
  'わたし': 'Tôi / Tớ / Mình',
  '学生': 'Học sinh',
  'おばあさん': 'Bà ngoại / Bà nội',
  'おばさん': 'Cô / Dì',
  'はじめまして': 'Rất hân hạnh được gặp bạn',
  'です': 'là (kính ngữ)',
  'これ': 'Đây / Cái này',
  '本': 'Sách',
  'にほんご': 'Tiếng Nhật',
  'いぬ': 'Chó',
  'がくせい': 'Học sinh',
  'せんせい': 'Giáo viên',
  'あなた': 'Bạn / Anh / Chị',
  'よろしくおねがいします': 'Rất mong nhận được sự giúp đỡ'
};

export function JapaneseText({ text, style }: JapaneseTextProps) {
  const [selectedWord, setSelectedWord] = useState<{word: string, meaning: string} | null>(null);

  // Parse text into chunks (words that are in dict, and words that aren't)
  const chunks: { text: string; meaning?: string }[] = [];
  
  let currentText = text;
  
  while (currentText.length > 0) {
    let found = false;
    // Check for longest matching word first
    const sortedWords = Object.keys(DICTIONARY).sort((a, b) => b.length - a.length);
    
    for (const word of sortedWords) {
      if (currentText.startsWith(word)) {
        chunks.push({ text: word, meaning: DICTIONARY[word] });
        currentText = currentText.substring(word.length);
        found = true;
        break;
      }
    }
    
    if (!found) {
      // Group non-dict characters together for efficiency
      if (chunks.length > 0 && !chunks[chunks.length - 1].meaning) {
        chunks[chunks.length - 1].text += currentText[0];
      } else {
        chunks.push({ text: currentText[0] });
      }
      currentText = currentText.substring(1);
    }
  }

  const handleLongPress = (word: string, meaning: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    setSelectedWord({ word, meaning });
  };

  return (
    <>
      <Text style={style}>
        {chunks.map((chunk, index) => {
          if (chunk.meaning) {
            return (
              <Text
                key={index}
                style={styles.clickableWord}
                onLongPress={() => handleLongPress(chunk.text, chunk.meaning!)}
                onPress={() => handleLongPress(chunk.text, chunk.meaning!)} // Also allow tap for discovery
                suppressHighlighting={true}
              >
                {chunk.text}
              </Text>
            );
          }
          return <Text key={index}>{chunk.text}</Text>;
        })}
      </Text>

      {/* Tooltip Modal */}
      <Modal visible={!!selectedWord} transparent animationType="fade" onRequestClose={() => setSelectedWord(null)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedWord(null)}>
          <View style={styles.tooltipContainer}>
            <Text style={styles.tooltipWord}>{selectedWord?.word}</Text>
            <View style={styles.divider} />
            <Text style={styles.tooltipMeaning}>{selectedWord?.meaning}</Text>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  clickableWord: {
    color: Colors.accent,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dashed',
    textDecorationColor: Colors.accent,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tooltipContainer: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.six,
    borderRadius: BorderRadius.xl,
    minWidth: 220,
    alignItems: 'center',
    ...Shadows.xl,
  },
  tooltipWord: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.extrabold,
    color: Colors.textPrimary,
    marginBottom: Spacing.four,
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: Colors.lockedBg,
    marginBottom: Spacing.four,
  },
  tooltipMeaning: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
