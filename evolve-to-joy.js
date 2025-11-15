/**
 * 캐릭터를 기쁨 감정으로 최종 진화(3단계)시키는 스크립트
 * 
 * 이 스크립트는 ghrkrtldk@gmail.com 계정의 캐릭터를 기쁨으로 진화시킵니다.
 * 
 * 사용 방법:
 * 1. 웹사이트에 ghrkrtldk@gmail.com으로 로그인
 * 2. 브라우저 개발자 도구(F12) 열기
 * 3. Console 탭에서 아래 코드를 복사하여 붙여넣고 실행
 */

(async function() {
  const email = 'ghrkrtldk@gmail.com';
  const targetEmotion = '기쁨';
  const targetScore = 90; // 최종 진화를 위한 점수
  const targetEvolutionStage = 3; // 최종 진화 단계

  // Firebase 초기화 대기 및 직접 초기화 함수
  async function waitForFirebase(maxWait = 30000) {
    const startTime = Date.now();
    const checkInterval = 200;
    
    return new Promise((resolve, reject) => {
      console.log('⏳ Firebase 초기화 대기 중...');
      
      // 즉시 한 번 확인 (window.db/auth 또는 config.js의 export 확인)
      const checkFirebase = () => {
        // 방법 1: window 객체에 직접 할당된 경우
        if (window.firebaseModules && window.db && window.auth) {
          return { db: window.db, auth: window.auth, modules: window.firebaseModules };
        }
        
        // 방법 2: config.js에서 import 시도
        try {
          // 동적 import는 여기서는 사용 불가, 대신 전역에서 확인
          if (typeof auth !== 'undefined' && typeof db !== 'undefined' && window.firebaseModules) {
            return { db: db, auth: auth, modules: window.firebaseModules };
          }
        } catch (e) {
          // 무시
        }
        
        return null;
      };
      
      const firebase = checkFirebase();
      if (firebase) {
        console.log('✅ Firebase가 이미 초기화되어 있습니다!');
        // window에 할당 (없는 경우)
        if (!window.db) window.db = firebase.db;
        if (!window.auth) window.auth = firebase.auth;
        resolve();
        return;
      }

      // Firebase 직접 초기화 시도
      const tryInitializeFirebase = () => {
        if (!window.firebaseModules) return false;
        
        try {
          const { initializeApp, getApp, getApps, getAuth, getFirestore } = window.firebaseModules;
          
          // Firebase 설정 확인
          if (!window.ENV || !window.ENV.FIREBASE_API_KEY || window.ENV.FIREBASE_API_KEY === 'your_firebase_api_key') {
            console.warn('⚠️ Firebase 설정이 없습니다.');
            return false;
          }
          
          const firebaseConfig = {
            apiKey: window.ENV.FIREBASE_API_KEY,
            authDomain: window.ENV.FIREBASE_AUTH_DOMAIN,
            projectId: window.ENV.FIREBASE_PROJECT_ID,
            storageBucket: window.ENV.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: window.ENV.FIREBASE_MESSAGING_SENDER_ID,
            appId: window.ENV.FIREBASE_APP_ID
          };
          
          let app;
          try {
            const apps = getApps ? getApps() : [];
            if (apps.length > 0) {
              app = apps[0];
            } else {
              app = initializeApp(firebaseConfig);
            }
          } catch (error) {
            if (error.code === 'app/duplicate-app') {
              app = getApp('[DEFAULT]');
            } else {
              throw error;
            }
          }
          
          const auth = getAuth(app);
          const db = getFirestore(app);
          
          // window에 할당
          window.auth = auth;
          window.db = db;
          
          console.log('✅ Firebase 직접 초기화 완료!');
          return true;
        } catch (error) {
          console.warn('⚠️ Firebase 직접 초기화 실패:', error.message);
          return false;
        }
      };

      // Firebase 모듈 로드 이벤트 리스너
      let eventListenerAdded = false;
      const onModulesLoaded = () => {
        console.log('📦 Firebase 모듈 로드됨, 초기화 시도 중...');
        if (tryInitializeFirebase()) {
          clearInterval(checkIntervalId);
          if (eventListenerAdded) {
            window.removeEventListener('firebaseModulesLoaded', onModulesLoaded);
          }
          resolve();
        }
      };

      // 이벤트 리스너 등록
      if (!eventListenerAdded) {
        window.addEventListener('firebaseModulesLoaded', onModulesLoaded);
        eventListenerAdded = true;
      }

      // 이미 모듈이 로드되어 있으면 즉시 시도
      if (window.firebaseModules) {
        onModulesLoaded();
      }

      // 주기적으로 확인
      const checkIntervalId = setInterval(() => {
        const elapsed = Date.now() - startTime;
        
        // Firebase 초기화 확인
        const firebase = checkFirebase();
        if (firebase) {
          clearInterval(checkIntervalId);
          if (eventListenerAdded) {
            window.removeEventListener('firebaseModulesLoaded', onModulesLoaded);
          }
          if (!window.db) window.db = firebase.db;
          if (!window.auth) window.auth = firebase.auth;
          console.log('✅ Firebase 초기화 완료!');
          resolve();
          return;
        }

        // 직접 초기화 시도
        if (window.firebaseModules && tryInitializeFirebase()) {
          clearInterval(checkIntervalId);
          if (eventListenerAdded) {
            window.removeEventListener('firebaseModulesLoaded', onModulesLoaded);
          }
          resolve();
          return;
        }

        // 타임아웃 체크
        if (elapsed >= maxWait) {
          clearInterval(checkIntervalId);
          if (eventListenerAdded) {
            window.removeEventListener('firebaseModulesLoaded', onModulesLoaded);
          }
          
          // 디버깅 정보 출력
          console.error('❌ Firebase 초기화 상태:');
          console.error('   firebaseModules:', !!window.firebaseModules);
          console.error('   window.ENV:', !!window.ENV);
          console.error('   FIREBASE_API_KEY:', !!window.ENV?.FIREBASE_API_KEY);
          console.error('   db:', !!window.db);
          console.error('   auth:', !!window.auth);
          
          reject(new Error('Firebase 초기화 시간 초과'));
        } else {
          // 진행 상황 표시 (5초마다)
          if (elapsed % 5000 < checkInterval) {
            console.log(`⏳ 대기 중... (${Math.floor(elapsed / 1000)}초 경과)`);
          }
        }
      }, checkInterval);
    });
  }

  try {
    // Firebase 초기화 대기 (최대 30초)
    try {
      await waitForFirebase(30000);
    } catch (error) {
      console.error('❌ Firebase 초기화 실패:', error.message);
      console.log('\n💡 해결 방법:');
      console.log('   1. 페이지를 완전히 새로고침하세요 (Ctrl+F5 또는 Cmd+Shift+R)');
      console.log('   2. 로그인 상태를 확인하세요');
      console.log('   3. 브라우저 콘솔에 다른 오류가 있는지 확인하세요');
      console.log('   4. 네트워크 연결을 확인하세요');
      return;
    }

    // 최종 확인
    if (!window.firebaseModules || !window.db || !window.auth) {
      console.error('❌ Firebase가 초기화되지 않았습니다.');
      console.error('   firebaseModules:', !!window.firebaseModules);
      console.error('   db:', !!window.db);
      console.error('   auth:', !!window.auth);
      console.log('\n💡 페이지를 새로고침한 후 다시 시도해주세요.');
      return;
    }

    const { doc, getDoc, setDoc, updateDoc } = window.firebaseModules;
    const auth = window.auth;
    const db = window.db;

    console.log(`\n🔍 사용자 찾는 중: ${email}`);

    // 현재 로그인한 사용자 확인
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ 로그인된 사용자가 없습니다.');
      console.log('💡 ghrkrtldk@gmail.com으로 로그인한 후 다시 시도해주세요.');
      return;
    }

    if (currentUser.email !== email) {
      console.warn(`⚠️ 현재 로그인한 계정(${currentUser.email})과 요청한 계정(${email})이 다릅니다.`);
      console.log('💡 ghrkrtldk@gmail.com으로 로그인한 후 다시 시도해주세요.');
      return;
    }

    const uid = currentUser.uid;
    console.log(`✅ 사용자 찾음: ${uid} (${email})`);

    // Firestore에서 사용자 데이터 가져오기
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    // 기쁨 색상 (진화에 사용)
    const joyColor = '#FFFF84'; // 기쁨 색상

    let userData;
    let currentEmotions;
    
    if (!userDoc.exists()) {
      console.log('⚠️ Firestore에 사용자 데이터가 없습니다. 새로 생성합니다.');
      currentEmotions = {
        기쁨: 0,
        슬픔: 0,
        분노: 0,
        두려움: 0,
        놀람: 0,
        혐오: 0
      };
      userData = {
        email: email,
        emotionScores: currentEmotions,
        evolutionStage: 0,
        firstEmotionColor: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    } else {
      userData = userDoc.data();
      currentEmotions = userData.emotionScores || {
        기쁨: 0,
        슬픔: 0,
        분노: 0,
        두려움: 0,
        놀람: 0,
        혐오: 0
      };
    }

    // 기쁨 점수를 90으로 설정 (최종 진화)
    const updatedEmotions = {
      ...currentEmotions,
      [targetEmotion]: targetScore
    };

    // 사용자 데이터 업데이트
    const updatedUserData = {
      emotionScores: updatedEmotions,
      evolutionStage: targetEvolutionStage,
      firstEmotionColor: joyColor, // 기쁨 색상으로 설정
      dominantEmotion: targetEmotion, // 최고 감정을 기쁨으로 설정
      updatedAt: new Date().toISOString()
    };

    // Firestore에 저장
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: email,
        ...updatedUserData,
        createdAt: new Date().toISOString()
      });
    } else {
      await updateDoc(userRef, updatedUserData);
    }

    console.log(`\n✅ 캐릭터 진화 완료!`);
    console.log(`   감정: ${targetEmotion}`);
    console.log(`   진화 단계: ${targetEvolutionStage}단계 (최종)`);
    console.log(`   기쁨 점수: ${targetScore}`);
    console.log(`   첫 감정 색상: ${joyColor}`);
    console.log(`\n📊 전체 감정 점수:`);
    Object.entries(updatedEmotions).forEach(([emotion, score]) => {
      const marker = emotion === targetEmotion ? '⭐' : '  ';
      console.log(`   ${marker} ${emotion}: ${score}`);
    });

    // 캐릭터 업데이트 (페이지에 캐릭터가 있는 경우)
    if (window.character) {
      window.character.emotions = updatedEmotions;
      window.character.evolutionStage = targetEvolutionStage;
      window.character.firstEmotionColor = joyColor;
      window.character.firstEmotion = targetEmotion;
      window.character.render();
      console.log('✅ 캐릭터도 업데이트되었습니다.');
    }

    console.log('\n💡 페이지를 새로고침하면 변경사항이 반영됩니다.');
    console.log('✨ 기쁨으로 최종 진화 완료! 🌟');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    console.error('상세 오류:', error.message);
    if (error.code) {
      console.error('오류 코드:', error.code);
    }
  }
})();

