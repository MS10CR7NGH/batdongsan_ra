// App.js
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import LoginScreen from './LoginScreen';
import SearchBuildingScreen from './SearchBuildingScreen';

// ĐỔI LẠI CHO ĐÚNG BACKEND CỦA BẠN
// Android emulator:  'http://10.0.2.2:8080'
// iOS simulator:     'http://localhost:8080'
// Điện thoại thật:   'http://IP_LAN_MAY_TINH:8080'
export const API_BASE_URL = 'http://192.168.1.47:8081';
//export const CHAT_API_BASE_URL = 'http://192.168.1.47:5000';


export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);

  return (
    <SafeAreaView style={styles.container}>
      {isLoggedIn ? (
        <SearchBuildingScreen
          token={token}
          onLogout={() => {
            setToken(null);
            setIsLoggedIn(false);
          }}
        />
      ) : (
        <LoginScreen
          onLoginSuccess={(jwtToken) => {
            setToken(jwtToken);   // lưu token
            setIsLoggedIn(true);  // chuyển sang màn search
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fb',
  },
});


// // App.js
// import React, { useState } from 'react';
// import { SafeAreaView, StyleSheet } from 'react-native';
// import LoginScreen from './LoginScreen';
// import SearchBuildingScreen from './SearchBuildingScreen';

// // ĐỔI LẠI CHO ĐÚNG BACKEND CỦA BẠN
// // Android emulator:  'http://10.0.2.2:8080'
// // iOS simulator:     'http://localhost:8080'
// // Điện thoại thật:   'http://IP_LAN_MAY_TINH:8080'
// export const API_BASE_URL = 'http://192.168.1.29:8081';

// export default function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [token, setToken] = useState(null);

//   return (
//     <SafeAreaView style={styles.container}>
//       {isLoggedIn ? (
//         <SearchBuildingScreen token={token} />
//       ) : (
//         <LoginScreen
//           onLoginSuccess={(receivedToken) => {
//             setToken(receivedToken);
//             setIsLoggedIn(true);
//           }}
//         />
//       )}
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f4f6fb',
//   },
// });
