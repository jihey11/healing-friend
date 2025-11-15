// Firebase 의존성 제거 (데모 모드 지원)
// import { db, OPENAI_API_KEY } from './config.js';
// import { 
//   doc, 
//   setDoc, 
//   getDoc, 
//   collection, 
//   query, 
//   where, 
//   orderBy, 
//   limit, 
//   getDocs, 
//   updateDoc, 
//   deleteDoc, 
//   serverTimestamp 
// } from 'firebase/firestore';

// 데모 모드용 설정
const OPENAI_API_KEY = window.ENV?.OPENAI_API_KEY || 'your_openai_api_key_here';

// showToast 함수는 utils.js에서 전역으로 사용
// utils.js에서 window.showToast로 노출되므로 직접 사용

// Firebase 함수들을 동적으로 가져오는 헬퍼 함수
function getFirebaseAuth() {
  if (window.firebaseModules) {
    return window.firebaseModules;
  }
  return null;
}

function getFirebaseFirestore() {
  if (window.firebaseModules) {
    return window.firebaseModules;
  }
  return null;
}

/**
 * 감정 분석용 키워드 사전
 */
const KEYWORDS = {
  기쁨: ['행복', '좋아', '신나', '즐거', '웃', '기쁨', '재미', '최고', '사랑', '감사', '만족', '뿌듯', '즐겁', '기쁘', '신기', '멋져', '완벽', '대단', '훌륭', '훌륭하'],
  슬픔: ['힘들', '우울', '슬프', '외로', '속상', '눈물', '아프', '그립', '허전', '우는', '쓸쓸', '눈물', '울고', '슬퍼', '우울하', '힘들어', '아픔', '고통', '괴로', '괴로워'],
  분노: ['화', '짜증', '열받', '싫', '미워', '빡', '답답', '억울', '분하', '짜증나', '화나', '열받아', '미워해', '싫어', '빡쳐', '답답해', '억울해', '분노', '격분', '성나'],
  두려움: ['무서', '걱정', '불안', '떨', '겁', '두려', '긴장', '초조', '불안하', '무섭', '무서워', '걱정돼', '불안해', '떨려', '겁나', '두려워', '긴장돼', '초조해', '불안감', '공포'],
  놀람: ['놀랐', '깜짝', '헐', '대박', '충격', '믿', '의외', '갑자기', '놀라', '예상못한', '깜짝놀라', '헉', '와', '오', '어', '어?', '어?', '어?', '어?', '어?'],
  혐오: ['역겹', '싫증', '지겨', '질', '더러', '구역', '짜증', '질려', '지긋지긋', '역겨워', '싫증나', '지겨워', '질려', '더러워', '구역질', '혐오', '싫어', '거부', '거부감', '불쾌']
};

/**
 * 일기 관리 클래스
 */
class DiaryManager {
  constructor(uid) {
    this.uid = uid;
    this.currentEmotion = null;
  }

  /**
   * 키워드 기반 감정 분석
   * @param {string} text - 분석할 텍스트
   * @returns {Object} 감정별 점수
   */
  analyzeByKeywords(text) {
    try {
      const scores = {
        기쁨: 0, 슬픔: 0, 분노: 0,
        두려움: 0, 놀람: 0, 혐오: 0
      };

      for (const [emotion, keywords] of Object.entries(KEYWORDS)) {
        for (const keyword of keywords) {
          // 키워드가 텍스트에 포함되면 +0.5점
          const regex = new RegExp(keyword, 'g');
          const matches = text.match(regex);
          if (matches) {
            scores[emotion] += matches.length * 0.5;
          }
        }
        
        // 최대 5점으로 제한
        scores[emotion] = Math.min(5, scores[emotion]);
      }

      return scores;
    } catch (error) {
      console.error('키워드 분석 실패:', error);
      return { 기쁨: 0, 슬픔: 0, 분노: 0, 두려움: 0, 놀람: 0, 혐오: 0 };
    }
  }

  /**
   * GPT-4 API를 사용한 감정 분석 (백엔드 API 사용)
   * @param {string} text - 분석할 텍스트
   * @returns {Object|null} 감정별 점수 또는 null
   */
  async analyzeByGPT(text) {
    try {
      // 최소 길이 체크 (10자 이상)
      if (!text || text.trim().length < 10) {
        console.warn('⚠️ 일기 내용이 10자 미만입니다. GPT 분석을 건너뜁니다.');
        return null;
      }

      // 백엔드 API URL 가져오기
      let API_URL = window.ENV?.API_URL || 'http://localhost:3000';
      
      // https:// 프로토콜 자동 추가 (도메인만 입력한 경우)
      if (API_URL && !API_URL.startsWith('http://') && !API_URL.startsWith('https://')) {
        API_URL = `https://${API_URL}`;
        console.warn('⚠️ API_URL에 프로토콜이 없어서 https://를 추가했습니다:', API_URL);
      }

      // 백엔드 API 호출
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          diaryText: text
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success || !data.emotions) {
        throw new Error('감정 분석 실패');
      }
      
      const scores = data.emotions;
      
      // 0-5 범위로 변환 (백엔드에서는 0-100으로 반환)
      const convertedScores = {};
      for (const emotion in scores) {
        convertedScores[emotion] = Math.round((scores[emotion] / 100) * 5 * 10) / 10;
      }
      
      return convertedScores;
    } catch (error) {
      console.error('GPT 분석 실패:', error);
      return null;
    }
  }

  /**
   * 하이브리드 감정 분석 (키워드 + GPT)
   * @param {string} text - 분석할 텍스트
   * @returns {Object} 최종 감정 점수
   */
  async hybridAnalysis(text) {
    try {
      // 1차: 키워드 분석 (즉시)
      const keywordScores = this.analyzeByKeywords(text);
      
      // 2차: GPT 분석 (비동기)
      const gptScores = await this.analyzeByGPT(text);

      // 가중 평균 (키워드 40% + GPT 60%)
      const finalScores = {};
      for (const emotion in keywordScores) {
        if (gptScores && gptScores[emotion] !== undefined) {
          finalScores[emotion] = keywordScores[emotion] * 0.4 + gptScores[emotion] * 0.6;
        } else {
          // GPT 실패 시 키워드 결과만 사용
          finalScores[emotion] = keywordScores[emotion];
        }
        
        // 반올림
        finalScores[emotion] = Math.round(finalScores[emotion] * 10) / 10;
      }

      return finalScores;
    } catch (error) {
      console.error('하이브리드 분석 실패:', error);
      return this.analyzeByKeywords(text);
    }
  }

  /**
   * 일기 작성 가능 여부 확인 (24시간 제한)
   * @returns {Object} 작성 가능 여부와 다음 작성 시간
   */
  async canWriteToday() {
    try {
      // 관리자 계정은 무제한 일기 작성 가능
      if (window.currentUser && window.currentUser.isAdmin) {
        return { can: true, nextTime: null };
      }
      
      // 데모 모드에서는 로컬 스토리지에서 확인 (사용자별로 저장)
      if (this.uid.startsWith('demo_')) {
        // 마지막 일기 작성 시간 확인
        const lastDiaryTimeKey = `lastDiaryTime_${this.uid}`;
        const lastDiaryTimeStr = localStorage.getItem(lastDiaryTimeKey);
        
        if (!lastDiaryTimeStr) {
          // 일기를 한 번도 작성하지 않았으면 작성 가능
          return { can: true, nextTime: null };
        }
        
        const lastDiaryTime = new Date(lastDiaryTimeStr);
        const now = new Date();
        const diff = now - lastDiaryTime;
        const hours24 = 24 * 60 * 60 * 1000; // 24시간을 밀리초로
        
        if (diff < hours24) {
          // 24시간이 지나지 않았으면 다음 작성 가능 시간 계산
          const nextTime = new Date(lastDiaryTime.getTime() + hours24);
          return { can: false, nextTime: nextTime };
        }
        
        // 24시간이 지났으면 작성 가능
        return { can: true, nextTime: null };
      }
      
      // Firebase 모드
      const { db } = await import('./config.js');
      const firebaseFirestore = getFirebaseFirestore();
      
      if (firebaseFirestore && db && window.firebaseModules) {
        const { doc, getDoc } = window.firebaseModules;
        const userRef = doc(db, 'users', this.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          // lastDiaryTime 또는 lastDiaryDate 필드 확인 (호환성)
          const lastDiaryDate = userData.lastDiaryTime || userData.lastDiaryDate;
          
          // lastDiaryDate가 없거나 null이면 일기를 한 번도 작성하지 않은 것
          if (!lastDiaryDate) {
            // console.log('canWriteToday: lastDiaryDate가 없습니다. 일기 작성 가능');
            return { can: true, nextTime: null };
          }
          
          // Firestore Timestamp를 Date로 변환
          let lastDiaryTime;
          try {
            if (lastDiaryDate.toDate) {
              // Firestore Timestamp
              lastDiaryTime = lastDiaryDate.toDate();
            } else if (lastDiaryDate instanceof Date) {
              lastDiaryTime = lastDiaryDate;
            } else if (typeof lastDiaryDate === 'string') {
              lastDiaryTime = new Date(lastDiaryDate);
            } else if (lastDiaryDate.seconds) {
              // Firestore Timestamp (seconds 필드가 있는 경우)
              lastDiaryTime = new Date(lastDiaryDate.seconds * 1000);
            } else {
              // 예상치 못한 형식이면 작성 가능으로 처리하지 않고 에러 로그만
              console.warn('⚠️ lastDiaryTime 형식이 예상과 다릅니다:', lastDiaryDate);
              // 안전하게 false 반환 (타이머 유지)
              return { can: false, nextTime: new Date(Date.now() + 24 * 60 * 60 * 1000) };
            }
          } catch (error) {
            console.error('lastDiaryTime 변환 실패:', error);
            // 변환 실패 시 안전하게 false 반환
            return { can: false, nextTime: new Date(Date.now() + 24 * 60 * 60 * 1000) };
          }
          
          // 유효한 날짜인지 확인
          if (isNaN(lastDiaryTime.getTime())) {
            console.warn('⚠️ lastDiaryTime이 유효하지 않은 날짜입니다:', lastDiaryDate);
            // 유효하지 않은 날짜면 안전하게 false 반환
            return { can: false, nextTime: new Date(Date.now() + 24 * 60 * 60 * 1000) };
          }
          
          const now = new Date();
          const diff = now - lastDiaryTime;
          const hours24 = 24 * 60 * 60 * 1000;
          
          // 디버깅 로그 제거 (타이머에서 1초마다 호출되어 콘솔이 너무 많이 출력됨)
          // console.log('canWriteToday: 날짜 비교', { 
          //   lastDiaryTime: lastDiaryTime.toISOString(), 
          //   now: now.toISOString(), 
          //   diffHours: diff / (60 * 60 * 1000) 
          // });
          
          if (diff < hours24) {
            const nextTime = new Date(lastDiaryTime.getTime() + hours24);
            // console.log('canWriteToday: 24시간 미경과, 다음 시간:', nextTime.toISOString());
            return { can: false, nextTime: nextTime };
          }
          
          // console.log('canWriteToday: 24시간 경과, 일기 작성 가능');
          return { can: true, nextTime: null };
        }
      }
      
      return { can: true, nextTime: null };
    } catch (error) {
      console.error('일기 작성 가능 여부 확인 실패:', error);
      return { can: true, nextTime: null };
    }
  }

  /**
   * 다음 작성 가능 시간 포맷팅
   * @param {Date} nextTime - 다음 작성 가능 시간
   * @returns {string} 포맷된 시간 문자열
   */
  formatNextTime(nextTime) {
    try {
      if (!nextTime) return '지금 작성 가능';
      
      const now = new Date();
      const diff = nextTime - now;

      if (diff <= 0) return '지금 작성 가능';

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (hours > 0) {
        return `${hours}시간 ${minutes}분 ${seconds}초 후`;
      } else if (minutes > 0) {
        return `${minutes}분 ${seconds}초 후`;
      } else {
        return `${seconds}초 후`;
      }
    } catch (error) {
      console.error('시간 포맷팅 실패:', error);
      return '지금 작성 가능';
    }
  }

  /**
   * 로컬 스토리지에 일기 저장 (데모 모드 및 폴백용)
   * @param {string} content - 일기 내용
   * @param {string} selectedEmotion - 선택된 감정
   * @param {Object} emotionScores - 감정 점수
   * @returns {Object} 저장 결과
   */
  async saveToLocalStorage(content, selectedEmotion, emotionScores) {
    try {
      const diaryId = `diary_${Date.now()}`;
      const diaryData = {
        id: diaryId,
        content,
        selectedEmotion,
        analysisResult: emotionScores,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // 일기 저장 (사용자별로 저장)
      const storageKey = `diaries_${this.uid}`;
      const existingDiaries = JSON.parse(localStorage.getItem(storageKey) || '[]');
      existingDiaries.unshift(diaryData);
      localStorage.setItem(storageKey, JSON.stringify(existingDiaries));
      
      // 마지막 일기 작성 시간 저장 (사용자별) - 현재 시간 저장
      const lastDiaryTimeKey = `lastDiaryTime_${this.uid}`;
      const now = new Date();
      localStorage.setItem(lastDiaryTimeKey, now.toISOString());
      
      // 캐릭터 감정 업데이트
      const characterData = JSON.parse(localStorage.getItem('characterData') || '{}');
      if (characterData.emotions) {
        for (const emotion in emotionScores) {
          characterData.emotions[emotion] = Math.min(100, (characterData.emotions[emotion] || 0) + emotionScores[emotion]);
        }
        localStorage.setItem('characterData', JSON.stringify(characterData));
        
        // 캐릭터 객체 업데이트 및 렌더링
        if (window.character) {
          window.character.emotions = characterData.emotions;
          window.character.render();
          console.log('캐릭터 감정 업데이트 완료:', characterData.emotions);
          
          // 관리자 계정일 때만 감정 점수 UI 업데이트
          if (window.currentUser && window.currentUser.isAdmin) {
            window.updateEmotionScores(characterData.emotions);
          }
        }
      }
      
      window.showToast('일기가 저장되었습니다! ✨');
      return { success: true, emotionScores, diaryId };
    } catch (error) {
      console.error('로컬 스토리지 저장 실패:', error);
      throw error;
    }
  }

  /**
   * 일기 저장
   * @param {string} content - 일기 내용
   * @param {string} selectedEmotion - 선택된 감정
   * @returns {Object} 저장 결과
   */
  async saveDiary(content, selectedEmotion) {
    try {
      // 작성 가능 여부 확인
      const { can } = await this.canWriteToday();
      if (!can) {
        throw new Error('24시간 후에 다시 작성할 수 있습니다.');
      }

      // 최소 길이 체크 (10자 이상)
      if (!content || content.trim().length < 10) {
        throw new Error('일기 내용은 최소 10자 이상이어야 합니다.');
      }

      // 감정 분석
      window.showToast('감정 분석 중...', 5000);
      const emotionScores = await this.hybridAnalysis(content);
      
      // 데모 모드에서는 로컬 스토리지에 저장
      if (this.uid.startsWith('demo_')) {
        return await this.saveToLocalStorage(content, selectedEmotion, emotionScores);
      }

      // Firebase 모드 - Firestore 사용
      // 인증 상태 확인
      if (!window.firebaseModules || !window.db || !window.auth) {
        console.warn('⚠️ Firebase가 초기화되지 않았습니다. 로컬 스토리지로 저장합니다.');
        return await this.saveToLocalStorage(content, selectedEmotion, emotionScores);
      }

      const firebaseModules = window.firebaseModules;
      const db = window.db;
      const auth = window.auth;
      
      // 인증된 사용자인지 확인
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== this.uid) {
        console.warn('⚠️ 인증되지 않은 사용자입니다. 로컬 스토리지로 저장합니다.');
        return await this.saveToLocalStorage(content, selectedEmotion, emotionScores);
      }
      
      try {
        const { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } = firebaseModules;
          
        // 일기 저장
          const diaryData = {
            uid: this.uid,
            content,
            selectedEmotion,
            analysisResult: emotionScores,
            createdAt: serverTimestamp ? serverTimestamp() : new Date(),
            updatedAt: serverTimestamp ? serverTimestamp() : new Date()
          };
          
          // diaries 컬렉션에 새 문서 추가
          const diariesRef = collection(db, 'diaries');
          const diaryDocRef = await addDoc(diariesRef, diaryData);
          const diaryId = diaryDocRef.id;
          
          // 마지막 일기 작성 시간을 users 문서에 저장
          const userRef = doc(db, 'users', this.uid);
          await setDoc(userRef, {
            lastDiaryDate: serverTimestamp ? serverTimestamp() : new Date()
          }, { merge: true });
          
          // 캐릭터 감정 업데이트 (Firestore에 저장)
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const currentEmotions = userData.emotionScores || {
              기쁨: 0, 슬픔: 0, 분노: 0, 두려움: 0, 놀람: 0, 혐오: 0
            };
            
            // 감정 점수 업데이트
            for (const emotion in emotionScores) {
              currentEmotions[emotion] = Math.min(100, (currentEmotions[emotion] || 0) + emotionScores[emotion]);
            }
            
            // Firestore에 업데이트된 감정 저장
            await setDoc(userRef, {
              emotionScores: currentEmotions
            }, { merge: true });
            
            // 캐릭터 객체 업데이트 및 렌더링
            if (window.character) {
              window.character.emotions = currentEmotions;
              window.character.render();
              console.log('✅ Firestore - 캐릭터 감정 업데이트 완료:', currentEmotions);
            }
          }
          
          console.log('✅ Firestore - 일기 저장 완료:', diaryId);
          window.showToast('일기가 저장되었습니다! ✨');
          return { success: true, emotionScores, diaryId };
        } catch (firebaseError) {
          console.error('❌ Firebase 저장 오류:', firebaseError);
          // Firebase 권한 오류 또는 기타 오류 시 로컬 스토리지로 폴백
          if (firebaseError.code === 'permission-denied' || 
              firebaseError.code === 'unavailable' ||
              firebaseError.message?.includes('permissions') ||
              firebaseError.message?.includes('network')) {
            console.warn('⚠️ Firebase 오류, 로컬 스토리지로 폴백:', firebaseError.message);
            return await this.saveToLocalStorage(content, selectedEmotion, emotionScores);
          }
          // 다른 오류는 다시 throw하여 상위에서 처리
          throw firebaseError;
        }
    } catch (error) {
      console.error('일기 저장 실패:', error);
      window.showToast('일기 저장에 실패했습니다.', 3000);
      return { success: false, error: error.message };
    }
  }

  /**
   * 일기 목록 불러오기
   * @param {number} limitCount - 불러올 개수
   * @returns {Array} 일기 목록
   */
  async loadDiaries(limitCount = 10) {
    try {
      // 데모 모드에서는 로컬 스토리지에서 불러오기 (사용자별)
      if (this.uid.startsWith('demo_')) {
        const storageKey = `diaries_${this.uid}`;
        const diaries = JSON.parse(localStorage.getItem(storageKey) || '[]');
        return diaries.slice(0, limitCount);
      }
      
      // Firebase 모드 (추후 구현)
      // const diariesRef = collection(db, 'diaries', this.uid, 'entries');
      // const q = query(
      //   diariesRef,
      //   orderBy('createdAt', 'desc'),
      //   limit(limitCount)
      // );
      // const snapshot = await getDocs(q);
      
      return [];
    } catch (error) {
      console.error('일기 불러오기 실패:', error);
      return [];
    }
  }

  /**
   * 일기 수정 가능 여부 확인
   * @param {Date} createdAt - 작성 시간
   * @returns {boolean} 수정 가능 여부
   */
  canEdit(createdAt) {
    try {
      const created = createdAt.toDate();
      const now = new Date();
      const diff = now - created;
      const hours = diff / (1000 * 60 * 60);
      return hours < 24;
    } catch (error) {
      console.error('수정 가능 여부 확인 실패:', error);
      return false;
    }
  }

  /**
   * 일기 수정
   * @param {string} diaryId - 일기 ID
   * @param {string} newContent - 새로운 내용
   * @returns {Object} 수정 결과
   */
  async updateDiary(diaryId, newContent) {
    try {
      const diaryRef = doc(db, 'diaries', this.uid, 'entries', diaryId);
      const diarySnap = await getDoc(diaryRef);
      
      if (!diarySnap.exists()) {
        throw new Error('일기를 찾을 수 없습니다.');
      }
      
      const diaryData = diarySnap.data();
      
      if (!this.canEdit(diaryData.createdAt)) {
        throw new Error('작성 후 24시간이 지나 수정할 수 없습니다.');
      }
      
      // 재분석
      const emotionScores = await this.hybridAnalysis(newContent);
      
      await updateDoc(diaryRef, {
        content: newContent,
        analysisResult: emotionScores,
        updatedAt: serverTimestamp()
      });
      
      window.showToast('일기가 수정되었습니다.');
      return { success: true };
    } catch (error) {
      console.error('일기 수정 실패:', error);
      window.showToast(error.message, 3000);
      return { success: false, error: error.message };
    }
  }

  /**
   * 일기 삭제
   * @param {string} diaryId - 일기 ID
   * @returns {Object} 삭제 결과
   */
  async deleteDiary(diaryId) {
    try {
      if (!confirm('정말 삭제하시겠습니까?\n삭제된 일기는 복구할 수 없습니다.')) {
        return { success: false };
      }
      
      await deleteDoc(doc(db, 'diaries', this.uid, 'entries', diaryId));
      
      window.showToast('일기가 삭제되었습니다.');
      return { success: true };
    } catch (error) {
      console.error('일기 삭제 실패:', error);
      window.showToast('일기 삭제에 실패했습니다.', 3000);
      return { success: false, error: error.message };
    }
  }
}

/**
 * 일기 UI 설정
 * @param {string} uid - 사용자 ID
 * @param {Character} character - 캐릭터 인스턴스
 * @returns {DiaryManager} 일기 매니저 인스턴스
 */
export function setupDiaryUI(uid, character) {
  try {
    console.log('일기 UI 설정 시작:', uid);
    
    const diaryManager = new DiaryManager(uid);
    const emotionBtns = document.querySelectorAll('.emotion-btn');
    const diaryContent = document.getElementById('diary-content');
    const charCount = document.getElementById('char-count');
    const saveBtn = document.getElementById('diary-save');
    const cancelBtn = document.getElementById('diary-cancel');
    const diaryError = document.getElementById('diary-error');
    
    console.log('DOM 요소 확인:', {
      emotionBtns: emotionBtns.length,
      diaryContent: !!diaryContent,
      charCount: !!charCount,
      saveBtn: !!saveBtn,
      cancelBtn: !!cancelBtn,
      diaryError: !!diaryError
    });
    
    let selectedEmotion = null;

    // 초기 로드 시 일기 작성 가능 여부 확인 및 UI 업데이트
    (async () => {
      try {
        const { can, nextTime } = await diaryManager.canWriteToday();
        
        if (!can) {
          // 일기를 이미 썼으면 입력 필드와 버튼 비활성화
          if (diaryContent) {
            diaryContent.disabled = true;
            diaryContent.placeholder = '24시간 후에 다시 작성할 수 있습니다.';
          }
          if (saveBtn) {
            saveBtn.disabled = true;
            saveBtn.textContent = '오늘 작성 완료';
          }
          if (emotionBtns.length > 0) {
            emotionBtns.forEach(btn => {
              btn.disabled = true;
              btn.style.opacity = '0.5';
              btn.style.cursor = 'not-allowed';
            });
          }
          
          // 다음 작성 가능 시간 표시 (실시간 업데이트)
          if (nextTime && diaryError) {
            let errorTimerInterval = null;
            const updateErrorTimer = () => {
              diaryManager.canWriteToday().then(({ can: canNow, nextTime: nextTimeNow }) => {
                if (canNow) {
                  diaryError.textContent = '';
                  if (errorTimerInterval) {
                    clearInterval(errorTimerInterval);
                    errorTimerInterval = null;
                  }
                } else {
                  const timeStr = diaryManager.formatNextTime(nextTimeNow);
                  diaryError.textContent = `다음 일기 작성 가능 시간: ${timeStr}`;
                  diaryError.style.color = 'var(--color-text-light)';
                }
              });
            };
            
            updateErrorTimer();
            errorTimerInterval = setInterval(updateErrorTimer, 1000);
            
            // 페이지 이탈 시 타이머 정리
            const cleanup = () => {
              if (errorTimerInterval) {
                clearInterval(errorTimerInterval);
                errorTimerInterval = null;
              }
            };
            window.addEventListener('beforeunload', cleanup);
          }
        } else {
          // 작성 가능하면 정상적으로 활성화
          if (diaryContent) {
            diaryContent.disabled = false;
            diaryContent.placeholder = '오늘 하루는 어땠나요? (최소 10자)';
          }
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = '저장';
          }
          if (emotionBtns.length > 0) {
            emotionBtns.forEach(btn => {
              btn.disabled = false;
              btn.style.opacity = '1';
              btn.style.cursor = 'pointer';
            });
          }
        }
        
        // 헤더의 일기 작성 가능 시간도 업데이트
        await updateNextDiaryTime(uid);
      } catch (error) {
        console.error('일기 작성 가능 여부 확인 실패:', error);
      }
    })();

    // 감정 선택 이벤트
    emotionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        try {
          emotionBtns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          selectedEmotion = btn.dataset.emotion;
          
          checkCanSave();
        } catch (error) {
          console.error('감정 선택 실패:', error);
        }
      });
    });

    // 글자 수 카운트
    diaryContent.addEventListener('input', () => {
      try {
        const length = diaryContent.value.length;
        charCount.textContent = `${length}/10`;
        
        if (length >= 10) {
          charCount.style.color = 'var(--color-success)';
        } else {
          charCount.style.color = 'var(--color-error)';
        }

        checkCanSave();
      } catch (error) {
        console.error('글자 수 카운트 실패:', error);
      }
    });

    /**
     * 저장 가능 여부 확인
     */
    function checkCanSave() {
      try {
        const length = diaryContent.value.length;
        const hasContent = selectedEmotion && length >= 10;
        
        // 관리자 계정은 24시간 제한 무시
        if (window.currentUser && window.currentUser.isAdmin) {
          saveBtn.disabled = !hasContent;
          return;
        }
        
        // 일반 사용자는 기존 로직 적용
        saveBtn.disabled = !hasContent;
      } catch (error) {
        console.error('저장 가능 여부 확인 실패:', error);
      }
    }

    // 저장 버튼 이벤트
    saveBtn.addEventListener('click', async () => {
      try {
        const content = diaryContent.value.trim();
        
        if (!selectedEmotion) {
          diaryError.textContent = '오늘의 기분을 선택해주세요.';
          return;
        }

        if (content.length < 10) {
          diaryError.textContent = '최소 10자 이상 작성해주세요.';
          return;
        }

        diaryError.textContent = '';
        saveBtn.disabled = true;
        saveBtn.textContent = '저장 중...';

        const result = await diaryManager.saveDiary(content, selectedEmotion);

        if (result.success) {
          // 캐릭터 감정 업데이트
          if (character && character.updateEmotions) {
            await character.updateEmotions(result.emotionScores);
          }
          
          // 초기화
          diaryContent.value = '';
          charCount.textContent = '0/10';
          charCount.style.color = 'var(--color-error)';
          emotionBtns.forEach(b => b.classList.remove('selected'));
          selectedEmotion = null;
          
          // 홈으로 이동
          const homeBtn = document.querySelector('[data-view="home"]');
          if (homeBtn) {
            homeBtn.click();
          }
          
          // 다음 작성 시간 업데이트
          updateNextDiaryTime(uid);
        } else {
          diaryError.textContent = result.error || '저장에 실패했습니다.';
        }

        saveBtn.disabled = false;
        saveBtn.textContent = '저장';
      } catch (error) {
        console.error('일기 저장 처리 실패:', error);
        diaryError.textContent = '저장 중 오류가 발생했습니다.';
        saveBtn.disabled = false;
        saveBtn.textContent = '저장';
      }
    });

    // 취소 버튼 이벤트
    cancelBtn.addEventListener('click', () => {
      try {
        if (diaryContent.value.trim() && !confirm('작성 중인 내용이 사라집니다. 취소하시겠습니까?')) {
          return;
        }
        
        diaryContent.value = '';
        charCount.textContent = '0/20';
        charCount.style.color = 'var(--color-error)';
        emotionBtns.forEach(b => b.classList.remove('selected'));
        selectedEmotion = null;
        diaryError.textContent = '';

        const homeBtn = document.querySelector('[data-view="home"]');
        if (homeBtn) {
          homeBtn.click();
        }
      } catch (error) {
        console.error('일기 취소 처리 실패:', error);
      }
    });

    return diaryManager;
  } catch (error) {
    console.error('일기 UI 설정 실패:', error);
    return new DiaryManager(uid);
  }
}

// 타이머 인터벌 저장 (전역)
let diaryTimerInterval = null;

/**
 * 다음 일기 작성 시간 업데이트 (실시간 타이머)
 * @param {string} uid - 사용자 ID
 */
export async function updateNextDiaryTime(uid) {
  try {
    // uid 유효성 검사
    if (!uid) {
      console.warn('updateNextDiaryTime: uid가 없습니다.');
      return;
    }
    
    const diaryManager = new DiaryManager(uid);
    const { can, nextTime } = await diaryManager.canWriteToday();
    const nextDiaryTimeEl = document.getElementById('next-diary-time');
    
    if (!nextDiaryTimeEl) {
      console.warn('updateNextDiaryTime: next-diary-time 요소를 찾을 수 없습니다.');
      return;
    }
    
    // 기존 타이머 정리
    if (diaryTimerInterval) {
      clearInterval(diaryTimerInterval);
      diaryTimerInterval = null;
    }
    
    // 디버깅 로그 제거 (너무 자주 호출됨)
    // console.log('updateNextDiaryTime 호출:', { uid, can, nextTime });
    
    if (can) {
      nextDiaryTimeEl.textContent = '일기 작성 가능 ✏️';
      nextDiaryTimeEl.style.color = 'var(--color-success)';
      // console.log('일기 작성 가능 상태로 업데이트');
    } else {
      // 실시간 타이머 시작
      const updateTimer = async () => {
        try {
          const { can: canNow, nextTime: nextTimeNow } = await diaryManager.canWriteToday();
          
          if (canNow) {
            nextDiaryTimeEl.textContent = '일기 작성 가능 ✏️';
            nextDiaryTimeEl.style.color = 'var(--color-success)';
            if (diaryTimerInterval) {
              clearInterval(diaryTimerInterval);
              diaryTimerInterval = null;
            }
            // console.log('타이머: 일기 작성 가능 상태로 변경');
          } else {
            if (nextTimeNow) {
              const timeStr = diaryManager.formatNextTime(nextTimeNow);
              nextDiaryTimeEl.textContent = `다음 일기: ${timeStr}`;
              nextDiaryTimeEl.style.color = 'var(--color-text-light)';
            } else {
              // nextTime이 없으면 일기 작성 가능으로 처리하지 않음 (에러 방지)
              console.warn('타이머: nextTime이 없습니다. 현재 상태 유지');
            }
          }
        } catch (error) {
          console.error('타이머 업데이트 실패:', error);
        }
      };
      
      // 즉시 업데이트
      await updateTimer();
      
      // 1초마다 업데이트
      diaryTimerInterval = setInterval(updateTimer, 1000);
      // console.log('일기 타이머 시작:', { nextTime });
    }
  } catch (error) {
    console.error('다음 일기 시간 업데이트 실패:', error);
    console.error('에러 스택:', error.stack);
  }
}

/**
 * 일기 타이머 정리 (페이지 이탈 시)
 */
export function clearDiaryTimer() {
  if (diaryTimerInterval) {
    clearInterval(diaryTimerInterval);
    diaryTimerInterval = null;
  }
}

// showToast 함수는 utils.js에서 import하므로 중복 정의 제거

export default DiaryManager;

