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

  try {
    // Firebase 모듈 확인
    if (!window.firebaseModules) {
      console.error('❌ Firebase 모듈이 로드되지 않았습니다.');
      console.log('💡 페이지를 새로고침한 후 다시 시도해주세요.');
      return;
    }

    const { doc, getDoc, setDoc, updateDoc } = window.firebaseModules;
    
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

