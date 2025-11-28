// AccountScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { API_BASE_URL } from './App';
// dùng thư viện: npm i react-native-image-picker
import * as ImagePicker from 'expo-image-picker';

const DEFAULT_AVATAR =
  'https://res.cloudinary.com/dksafd2ld/image/upload/v1735642366/hom-booking_vxzxet.jpg';

export default function AccountScreen({ token }) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [avatarUrl, setAvatarUrl] = useState(null);   // link ảnh hiện tại (companyName)
  const [avatarFile, setAvatarFile] = useState(null); // file chọn mới (nếu có)

  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [demand, setDemand] = useState(''); // mật khẩu

  useEffect(() => {
    loadAccount();
  }, []);

  const loadAccount = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/customer/account`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        Alert.alert('Lỗi', text || 'Không tải được thông tin tài khoản');
        return;
      }

      const data = await res.json();
      setPhone(data.phone || '');
      setFullName(data.fullName || '');
      setEmail(data.email || '');
      setDemand(data.demand || '');
      setAvatarUrl(data.companyName || null);
    } catch (e) {
      console.log(e);
      Alert.alert('Lỗi', 'Không kết nối được tới server');
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
  // xin quyền truy cập thư viện ảnh (1 lần)
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert('Quyền bị từ chối', 'App cần quyền truy cập thư viện ảnh.');
    return;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  });

  if (result.canceled) {
    return;
  }

  const asset = result.assets && result.assets[0];
  if (asset) {
    setAvatarFile(asset);
    setAvatarUrl(asset.uri); // hiển thị preview
  }
};


  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Cảnh báo', 'Vui lòng nhập họ tên');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Cảnh báo', 'Vui lòng nhập email');
      return;
    }
    if (!demand.trim()) {
      Alert.alert('Cảnh báo', 'Vui lòng nhập mật khẩu');
      return;
    }

    try {
      setSaving(true);

      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('email', email);
      formData.append('demand', demand);

      if (avatarFile) {
        formData.append('file', {
          uri: avatarFile.uri,
          name: avatarFile.fileName || 'avatar.jpg',
          type: avatarFile.type || 'image/jpeg',
        });
      }

      const res = await fetch(`${API_BASE_URL}/customer/account/update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // KHÔNG set Content-Type, để RN tự set boundary cho multipart
        },
        body: formData,
      });

      const text = await res.text();
      if (!res.ok) {
        Alert.alert('Lỗi', text || 'Cập nhật tài khoản thất bại');
        return;
      }

      Alert.alert('Thành công', text || 'Cập nhật tài khoản thành công');
    } catch (e) {
      console.log(e);
      Alert.alert('Lỗi', 'Không kết nối được tới server');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Đang tải thông tin tài khoản...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Ảnh đại diện */}
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: avatarUrl || DEFAULT_AVATAR }}
          style={styles.avatar}
        />
        <TouchableOpacity style={styles.changeAvatarBtn} onPress={pickImage}>
          <Text style={styles.changeAvatarText}>
            {avatarUrl ? 'Đổi ảnh' : 'Chọn ảnh'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Phone: chỉ hiển thị, không cho sửa */}
      <View style={styles.field}>
        <Text style={styles.label}>Số điện thoại</Text>
        <TextInput
          style={[styles.input, { backgroundColor: '#eee', color: '#666' }]}
          value={phone}
          editable={false}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Họ tên</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nhập họ tên"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Nhập email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Mật khẩu</Text>
        <TextInput
          style={styles.input}
          value={demand}
          onChangeText={setDemand}
          placeholder="Nhập mật khẩu"
          secureTextEntry
        />
      </View>

      <TouchableOpacity
        style={styles.saveBtn}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Lưu thay đổi</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: 16,
  },
  avatarWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  changeAvatarBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007bff',
  },
  changeAvatarText: {
    color: '#007bff',
    fontWeight: '600',
  },
  field: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  saveBtn: {
    marginTop: 16,
    backgroundColor: '#007bff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: {
    color: '#fff',
    fontWeight: '600',
  },
});
