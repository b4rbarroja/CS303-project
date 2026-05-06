import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import API from '../api/axios';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY, SHADOWS } from '../../shared/designTokens';

const AI_GREEN = COLORS.brand.primary;
const AI_GREEN_DARK = '#2d7a68';

const AiChatScreen = ({ navigation }) => {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'model',
      text: "Hello! 👋 I'm your AI Librarian. Ask me for book recommendations, search our catalog, or get reading suggestions!",
      time: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isLoading]);

  const buildHistory = () => {
    return messages
      .filter((_, i) => i > 0)
      .map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      }));
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      text: trimmed,
      time: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = buildHistory();
      const { data } = await API.post('/api/v1/ai/chat', {
        userMessage: trimmed,
        history,
      });

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: data.data.response,
          time: new Date(),
        },
      ]);
    } catch (error) {
      const errMsg =
        error.response?.data?.message ||
        "Sorry, I couldn't process your request. Please try again.";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: `⚠️ ${errMsg}`,
          time: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if message is last in its group
  const isLastInGroup = (idx) => {
    if (idx === messages.length - 1) return true;
    return messages[idx + 1]?.role !== messages[idx].role;
  };

  const renderMessage = ({ item, index }) => {
    const isUser = item.role === 'user';
    const lastInGroup = isLastInGroup(index);

    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAi, lastInGroup ? styles.messageGroupEnd : styles.messageGroupContinue]}>
        {/* AI Avatar */}
        {!isUser && (
          <View style={styles.avatarContainer}>
            {lastInGroup ? (
              <View style={styles.avatar}>
                <MaterialCommunityIcons name="book-open-page-variant" size={14} color="#fff" />
              </View>
            ) : (
              <View style={styles.avatarSpacer} />
            )}
          </View>
        )}

        <View style={[styles.bubbleWrapper, isUser ? styles.bubbleWrapperUser : styles.bubbleWrapperAi]}>
          <View
            style={[
              styles.bubble,
              isUser ? styles.bubbleUser : styles.bubbleAi,
              isUser
                ? (lastInGroup ? styles.bubbleUserLast : styles.bubbleUserMid)
                : (lastInGroup ? styles.bubbleAiLast : styles.bubbleAiMid),
            ]}
          >
            <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAi]}>
              {item.text}
            </Text>
          </View>
          {lastInGroup && item.time && (
            <Text style={[styles.timestamp, isUser ? styles.timestampUser : styles.timestampAi]}>
              {formatTime(item.time)}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isLoading) return null;
    return (
      <View style={[styles.messageRow, styles.messageRowAi, styles.messageGroupEnd]}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons name="book-open-page-variant" size={14} color="#fff" />
          </View>
        </View>
        <View style={[styles.bubble, styles.bubbleAi, styles.bubbleAiLast, styles.typingBubble]}>
          <View style={styles.typingDots}>
            <View style={[styles.dot, { opacity: 0.4 }]} />
            <View style={[styles.dot, { opacity: 0.6 }]} />
            <View style={[styles.dot, { opacity: 0.8 }]} />
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerAvatar}>
            <MaterialCommunityIcons name="book-open-page-variant" size={18} color="#fff" />
            <View style={styles.onlineDot} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AI Librarian</Text>
            <Text style={styles.headerStatus}>Active now</Text>
          </View>
        </View>

        {/* ── Messages ── */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          ListHeaderComponent={
            <View style={styles.datePill}>
              <Text style={styles.datePillText}>Today</Text>
            </View>
          }
          ListFooterComponent={renderTypingIndicator}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* ── Input ── */}
        <View style={styles.inputArea}>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Aa"
              placeholderTextColor={COLORS.text.tertiary}
              editable={!isLoading}
              multiline
              style={styles.textInput}
              onSubmitEditing={handleSend}
              blurOnSubmit={false}
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={isLoading || !inputValue.trim()}
            style={[styles.sendButton, (!inputValue.trim() || isLoading) && styles.sendButtonDisabled]}
          >
            <MaterialCommunityIcons
              name="send"
              size={20}
              color={inputValue.trim() && !isLoading ? AI_GREEN : COLORS.neutral[300]}
            />
          </TouchableOpacity>
        </View>
        <Text style={styles.poweredBy}>POWERED BY GROQ</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: SPACING.md,
    padding: SPACING.xs,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: AI_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.text.primary,
  },
  headerStatus: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: '#22c55e',
    fontWeight: TYPOGRAPHY.weights.medium,
  },

  // Messages
  messagesList: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  datePill: {
    alignSelf: 'center',
    backgroundColor: COLORS.neutral[100],
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.pill,
    marginVertical: SPACING.md,
  },
  datePillText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAi: {
    justifyContent: 'flex-start',
  },
  messageGroupEnd: {
    marginBottom: SPACING.md,
  },
  messageGroupContinue: {
    marginBottom: 2,
  },

  // Avatar
  avatarContainer: {
    width: 28,
    marginRight: 6,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: AI_GREEN,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarSpacer: {
    width: 28,
    height: 28,
  },

  // Bubbles
  bubbleWrapper: {
    maxWidth: '75%',
  },
  bubbleWrapperUser: {
    alignItems: 'flex-end',
  },
  bubbleWrapperAi: {
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleUser: {
    backgroundColor: AI_GREEN,
  },
  bubbleAi: {
    backgroundColor: COLORS.neutral[200],
  },
  bubbleUserLast: {
    borderBottomRightRadius: 4,
  },
  bubbleUserMid: {
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  bubbleAiLast: {
    borderBottomLeftRadius: 4,
  },
  bubbleAiMid: {
    borderTopLeftRadius: 4,
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bubbleTextUser: {
    color: '#fff',
  },
  bubbleTextAi: {
    color: COLORS.text.primary,
  },
  timestamp: {
    fontSize: 10,
    color: COLORS.text.tertiary,
    marginTop: 3,
  },
  timestampUser: {
    textAlign: 'right',
    marginRight: 2,
  },
  timestampAi: {
    textAlign: 'left',
    marginLeft: 2,
  },

  // Typing indicator
  typingBubble: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 5,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: AI_GREEN,
  },

  // Input
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    backgroundColor: '#fff',
    gap: SPACING.sm,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: COLORS.neutral[100],
    borderRadius: 22,
    paddingHorizontal: SPACING.lg,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : 0,
  },
  textInput: {
    fontSize: 14,
    color: COLORS.text.primary,
    maxHeight: 80,
    minHeight: 20,
    paddingVertical: Platform.OS === 'ios' ? 0 : SPACING.sm,
    // Text wrapping
    textAlignVertical: 'top',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 0 : 2,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  poweredBy: {
    textAlign: 'center',
    fontSize: 9,
    color: COLORS.neutral[300],
    letterSpacing: 1.5,
    fontWeight: TYPOGRAPHY.weights.medium,
    paddingBottom: SPACING.sm,
    backgroundColor: '#fff',
  },
});

export default AiChatScreen;
