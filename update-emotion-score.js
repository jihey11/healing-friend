#!/usr/bin/env node

/**
 * 특정 사용자의 감정 점수를 업데이트하는 스크립트
 * 사용법: node update-emotion-score.js <email> <emotion> <points>
 * 예시: node update-emotion-score.js ghrkrtldk@gmail.com 기쁨 30
 */

const admin = require('firebase-admin');
const readline = require('readline');

// Firebase Admin SDK 초기화
// 서비스 계정 키 파일이 필요합니다
// Firebase Console > 프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성

let serviceAccount;
try {
  // 서비스 계정 키 파일 경로 (환경 변수 또는 직접 지정)
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT || './firebase-service-account.json';
  serviceAccount = require(serviceAccountPath);
} catch (error) {
  console.error('❌ Firebase 서비스 계정 키 파일을 찾을 수 없습니다.');
  console.error('📝 Firebase Console에서 서비스 계정 키를 다운로드하고 firebase-service-account.json으로 저장하세요.');
  console.error('   Firebase Console > 프로젝트 설정 > 서비스 계정 > 새 비공개 키 생성');
  process.exit(1);
}

// Firebase Admin 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const auth = admin.auth();

/**
 * 이메일로 사용자 찾기 및 감정 점수 업데이트
 */
async function updateEmotionScore(email, emotion, points) {
  try {
    console.log(`\n🔍 사용자 찾는 중: ${email}`);
    
    // 1. 이메일로 사용자 찾기
    let user;
    try {
      user = await auth.getUserByEmail(email);
      console.log(`✅ 사용자 찾음: ${user.uid}`);
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.error(`❌ 사용자를 찾을 수 없습니다: ${email}`);
        return;
      }
      throw error;
    }

    const uid = user.uid;

    // 2. Firestore에서 사용자 데이터 가져오기
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.log('⚠️ Firestore에 사용자 데이터가 없습니다. 새로 생성합니다.');
      // 기본 데이터 생성
      await userRef.set({
        email: email,
        emotionScores: {
          기쁨: 0,
          슬픔: 0,
          분노: 0,
          두려움: 0,
          놀람: 0,
          혐오: 0
        },
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // 3. 현재 감정 점수 가져오기
    const userData = userDoc.data() || {};
    const currentEmotions = userData.emotionScores || {
      기쁨: 0,
      슬픔: 0,
      분노: 0,
      두려움: 0,
      놀람: 0,
      혐오: 0
    };

    const oldScore = currentEmotions[emotion] || 0;
    const newScore = Math.min(100, oldScore + points); // 최대 100점

    // 4. 감정 점수 업데이트
    const updatedEmotions = {
      ...currentEmotions,
      [emotion]: newScore
    };

    await userRef.update({
      emotionScores: updatedEmotions,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`\n✅ 감정 점수 업데이트 완료!`);
    console.log(`   감정: ${emotion}`);
    console.log(`   이전 점수: ${oldScore}`);
    console.log(`   추가 점수: +${points}`);
    console.log(`   새로운 점수: ${newScore}`);
    console.log(`\n📊 전체 감정 점수:`);
    Object.entries(updatedEmotions).forEach(([emotion, score]) => {
      console.log(`   ${emotion}: ${score}`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  }
}

// 명령줄 인자 파싱
const args = process.argv.slice(2);

if (args.length < 3) {
  console.log('📝 사용법: node update-emotion-score.js <email> <emotion> <points>');
  console.log('   예시: node update-emotion-score.js ghrkrtldk@gmail.com 기쁨 30');
  console.log('\n   감정 종류: 기쁨, 슬픔, 분노, 두려움, 놀람, 혐오');
  process.exit(1);
}

const [email, emotion, pointsStr] = args;
const points = parseInt(pointsStr, 10);

if (isNaN(points)) {
  console.error('❌ 점수는 숫자여야 합니다.');
  process.exit(1);
}

const validEmotions = ['기쁨', '슬픔', '분노', '두려움', '놀람', '혐오'];
if (!validEmotions.includes(emotion)) {
  console.error(`❌ 유효하지 않은 감정입니다. 사용 가능한 감정: ${validEmotions.join(', ')}`);
  process.exit(1);
}

// 실행
updateEmotionScore(email, emotion, points)
  .then(() => {
    console.log('\n✨ 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ 실패:', error);
    process.exit(1);
  });

