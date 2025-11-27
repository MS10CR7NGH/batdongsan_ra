// BuildingDetailScreen.js
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Linking,
  Alert } from 'react-native';

const DEFAULT_AVATAR =
  'https://res.cloudinary.com/dksafd2ld/image/upload/v1763900452/9576d4e3-a3d7-41d0-8138-fee8f7c3313c_anh-ngoi-nha-15.jpg';

export default function BuildingDetailScreen({ building, onBack }) {
  if (!building) return null;

  const avatar =
    building.avatar && building.avatar.trim() !== ''
      ? building.avatar
      : DEFAULT_AVATAR;

  const price =
    building.rentPrice != null
      ? `${building.rentPrice.toLocaleString()} đ`
      : 'Giá thỏa thuận';

  const area =
    building.floorArea != null ? `${building.floorArea} m²` : 'Chưa có diện tích';

  const normalizePhone = (raw) => {
    const digits = raw.replace(/[^\d]/g, '');

    // Nếu CSDL đang thiếu số 0 đầu, thường sẽ còn 9 số => tự thêm 0 vào đầu
    if (digits.length === 9) {
        return '0' + digits;
    }

    // Còn lại thì giữ nguyên
    return digits;
  };

  const handleZaloCall = async () => {
    if (!building.managerPhone) {
      Alert.alert('Không có số điện thoại', 'Tòa nhà này chưa có SĐT quản lý.');
      return;
    }

    const phone = normalizePhone(building.managerPhone);
    const zaloUrl = `https://zalo.me/${phone}`; // Zalo sẽ tự mở app nếu có

    try {
      const zaloSupported = await Linking.canOpenURL(zaloUrl);
      if (zaloSupported) {
        await Linking.openURL(zaloUrl);
        return;
      }

      // fallback: gọi điện thoại bình thường
      const telUrl = `tel:${phone}`;
      const telSupported = await Linking.canOpenURL(telUrl);
      if (telSupported) {
        await Linking.openURL(telUrl);
      } else {
        Alert.alert(
          'Không thể mở',
          'Thiết bị không hỗ trợ mở Zalo hoặc gọi điện với số này.',
        );
      }
    } catch (e) {
      console.log(e);
      Alert.alert('Lỗi', 'Không thể mở Zalo.');
    }
  };


  return (
    <View style={styles.detailContainer}>
      {/* Ảnh */}
      <View style={styles.detailImageWrapper}>
        <Image source={{ uri: avatar }} style={styles.detailImage} />

        {/* Nút back + share + tim */}
        <View style={styles.detailTopRow}>
          <TouchableOpacity style={styles.detailCircleButton} onPress={onBack}>
            <Text style={styles.detailCircleIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.detailTopRightButtons}>
            <TouchableOpacity style={styles.detailCircleButton}>
              <Text style={styles.detailCircleIcon}>⇪</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailCircleButton}>
              <Text style={styles.detailCircleIcon}>♡</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView style={styles.detailContent}>
        {/* Giá + diện tích */}
        <View style={styles.detailPriceRow}>
          <Text style={styles.detailPriceMain}>{price}</Text>
          <Text style={styles.detailArea}>{area}</Text>
        </View>

        {/* Tiêu đề + địa chỉ */}
        <Text style={styles.detailTitle}>
          {building.name || 'Không có tên tòa nhà'}
        </Text>
        <Text style={styles.detailAddress}>
          {building.address || 'Chưa có địa chỉ'}
        </Text>

        {/* Thông tin thêm */}
        <View style={{ marginTop: 16 }}>
          <Text style={styles.detailSectionTitle}>Thông tin chi tiết</Text>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Quản lý:</Text>
            <Text style={styles.detailValue}>{building.managerName || 'Chưa có'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số điện thoại:</Text>
            <Text style={styles.detailValue}>
              {building.managerPhone || 'Chưa có'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Số tầng hầm:</Text>
            <Text style={styles.detailValue}>
              {building.numberOfBasement != null
                ? building.numberOfBasement
                : 'Chưa có'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Diện tích thuê:</Text>
            <Text style={styles.detailValue}>{building.rentArea || 'Chưa có'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phí dịch vụ:</Text>
            <Text style={styles.detailValue}>
              {building.serviceFee || 'Chưa có'}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phí môi giới:</Text>
            <Text style={styles.detailValue}>
              {building.brokerageFee != null
                ? `${building.brokerageFee}`
                : 'Chưa có'}
            </Text>
          </View>
        </View>

        {/* Mô tả đơn giản */}
        <View style={{ marginTop: 16, marginBottom: 80 }}>
          <Text style={styles.detailSectionTitle}>Mô tả</Text>
          <Text style={styles.detailDescription}>
            Tòa nhà {building.name || ''} tại {building.address || '...'} với diện
            tích sử dụng {area}. Liên hệ quản lý{' '}
            {building.managerName || 'chưa cập nhật'} qua số điện thoại{' '}
            {building.managerPhone || 'chưa có'} để biết thêm chi tiết và lịch xem
            thực tế.
          </Text>
        </View>
      </ScrollView>

      {/* Thanh gọi điện dưới cùng */}
      <View style={styles.detailBottomBar}>
        <TouchableOpacity style={styles.callButton} onPress={handleZaloCall}>
          <Text style={styles.callButtonText}>Gọi ngay</Text>
          <Text style={styles.callButtonPhone}>
            {building.managerPhone || 'Chưa có SĐT'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  detailContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailImageWrapper: {
    width: '100%',
    height: 260,
    backgroundColor: '#000',
  },
  detailImage: {
    width: '100%',
    height: '100%',
  },
  detailTopRow: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailCircleButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailCircleIcon: {
    fontSize: 18,
  },
  detailTopRightButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  detailPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailPriceMain: {
    color: '#e53935',
    fontSize: 20,
    fontWeight: '700',
  },
  detailArea: {
    fontSize: 14,
    fontWeight: '600',
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailAddress: {
    fontSize: 13,
    color: '#666',
  },
  detailSectionTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '700',
  },
  detailRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  detailLabel: {
    width: 110,
    fontSize: 13,
    color: '#555',
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    color: '#222',
  },
  detailDescription: {
    marginTop: 6,
    fontSize: 13,
    color: '#333',
    lineHeight: 18,
  },
  detailBottomBar: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  callButton: {
    backgroundColor: '#e53935',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  callButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  callButtonPhone: {
    color: '#fff',
    marginTop: 2,
    fontSize: 13,
  },
});
