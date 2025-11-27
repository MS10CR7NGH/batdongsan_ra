// ChatScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { API_BASE_URL } from './App';

export default function ChatScreen() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      from: 'bot',
      text: 'Xin chào 👋\nMình là trợ lý AI, bạn có thể hỏi về tòa nhà, giá thuê, khu vực,...',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      from: 'user',
      text: trimmed,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    console.log('API_BASE_URL = ', API_BASE_URL);

    try {
      const res = await fetch(`${API_BASE_URL}/customer/chat-ai`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed }),
      });

      const replyText = await res.text(); // backend trả String

      const botMessage = {
        id: `bot-${Date.now()}`,
        from: 'bot',
        text: replyText || 'Mình chưa nhận được nội dung trả lời.',
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      console.log(e);
      setMessages(prev => [
        ...prev,
        {
          id: `bot-error-${Date.now()}`,
          from: 'bot',
          text:
            'Có lỗi khi gọi đến server Chat AI.\nBạn kiểm tra lại kết nối hoặc server port 8001 giúp mình nhé.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const isUser = item.from === 'user';
    return (
      <View
        style={[
          styles.bubbleRow,
          isUser ? styles.bubbleRowRight : styles.bubbleRowLeft,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleBot,
          ]}
        >
          <Text style={isUser ? styles.bubbleTextUser : styles.bubbleTextBot}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat AI</Text>
        <Text style={styles.headerSubtitle}>
          Hỏi đáp về tòa nhà, khu vực, giá thuê...
        </Text>
      </View>

      {/* Vùng hiển thị tin nhắn */}
      <View style={styles.messagesWrapper}>
        <FlatList
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* Ô nhập + nút gửi luôn nằm ở đáy, trên bottom bar */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Nhập câu hỏi của bạn..."
          value={input}
          onChangeText={setInput}
          multiline
          returnKeyType="send"
          onSubmitEditing={() => {
            if (Platform.OS === 'ios') handleSend();
          }}
        />
        <TouchableOpacity
          style={[styles.sendButton, loading && { opacity: 0.6 }]}
          onPress={handleSend}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendText}>Gửi</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
    paddingBottom: 60,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  messagesWrapper: {
    flex: 1, // 👈 rất quan trọng để phần chat chiếm hết chiều cao còn lại
  },
  listContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingBottom: 8,
  },
  bubbleRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  bubbleRowLeft: {
    justifyContent: 'flex-start',
  },
  bubbleRowRight: {
    justifyContent: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  bubbleUser: {
    backgroundColor: '#e53935',
    borderBottomRightRadius: 2,
  },
  bubbleBot: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#eee',
  },
  bubbleTextUser: {
    color: '#fff',
    fontSize: 14,
  },
  bubbleTextBot: {
    color: '#222',
    fontSize: 14,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    maxHeight: 80,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#e53935',
    borderRadius: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontWeight: '600',
  },
});
