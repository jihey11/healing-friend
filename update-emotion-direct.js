/**
 * 직접 실행 가능한 감정 점수 업데이트 스크립트
 * 
 * 이 스크립트는 ghrkrtldk@gmail.com 계정의 기쁨 점수를 30점 올립니다.
 * 
 * 사용 방법:
 * 1. 웹사이트에 ghrkrtldk@gmail.com으로 로그인
 * 2. 브라우저 개발자 도구(F12) 열기
 * 3. Console 탭에서 아래 코드를 복사하여 붙여넣고 실행
 */

(async function() {
  const email = 'ghrkrtldk@gmail.com';
  const emotion = '기쁨';
  const points = 30;

  try {
    // Firebase 모듈 확인
    if (!window.firebaseModules) {
      console.error('❌ Firebase 모듈이 로드되지 않았습니다.');
      console.log('💡 페이지를 새로고침한 후 다시 시도해주세요.');
      return;
    }

    const { getAuth, getFirestore, doc, getDoc, setDoc, updateDoc } = window.firebaseModules;
    
    // Firebase 초기화 확인
    if (!window.db || !window.auth) {
      console.error('❌ Firebase가 초기화되지 않았습니다.');
      console.log('💡 페이지를 새로고침한 후 다시 시도해주세요.');
      return;
    }

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
    } else {
      const userData = userDoc.data();
      currentEmotions = userData.emotionScores || {
        기쁨: 0,
        슬픔: 0,
        분노: 0,
        두려움: 0,
        놀람: 0,
        혐오: 0
      };
    }

    // 감정 점수 업데이트
    const oldScore = currentEmotions[emotion] || 0;
    const newScore = Math.min(100, oldScore + points); // 최대 100점

    const updatedEmotions = {
      ...currentEmotions,
      [emotion]: newScore
    };

    // Firestore에 저장
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        email: email,
        emotionScores: updatedEmotions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      await updateDoc(userRef, {
        emotionScores: updatedEmotions,
        updatedAt: new Date().toISOString()
      });
    }

    console.log(`\n✅ 감정 점수 업데이트 완료!`);
    console.log(`   감정: ${emotion}`);
    console.log(`   이전 점수: ${oldScore}`);
    console.log(`   추가 점수: +${points}`);
    console.log(`   새로운 점수: ${newScore}`);
    console.log(`\n📊 전체 감정 점수:`);
    Object.entries(updatedEmotions).forEach(([emotionName, score]) => {
      console.log(`   ${emotionName}: ${score}`);
    });

    // 캐릭터 업데이트 (페이지에 캐릭터가 있는 경우)
    if (window.character) {
      window.character.emotions = updatedEmotions;
      window.character.render();
      console.log('✅ 캐릭터도 업데이트되었습니다.');
    }

    console.log('\n💡 페이지를 새로고침하면 변경사항이 반영됩니다.');
    console.log('✨ 완료!');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    console.error('상세 오류:', error.message);
    if (error.code) {
      console.error('오류 코드:', error.code);
    }
  }
})();

