/**
 * KanjiFillQuestionCard - Fill-in-the-blanks with Kanji choices.
 * Figma screen 31
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, FontSizes, FontWeights, BorderRadius, Spacing } from '@/constants/theme';
import type { KanjiFillQuestion } from '@/types';

interface KanjiFillQuestionProps {
  question: KanjiFillQuestion;
  onAnswerChange: (isCorrect: boolean, fills: Record<number, string>) => void;
}

export function KanjiFillQuestionCard({ question, onAnswerChange }: KanjiFillQuestionProps) {
  const [selectedBlank, setSelectedBlank] = useState<number | null>(0);
  const [fills, setFills] = useState<Record<number, string>>({});

  useEffect(() => {
    // Reset state when question changes
    setSelectedBlank(0);
    setFills({});
  }, [question]);

  const selectKanji = (kanji: string) => {
    if (selectedBlank === null) return;

    const newFills = { ...fills, [selectedBlank]: kanji };
    setFills(newFills);

    // Auto-advance to next empty blank
    const nextBlank = question.blanks.find((b) => b > selectedBlank && !newFills[b]);
    setSelectedBlank(nextBlank !== undefined ? nextBlank : null);

    validate(newFills);
  };

  const clearBlank = (blankIdx: number) => {
    const newFills = { ...fills };
    delete newFills[blankIdx];
    setFills(newFills);
    setSelectedBlank(blankIdx);
    validate(newFills);
  };

  const validate = (currentFills: Record<number, string>) => {
    const isCorrect = question.blanks.every(
      (idx) => currentFills[idx] === question.correctFills[idx]
    );
    onAnswerChange(isCorrect, currentFills);
  };

  // Render sentence segments split by blank indices
  // The sentence is: "ふじ＿のそばにながれる＿の＿は、... "
  // We can render a row of segments and input boxes
  const renderSentence = () => {
    const parts = question.sentence.split('＿');
    return (
      <View style={styles.sentenceContainer}>
        {parts.map((part, index) => {
          const isLast = index === parts.length - 1;
          const blankIdx = index;
          const hasBlank = !isLast && question.blanks.includes(blankIdx);
          const filledValue = fills[blankIdx];
          const isCurrent = selectedBlank === blankIdx;

          return (
            <React.Fragment key={index}>
              <Text style={styles.sentenceText}>{part}</Text>
              {hasBlank && (
                <TouchableOpacity
                  style={[
                    styles.blankBox,
                    isCurrent && styles.blankBoxActive,
                    filledValue && styles.blankBoxFilled,
                  ]}
                  onPress={() => (filledValue ? clearBlank(blankIdx) : setSelectedBlank(blankIdx))}
                >
                  <Text
                    style={[
                      styles.blankText,
                      filledValue && styles.blankTextFilled,
                    ]}
                  >
                    {filledValue || '?'}
                  </Text>
                </TouchableOpacity>
              )}
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.card}>
      <Text style={styles.instruction}>{question.instruction}</Text>

      <View style={styles.sentenceWrapper}>
        {renderSentence()}
      </View>

      <View style={styles.divider} />

      <Text style={styles.label}>Kanji Options:</Text>
      <View style={styles.bankContainer}>
        {question.kanjiBank.map((kanji, index) => {
          const isUsed = Object.values(fills).includes(kanji);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.kanjiTile,
                isUsed && styles.kanjiTileUsed,
              ]}
              onPress={() => !isUsed && selectKanji(kanji)}
              disabled={isUsed || selectedBlank === null}
            >
              <Text style={[styles.kanjiText, isUsed && styles.kanjiTextUsed]}>{kanji}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.six,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  instruction: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
    marginBottom: Spacing.six,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sentenceWrapper: {
    width: '100%',
    paddingVertical: Spacing.four,
    paddingHorizontal: Spacing.two,
    backgroundColor: Colors.cream,
    borderRadius: BorderRadius.md,
    minHeight: 120,
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  sentenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    lineHeight: 36,
  },
  sentenceText: {
    fontSize: FontSizes.lg,
    color: Colors.textPrimary,
    fontWeight: FontWeights.semibold,
    lineHeight: 36,
  },
  blankBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.one,
  },
  blankBoxActive: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: '#EEF2FF',
  },
  blankBoxFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  blankText: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.bold,
    color: Colors.textSecondary,
  },
  blankTextFilled: {
    color: Colors.textOnDark,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: Colors.creamDark,
    marginVertical: Spacing.four,
  },
  label: {
    alignSelf: 'flex-start',
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.three,
  },
  bankContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.four,
    width: '100%',
    marginTop: Spacing.two,
  },
  kanjiTile: {
    width: 60,
    height: 60,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.inputBorder,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  kanjiTileUsed: {
    backgroundColor: Colors.lockedBg,
    borderColor: Colors.locked,
    opacity: 0.5,
  },
  kanjiText: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
  },
  kanjiTextUsed: {
    color: Colors.textSecondary,
  },
});
