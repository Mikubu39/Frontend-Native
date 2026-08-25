/**
 * CommentsModal - Bottom-sheet-style modal listing a post's comments
 * (GET /posts/{id}/comments, cursor pagination) with an inline add-comment
 * input (POST /posts/{id}/comments, max 300 chars) and delete for own
 * comments (DELETE /comments/{id}).
 */

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnimatedPressable } from "@/components/ui/animated-pressable";
import {
  BorderRadius,
  Colors,
  FontSizes,
  FontWeights,
  Spacing,
} from "@/constants/theme";
import { feedApi } from "@/services/api/feed";
import { PostCommentResponse } from "@/types/api";
import { resolveMediaUrl } from "@/utils/media";
import { formatRelativeTime } from "@/utils/relative-time";

const MAX_LENGTH = 300;

interface CommentsModalProps {
  visible: boolean;
  postId: number | null;
  currentUserId: number | null;
  cardColor: string;
  backgroundColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderColor: string;
  onClose: () => void;
  onCommentAdded: (postId: number) => void;
  onCommentDeleted: (postId: number) => void;
}

export function CommentsModal({
  visible,
  postId,
  currentUserId,
  cardColor,
  backgroundColor,
  textColor,
  textSecondaryColor,
  borderColor,
  onClose,
  onCommentAdded,
  onCommentDeleted,
}: CommentsModalProps) {
  const [comments, setComments] = useState<PostCommentResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  const loadComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const page = await feedApi.getComments(postId);
      setComments(page.items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (visible && postId) {
      setDraft("");
      loadComments();
    }
  }, [visible, postId, loadComments]);

  const handleSend = async () => {
    const content = draft.trim();
    if (!content || !postId) return;
    setSending(true);
    try {
      await feedApi.addComment(postId, { content });
      setDraft("");
      await loadComments();
      onCommentAdded(postId);
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    if (!postId) return;
    try {
      await feedApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCommentDeleted(postId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={[styles.sheet, { backgroundColor }]}>
          <View style={[styles.header, { borderBottomColor: borderColor }]}>
            <Text style={[styles.title, { color: textColor }]}>Bình luận</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={textSecondaryColor} />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator
              style={styles.loader}
              size="large"
              color={Colors.primary}
            />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.list}
              renderItem={({ item }) => {
                const avatar = resolveMediaUrl(item.author.avatarUrl);
                return (
                  <View style={[styles.commentRow, { borderColor }]}>
                    {avatar ? (
                      <Image source={{ uri: avatar }} style={styles.avatar} />
                    ) : (
                      <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarPlaceholderText}>
                          {item.author.displayName.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View
                      style={[
                        styles.bubble,
                        { backgroundColor: cardColor, borderColor },
                      ]}
                    >
                      <Text
                        style={[styles.authorName, { color: textColor }]}
                        numberOfLines={1}
                      >
                        {item.author.displayName}
                      </Text>
                      <Text style={[styles.commentText, { color: textColor }]}>
                        {item.content}
                      </Text>
                      <Text
                        style={[styles.time, { color: textSecondaryColor }]}
                      >
                        {formatRelativeTime(item.createdAt)}
                      </Text>
                    </View>
                    {item.author.id === currentUserId && (
                      <AnimatedPressable
                        onPress={() => handleDelete(item.id)}
                        pressScale={0.9}
                        style={styles.deleteBtn}
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color={textSecondaryColor}
                        />
                      </AnimatedPressable>
                    )}
                  </View>
                );
              }}
              ListEmptyComponent={
                <Text style={[styles.emptyText, { color: textSecondaryColor }]}>
                  Chưa có bình luận nào. Hãy là người đầu tiên!
                </Text>
              }
            />
          )}

          <View style={[styles.composeRow, { borderTopColor: borderColor }]}>
            <TextInput
              style={[styles.input, { color: textColor, borderColor }]}
              placeholder="Viết bình luận..."
              placeholderTextColor={textSecondaryColor}
              value={draft}
              onChangeText={setDraft}
              maxLength={MAX_LENGTH}
            />
            <AnimatedPressable
              style={[
                styles.sendBtn,
                (!draft.trim() || sending) && styles.sendBtnDisabled,
              ]}
              onPress={handleSend}
              disabled={!draft.trim() || sending}
              pressScale={0.9}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </AnimatedPressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    height: "75%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.four,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.bold,
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    marginTop: Spacing.eight,
  },
  list: {
    padding: Spacing.four,
    gap: Spacing.three,
  },
  commentRow: {
    flexDirection: "row",
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary + "20",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontWeight: FontWeights.bold,
  },
  bubble: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.three,
  },
  authorName: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.bold,
  },
  commentText: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  time: {
    fontSize: 10,
    marginTop: 4,
  },
  deleteBtn: {
    padding: Spacing.two,
    alignSelf: "flex-start",
  },
  emptyText: {
    textAlign: "center",
    marginTop: Spacing.eight,
    fontSize: FontSizes.sm,
  },
  composeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    padding: Spacing.three,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    fontSize: FontSizes.sm,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});
