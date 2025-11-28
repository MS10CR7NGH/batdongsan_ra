// SearchBuildingScreen.js
import React, { useState, useEffect  } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  Image,
} from 'react-native';
import { API_BASE_URL } from './App';
import BuildingDetailScreen from './BuildingDetailScreen';
import ChatScreen from './ChatScreen';
import AccountScreen from './AccountScreen';



const DEFAULT_AVATAR =
  'https://res.cloudinary.com/dksafd2ld/image/upload/v1763900452/9576d4e3-a3d7-41d0-8138-fee8f7c3313c_anh-ngoi-nha-15.jpg';

export default function SearchBuildingScreen({ token }) {
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [street, setStreet] = useState('');
  const [rentPriceFrom, setRentPriceFrom] = useState('');

  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [activeTab, setActiveTab] = useState('search'); // chatAI

  const handleSearch = async () => {
  setLoading(true);
  setError('');

  const payload = {
    name: name || null,
    district: district || null,
    ward: ward || null,
    street: street || null,
    rentPriceFrom: rentPriceFrom ? Number(rentPriceFrom) : null,
  };

  console.log('REQUEST PAYLOAD: ', payload);  // 👈 thêm dòng này

  try {
    const response = await fetch(`${API_BASE_URL}/customer/search/building`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const text = await response.text();       // <-- đọc text thô trước
    console.log('RAW RESPONSE: ', text);      // để debug

    if (!response.ok) {
      // nếu là trang lỗi HTML thì mình show ra để bạn thấy
      setError(text || 'Không tìm được tòa nhà phù hợp.');
      setBuildings([]);
      return;
    }

    let data;
    try {
      data = JSON.parse(text);                // tự parse JSON
    } catch (e) {
      console.error('JSON parse error', e);
      setError('Server không trả JSON hợp lệ:\n' + text.slice(0, 200));
      setBuildings([]);
      return;
    }

    if (Array.isArray(data)) {
      setBuildings(data);
    } else {
      setError('Dữ liệu trả về không phải list.');
      setBuildings([]);
    }
  } catch (e) {
    console.error(e);
    setError('Không thể kết nối tới server. Kiểm tra lại mạng hoặc URL backend.');
    setBuildings([]);
  } finally {
    setLoading(false);
  }
};

// Tự động load tất cả building khi vừa vào màn hình (sau khi login xong có token)
  useEffect(() => {
    if (token) {
      handleSearch();
    }
  }, [token]);

  // Nếu đang chọn 1 building -> hiện màn chi tiết
  if (selectedBuilding) {
    return (
      <BuildingDetailScreen
        building={selectedBuilding}
        onBack={() => setSelectedBuilding(null)}
      />
    );
  }


  const renderItem = ({ item, index }) => {
    const avatar =
      item.avatar && item.avatar.trim() !== '' ? item.avatar : DEFAULT_AVATAR;

    return (
      <TouchableOpacity onPress={() => setSelectedBuilding(item)}>
        <View style={styles.card}>
          <Image source={{ uri: avatar }} style={styles.cardImage} />

          <View style={styles.cardContent}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.vipBadge}>VIP Kim Cương</Text>
            </View>

            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.name || 'Không có tên tòa nhà'}
            </Text>

            <Text style={styles.cardAddress} numberOfLines={1}>
              📍 {item.address || 'Chưa có địa chỉ'}
            </Text>

            <View style={styles.cardInfoRow}>
              <Text style={styles.cardPrice}>
                {item.rentPrice != null
                  ? `${item.rentPrice.toLocaleString()} đ/tháng`
                  : 'Giá thỏa thuận'}
              </Text>
              {item.numberOfBasement != null && (
                <Text style={styles.cardBasement}>
                  Tầng hầm: {item.numberOfBasement}
                </Text>
              )}
            </View>

            <View style={styles.cardFooterRow}>
              <View style={styles.managerInfo}>
                <Text style={styles.managerPhone}>
                  ☎ {item.managerPhone || 'Chưa có SĐT'}
                </Text>
              </View>
              <TouchableOpacity style={styles.heartButton}>
                <Text style={styles.heartIcon}>♡</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
  <View style={styles.searchScreenContainer}>
    {activeTab === 'search' && (
      <>
        {/* HEADER ĐỎ + SEARCH BAR */}
        <View style={styles.header}>
          <Text style={styles.headerTime}>TowerHub</Text>

          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Chung cư Vinhomes 2 ngủ"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
            <TouchableOpacity style={styles.filterButton} onPress={handleSearch}>
              <Text style={styles.filterIcon}>🔍</Text>
            </TouchableOpacity>
          </View>

          <View className="filterRow" style={styles.filterRow}>
            <TextInput
              style={styles.filterInput}
              placeholder="Quận / Huyện"
              value={district}
              onChangeText={setDistrict}
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Phường / Xã"
              value={ward}
              onChangeText={setWard}
            />
          </View>

          <View style={styles.filterRow}>
            <TextInput
              style={styles.filterInput}
              placeholder="Đường"
              value={street}
              onChangeText={setStreet}
            />
            <TextInput
              style={styles.filterInput}
              placeholder="Giá thuê từ (đ)"
              value={rentPriceFrom}
              onChangeText={setRentPriceFrom}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, styles.searchButton]}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator />
            ) : (
              <Text style={styles.buttonText}>Tìm kiếm</Text>
            )}
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>

        {/* DANH SÁCH TÒA NHÀ */}
        <FlatList
          data={buildings}
          keyExtractor={(item, index) =>
            item.id ? String(item.id) : String(index)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !loading && (
              <Text style={styles.emptyText}>
                Nhập tiêu chí và bấm "Tìm kiếm" để xem danh sách tòa nhà.
              </Text>
            )
          }
        />
      </>
    )}
    {/* Tab Chat AI */}
    {activeTab === 'chat' && (
      <View style={{ flex: 1 }}>
        <ChatScreen />
      </View>
    )}

    {/* Tab Tài khoản */}
    {activeTab === 'account' && (
      <AccountScreen token={token} />
    )}

    {/* THANH MENU DƯỚI */}
    <View style={styles.bottomBar}>
      <TouchableOpacity
        style={styles.bottomItem}
        onPress={() => setActiveTab('search')}
      >
        <Text style={styles.bottomIcon}>🔍</Text>
        <Text style={styles.bottomLabel}>Tìm kiếm</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.bottomItem}
        onPress={() => setActiveTab('chat')}
      >
        <Text style={styles.bottomIcon}>💬</Text>
        <Text style={styles.bottomLabel}>Chat AI</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.bottomItem}
        onPress={() => setActiveTab('account')}
      >
        <Text style={styles.bottomIcon}>👤</Text>
        <Text style={styles.bottomLabel}>Tài khoản</Text>
      </TouchableOpacity>
    </View>
  </View>
);

}

const styles = StyleSheet.create({
  searchScreenContainer: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
  header: {
    backgroundColor: '#e60000',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTime: {
    color: 'white',
    fontWeight: '600',
    marginBottom: 8,
  },
  searchBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 999,
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
  },
  filterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterIcon: {
    fontSize: 18,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  filterInput: {
    flex: 1,
    height: 38,
    borderRadius: 20,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    fontSize: 13,
  },
  button: {
    marginTop: 12,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3333',
  },
  searchButton: {
    backgroundColor: '#ff3333',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  errorText: {
    color: 'white',
    marginTop: 8,
  },

  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 70,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  vipBadge: {
    backgroundColor: '#d60000',
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  cardTitle: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
  },
  cardAddress: {
    marginTop: 4,
    fontSize: 12,
    color: '#555',
  },
  cardInfoRow: {
    flexDirection: 'row',
    marginTop: 6,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    color: '#e60000',
    fontWeight: '700',
    fontSize: 14,
  },
  cardBasement: {
    fontSize: 12,
    color: '#444',
  },
  cardFooterRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  managerInfo: {
    flex: 1,
  },
  managerPhone: {
    fontSize: 13,
    fontWeight: '500',
  },
  heartButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 18,
  },

  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  bottomItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomIcon: {
    fontSize: 18,
  },
  bottomLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});
