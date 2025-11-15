/**
 * 브라우저 콘솔에서 실행할 수 있는 감정 점수 업데이트 스크립트
 * 
 * 사용 방법:
 * 1. 웹사이트에 로그인한 상태에서 브라우저 개발자 도구(F12) 열기
 * 2. Console 탭에서 아래 코드를 복사하여 붙여넣고 실행
 * 
 * 또는 이 파일의 내용을 복사하여 콘솔에 붙여넣기
 */

async function updateEmotionScore(email, emotion, points) {
  try {
    // Firebase 모듈 확인
    if (!window.firebaseModules) {
      console.error('❌ Firebase 모듈이 로드되지 않았습니다.');
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

    // 1. 이메일로 사용자 찾기 (Firebase Auth)
    // 주의: Firebase Auth는 이메일로 직접 사용자를 찾을 수 없으므로
    // Firestore에서 이메일로 검색하거나, 사용자가 로그인한 상태에서 실행해야 합니다.
    
    // 방법 1: 현재 로그인한 사용자의 점수만 업데이트
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error('❌ 로그인된 사용자가 없습니다.');
      console.log('💡 해당 이메일로 로그인한 후 다시 시도해주세요.');
      return;
    }

    if (currentUser.email !== email) {
      console.warn(`⚠️ 현재 로그인한 계정(${currentUser.email})과 요청한 계정(${email})이 다릅니다.`);
      console.log('💡 해당 이메일로 로그인한 후 다시 시도해주세요.');
      return;
    }

    const uid = currentUser.uid;
    console.log(`✅ 사용자 찾음: ${uid}`);

    // 2. Firestore에서 사용자 데이터 가져오기
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

    // 3. 감정 점수 업데이트
    const oldScore = currentEmotions[emotion] || 0;
    const newScore = Math.min(100, oldScore + points); // 최대 100점

    const updatedEmotions = {
      ...currentEmotions,
      [emotion]: newScore
    };

    // 4. Firestore에 저장
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
    Object.entries(updatedEmotions).forEach(([emotion, score]) => {
      console.log(`   ${emotion}: ${score}`);
    });

    // 5. 캐릭터 업데이트 (페이지에 캐릭터가 있는 경우)
    if (window.character) {
      window.character.emotions = updatedEmotions;
      window.character.render();
      console.log('✅ 캐릭터도 업데이트되었습니다.');
    }

    // 6. 페이지 새로고침 제안
    console.log('\n💡 페이지를 새로고침하면 변경사항이 반영됩니다.');

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    console.error('상세 오류:', error.message);
  }
}

// 실행 예시
// updateEmotionScore('ghrkrtldk@gmail.com', '기쁨', 30);

// 바로 실행하려면 아래 주석을 해제하세요
updateEmotionScore('ghrkrtldk@gmail.com', '기쁨', 30);

