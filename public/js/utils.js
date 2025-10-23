// Firebase 의존성 제거 (데모 모드 지원)
// import { db } from './config.js';

// Firebase 함수들을 동적으로 가져오는 헬퍼 함수
function getFirebaseFirestore() {
  if (window.firebaseModules) {
    return window.firebaseModules;
  }
  return null;
}

// ===== 날짜 관련 =====

/**
 * 두 날짜 사이의 일수 차이를 계산합니다.
 * @param {Date|Object} lastDate - 마지막 날짜 (Date 객체 또는 Firestore Timestamp)
 * @returns {number} 경과 일수
 */
export function calculateDaysPassed(lastDate) {
  try {
    const now = new Date();
    const last = lastDate instanceof Date ? lastDate : lastDate.toDate();
    const diffTime = Math.abs(now - last);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  } catch (error) {
    console.error('날짜 계산 오류:', error);
    return 0;
  }
}

/**
 * 밀리초를 시간과 분으로 변환하여 표시합니다.
 * @param {number} milliseconds - 밀리초
 * @returns {string} "X시간 Y분 후" 또는 "Y분 후" 형식의 문자열
 */
export function formatTimeRemaining(milliseconds) {
  try {
    if (milliseconds <= 0) return '지금 가능';
    
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분 후`;
    } else {
      return `${minutes}분 후`;
    }
  } catch (error) {
    console.error('시간 포맷 오류:', error);
    return '알 수 없음';
  }
}

/**
 * 두 날짜가 같은 날인지 확인합니다.
 * @param {Date|Object} date1 - 첫 번째 날짜
 * @param {Date|Object} date2 - 두 번째 날짜
 * @returns {boolean} 같은 날이면 true
 */
export function isSameDay(date1, date2) {
  try {
    const d1 = date1 instanceof Date ? date1 : date1.toDate();
    const d2 = date2 instanceof Date ? date2 : date2.toDate();
    
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  } catch (error) {
    console.error('날짜 비교 오류:', error);
    return false;
  }
}

// ===== 방치 시스템 =====

/**
 * 사용자의 방치 상태를 확인하고 페널티를 적용합니다.
 * @param {string} uid - 사용자 ID
 * @param {Object} character - 캐릭터 객체
 * @returns {Object|null} 페널티 결과 또는 null
 */
export async function checkAndApplyIdlePenalty(uid, character) {
  try {
    const firebaseFirestore = getFirebaseFirestore();
    if (!firebaseFirestore || !db) {
      console.warn('Firebase가 초기화되지 않았습니다. 데모 모드에서는 방치 페널티를 적용하지 않습니다.');
      return null;
    }

    const { doc, getDoc, updateDoc, serverTimestamp } = firebaseFirestore;
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      console.warn('사용자 데이터를 찾을 수 없습니다.');
      return null;
    }

    const userData = userSnap.data();
    const lastLogin = userData.lastLogin?.toDate() || new Date();
    const now = new Date();

    // 같은 날이면 페널티 없음
    if (isSameDay(lastLogin, now)) {
      return null;
    }

    const daysPassed = calculateDaysPassed(lastLogin);

    if (daysPassed === 0) {
      return null;
    }

    // 감정 점수 감소 계산
    const emotionDecay = calculateEmotionDecay(daysPassed, character.emotions);

    // 감정 점수 적용
    const newEmotions = { ...character.emotions };
    for (const [emotion, decay] of Object.entries(emotionDecay.changes)) {
      newEmotions[emotion] = Math.max(0, newEmotions[emotion] - decay);
    }

    // 모든 감정이 0인지 확인
    const allZero = Object.values(newEmotions).every(v => v === 0);

    // 경험치 감소 (모든 감정 0일 때만)
    let expDecay = 0;
    if (allZero) {
      const daysAfterZero = daysPassed - emotionDecay.daysToZero;
      expDecay = daysAfterZero > 0 ? daysAfterZero * 5 : 0;
    }

    // Firestore 업데이트
    await updateDoc(doc(db, 'emotions', uid), newEmotions);

    if (expDecay > 0) {
      const newExp = Math.max(0, character.exp - expDecay);
      await updateDoc(doc(db, 'character', uid), {
        exp: newExp
      });
      character.exp = newExp;
    }

    // lastLogin 업데이트
    await updateDoc(userRef, {
      lastLogin: serverTimestamp()
    });

    // 캐릭터 감정 업데이트
    character.emotions = newEmotions;
    if (character.render) character.render();
    if (character.updateExpBar) character.updateExpBar();

    return {
      daysPassed,
      emotionChanges: emotionDecay.changes,
      expDecay,
      message: getIdleMessage(daysPassed)
    };
  } catch (error) {
    console.error('방치 페널티 적용 실패:', error);
    return null;
  }
}

/**
 * 방치 기간에 따른 감정 감소량을 계산합니다.
 * @param {number} daysPassed - 경과 일수
 * @param {Object} currentEmotions - 현재 감정 점수
 * @returns {Object} 감정 변화 정보
 */
function calculateEmotionDecay(daysPassed, currentEmotions) {
  try {
    const changes = {};
    let daysProcessed = 0;
    let daysToZero = 0;

    // 각 날짜마다 랜덤 감정 감소
    for (let day = 1; day <= daysPassed; day++) {
      // 감소량 계산
      let decayAmount;
      if (day <= 7) {
        decayAmount = 1;
      } else if (day <= 14) {
        decayAmount = 2;
      } else {
        decayAmount = 3;
      }

      // 랜덤 감정 선택
      const emotions = Object.keys(currentEmotions);
      const randomEmotion = emotions[Math.floor(Math.random() * emotions.length)];

      // 누적
      changes[randomEmotion] = (changes[randomEmotion] || 0) + decayAmount;

      // 0인지 체크
      const tempEmotions = { ...currentEmotions };
      for (const [emotion, decay] of Object.entries(changes)) {
        tempEmotions[emotion] = Math.max(0, tempEmotions[emotion] - decay);
      }

      if (Object.values(tempEmotions).every(v => v === 0) && daysToZero === 0) {
        daysToZero = day;
      }

      daysProcessed = day;
    }

    return { changes, daysToZero, daysProcessed };
  } catch (error) {
    console.error('감정 감소 계산 오류:', error);
    return { changes: {}, daysToZero: 0, daysProcessed: 0 };
  }
}

/**
 * 방치 기간에 따른 메시지를 반환합니다.
 * @param {number} days - 방치 일수
 * @returns {string} 메시지
 */
function getIdleMessage(days) {
  try {
    if (days <= 3) {
      return '조금 기다렸어! 보고 싶었어. 😊';
    } else if (days <= 7) {
      return '많이 기다렸어... 괜찮아? 😢';
    } else {
      return '너무 오래 기다렸어... 걱정했어. 😭';
    }
  } catch (error) {
    console.error('방치 메시지 생성 오류:', error);
    return '오랜만이야! 😊';
  }
}

/**
 * 방치 페널티 모달을 표시합니다.
 * @param {Object} penaltyResult - 페널티 결과
 */
export function showIdlePenaltyModal(penaltyResult) {
  try {
    if (!penaltyResult) return;

    const modal = document.createElement('div');
    modal.className = 'idle-penalty-modal';
    modal.innerHTML = `
      <div class="idle-penalty-content">
        <h2>오랜만이야! ${getEmotionEmoji(penaltyResult.daysPassed)}</h2>
        <p class="idle-days">${penaltyResult.daysPassed}일 동안 접속하지 않았어요</p>
        ${Object.keys(penaltyResult.emotionChanges).length > 0 ? `
          <div class="emotion-changes">
            <h3>감정 점수 변화</h3>
            ${Object.entries(penaltyResult.emotionChanges).map(([emotion, change]) => `
              <div class="emotion-change-item">
                <span>${emotion}</span>
                <span class="change-value">-${change}점</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        ${penaltyResult.expDecay > 0 ? `
          <p class="exp-decay">경험치 -${penaltyResult.expDecay}</p>
        ` : ''}
        
        <p class="idle-message">${penaltyResult.message}</p>
        
        <button class="btn-primary" onclick="this.closest('.idle-penalty-modal').remove()">
          확인
        </button>
      </div>
    `;

    // 스타일 추가
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      animation: fadeIn 0.3s;
    `;

    document.body.appendChild(modal);
  } catch (error) {
    console.error('방치 페널티 모달 표시 오류:', error);
  }
}

/**
 * 방치 일수에 따른 이모지를 반환합니다.
 * @param {number} days - 방치 일수
 * @returns {string} 이모지
 */
function getEmotionEmoji(days) {
  try {
    if (days <= 3) return '😊';
    if (days <= 7) return '😢';
    return '😭';
  } catch (error) {
    console.error('이모지 생성 오류:', error);
    return '😊';
  }
}

// ===== 알림 시스템 =====

/**
 * 브라우저 알림 권한을 요청합니다.
 * @returns {boolean} 권한이 허용되었는지 여부
 */
export function requestNotificationPermission() {
  try {
    if (!('Notification' in window)) {
      console.log('이 브라우저는 알림을 지원하지 않습니다.');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        return permission === 'granted';
      });
    }

    return false;
  } catch (error) {
    console.error('알림 권한 요청 오류:', error);
    return false;
  }
}

/**
 * 브라우저 알림을 표시합니다.
 * @param {string} title - 알림 제목
 * @param {string} body - 알림 내용
 * @param {string} icon - 아이콘 (이모지)
 */
export function showBrowserNotification(title, body, icon = '🌟') {
  try {
    if (!('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">${icon}</text></svg>`,
        badge: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="75" font-size="75">🌟</text></svg>`
      });
    }
  } catch (error) {
    console.error('브라우저 알림 표시 오류:', error);
  }
}

// ===== 오늘의 팁 =====

const DAILY_TIPS = [
  '깊게 숨을 쉬어보세요. 3초 들이마시고, 5초 내쉬세요.',
  '스트레칭을 해보세요. 몸이 가벼워질 거예요.',
  '물 한 잔 마시는 것도 좋은 휴식이에요.',
  '창밖을 보며 5분만 멍때려보세요.',
  '좋아하는 음악을 들어보세요.',
  '완벽하지 않아도 괜찮아요. 최선을 다한 것만으로도 충분해요.',
  '오늘 하루도 고생했어요. 스스로를 칭찬해주세요.',
  '힘들 때는 쉬어가도 돼요. 충분히 쉬고 다시 시작해요.',
  '작은 것에 감사해보세요. 오늘 좋았던 일 3가지를 떠올려보세요.',
  '밖에 나가 햇볕을 쬐어보세요. 비타민 D가 기분을 좋게 해요.',
  '운동을 해보세요. 가벼운 산책만으로도 충분해요.',
  '친구나 가족에게 연락해보세요. 대화는 큰 힘이 돼요.',
  '좋아하는 것을 해보세요. 취미 생활은 스트레스 해소에 좋아요.',
  '충분히 자는 것도 중요해요. 오늘은 일찍 자보세요.',
  '웃어보세요. 억지로라도 웃으면 기분이 나아져요.',
  '자신에게 관대해지세요. 누구나 실수할 수 있어요.',
  '지금 이 순간에 집중해보세요. 과거와 미래는 잠시 내려놓아요.',
  '감사 일기를 써보세요. 오늘 감사한 일 3가지만 적어보세요.',
  '긍정적인 말을 해보세요. "나는 할 수 있어"라고 말해보세요.',
  '명상을 해보세요. 5분만 조용히 앉아있어도 도움이 돼요.',
  '디지털 디톡스를 해보세요. 30분만 휴대폰을 내려놓아요.',
  '좋은 추억을 떠올려보세요. 행복했던 순간을 생각해보세요.',
  '자신을 위한 시간을 가지세요. 나만의 시간은 꼭 필요해요.',
  '목표를 작게 나누어보세요. 작은 성취들이 모여 큰 성과가 돼요.',
  '부정적인 생각을 긍정적으로 바꿔보세요. "못해"보다는 "노력중"이라고요.',
  '도움을 요청하는 것도 용기예요. 혼자 해결하려 하지 마세요.',
  '실패는 배움의 기회예요. 다시 시도할 수 있어요.',
  '자신의 감정을 인정하세요. 슬프면 슬프다고 말해도 돼요.',
  '건강한 식사를 하세요. 몸이 건강해야 마음도 건강해져요.',
  '미소 지어보세요. 거울 앞에서 자신에게 웃어주세요.'
];

/**
 * 오늘의 팁을 반환합니다.
 * @returns {string} 오늘의 팁 메시지
 */
export function getDailyTip() {
  try {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % DAILY_TIPS.length;
    return DAILY_TIPS[index];
  } catch (error) {
    console.error('오늘의 팁 생성 오류:', error);
    return '오늘도 화이팅! 💪';
  }
}

/**
 * 오늘의 팁을 UI에 업데이트합니다.
 */
export function updateDailyTip() {
  try {
    const tipElement = document.getElementById('daily-tip');
    if (tipElement) {
      tipElement.textContent = getDailyTip();
    }
  } catch (error) {
    console.error('오늘의 팁 업데이트 오류:', error);
  }
}

// ===== 토스트 메시지 =====

/**
 * 토스트 메시지를 표시합니다.
 * @param {string} message - 메시지 내용
 * @param {number} duration - 표시 시간 (밀리초)
 * @param {string} type - 메시지 타입 ('info', 'success', 'error', 'warning')
 */
export function showToast(message, duration = 3000, type = 'info') {
  try {
    const toast = document.getElementById('toast');
    if (!toast) {
      console.warn('토스트 요소를 찾을 수 없습니다.');
      return;
    }

    // 타입별 색상
    const colors = {
      info: 'rgba(0, 0, 0, 0.85)',
      success: 'rgba(76, 175, 80, 0.9)',
      error: 'rgba(244, 67, 54, 0.9)',
      warning: 'rgba(255, 152, 0, 0.9)'
    };

    toast.style.background = colors[type] || colors.info;
    toast.textContent = message;
    toast.classList.remove('hidden');

    // 자동으로 숨기기
    setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  } catch (error) {
    console.error('토스트 메시지 표시 오류:', error);
  }
}

// ===== 로딩 오버레이 =====

/**
 * 로딩 오버레이를 표시합니다.
 * @param {string} message - 로딩 메시지
 */
export function showLoading(message = '로딩 중...') {
  try {
    let loadingOverlay = document.getElementById('loading-overlay');

    if (!loadingOverlay) {
      loadingOverlay = document.createElement('div');
      loadingOverlay.id = 'loading-overlay';
      loadingOverlay.innerHTML = `
        <div class="loading-content">
          <div class="spinner"></div>
          <p class="loading-message">${message}</p>
        </div>
      `;
      loadingOverlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(255, 255, 255, 0.95);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 3000;
      `;
      document.body.appendChild(loadingOverlay);
    } else {
      loadingOverlay.querySelector('.loading-message').textContent = message;
      loadingOverlay.style.display = 'flex';
    }
  } catch (error) {
    console.error('로딩 오버레이 표시 오류:', error);
  }
}

/**
 * 로딩 오버레이를 숨깁니다.
 */
export function hideLoading() {
  try {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.style.display = 'none';
    }
  } catch (error) {
    console.error('로딩 오버레이 숨김 오류:', error);
  }
}

// ===== 확인 다이얼로그 =====

/**
 * 확인 다이얼로그를 표시합니다.
 * @param {string} message - 확인 메시지
 * @param {Function} onConfirm - 확인 버튼 클릭 시 실행할 함수
 * @param {Function} onCancel - 취소 버튼 클릭 시 실행할 함수
 */
export function confirmDialog(message, onConfirm, onCancel = null) {
  try {
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
      <div class="confirm-content">
        <p class="confirm-message">${message}</p>
        <div class="confirm-actions">
          <button class="btn-secondary cancel-btn">취소</button>
          <button class="btn-primary confirm-btn">확인</button>
        </div>
      </div>
    `;

    dialog.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2500;
    `;

    document.body.appendChild(dialog);

    dialog.querySelector('.confirm-btn').addEventListener('click', () => {
      if (onConfirm) onConfirm();
      dialog.remove();
    });

    dialog.querySelector('.cancel-btn').addEventListener('click', () => {
      if (onCancel) onCancel();
      dialog.remove();
    });

    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        if (onCancel) onCancel();
        dialog.remove();
      }
    });
  } catch (error) {
    console.error('확인 다이얼로그 표시 오류:', error);
  }
}

// ===== 사용자 데이터 로드 =====

/**
 * 사용자 데이터를 로드합니다.
 * @param {string} uid - 사용자 ID
 * @returns {Object|null} 사용자 데이터 또는 null
 */
export async function loadUserData(uid) {
  try {
    showLoading('사용자 데이터 로딩 중...');

    const firebaseFirestore = getFirebaseFirestore();
    if (!firebaseFirestore || !db) {
      console.warn('Firebase가 초기화되지 않았습니다. 데모 모드로 실행합니다.');
      hideLoading();
      return null;
    }

    const { doc, getDoc } = firebaseFirestore;

    // 사용자 정보
    const userSnap = await getDoc(doc(db, 'users', uid));
    const user = userSnap.data();

    // 감정 데이터
    const emotionsSnap = await getDoc(doc(db, 'emotions', uid));
    const emotions = emotionsSnap.data();

    // 캐릭터 데이터
    const characterSnap = await getDoc(doc(db, 'character', uid));
    const character = characterSnap.data();

    // 게임 진행도
    const progressSnap = await getDoc(doc(db, 'gameProgress', uid));
    const progress = progressSnap.exists() ? progressSnap.data() : {
      targetGamePlays: 0,
      puzzleGamePlays: 0,
      lastReset: new Date()
    };

    hideLoading();

    return {
      user,
      emotions,
      character,
      progress
    };
  } catch (error) {
    console.error('사용자 데이터 로드 실패:', error);
    hideLoading();
    showToast('데이터 로드에 실패했습니다.', 3000, 'error');
    return null;
  }
}

// ===== 통계 계산 =====

/**
 * 사용자 통계를 계산합니다.
 * @param {string} uid - 사용자 ID
 * @returns {Object} 통계 데이터
 */
export async function calculateStats(uid) {
  try {
    const firebaseFirestore = getFirebaseFirestore();
    if (!firebaseFirestore || !db) {
      console.warn('Firebase가 초기화되지 않았습니다.');
      return {
        totalDiaries: 0,
        daysCount: 0
      };
    }

    const { doc, getDoc, collection, getDocs } = firebaseFirestore;

    // 총 일기 개수
    const diariesSnap = await getDocs(collection(db, 'diaries', uid, 'entries'));
    const totalDiaries = diariesSnap.size;

    // 가입 일수
    const userSnap = await getDoc(doc(db, 'users', uid));
    const createdAt = userSnap.data().createdAt?.toDate() || new Date();
    const daysCount = calculateDaysPassed(createdAt);

    return {
      totalDiaries,
      daysCount
    };
  } catch (error) {
    console.error('통계 계산 실패:', error);
    return {
      totalDiaries: 0,
      daysCount: 0
    };
  }
}

// ===== 에러 핸들링 =====

/**
 * 에러를 처리하고 사용자에게 알림을 표시합니다.
 * @param {Error} error - 에러 객체
 * @param {string} userMessage - 사용자에게 표시할 메시지
 */
export function handleError(error, userMessage = '오류가 발생했습니다.') {
  try {
    console.error('Error:', error);

    // Firebase 에러 코드별 메시지
    const errorMessages = {
      'permission-denied': '권한이 없습니다.',
      'not-found': '데이터를 찾을 수 없습니다.',
      'already-exists': '이미 존재합니다.',
      'failed-precondition': '작업을 수행할 수 없습니다.',
      'unavailable': '서버에 연결할 수 없습니다.',
      'unauthenticated': '로그인이 필요합니다.',
    };

    const code = error.code || '';
    const message = errorMessages[code] || userMessage;

    showToast(message, 3000, 'error');
  } catch (err) {
    console.error('에러 처리 중 오류:', err);
    showToast('알 수 없는 오류가 발생했습니다.', 3000, 'error');
  }
}

// ===== 디바운스 =====

/**
 * 디바운스 함수를 생성합니다.
 * @param {Function} func - 실행할 함수
 * @param {number} wait - 대기 시간 (밀리초)
 * @returns {Function} 디바운스된 함수
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== 스로틀 =====

/**
 * 스로틀 함수를 생성합니다.
 * @param {Function} func - 실행할 함수
 * @param {number} limit - 제한 시간 (밀리초)
 * @returns {Function} 스로틀된 함수
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// showToast 함수를 전역으로 노출 (다른 모듈에서 사용하기 위해)
window.showToast = showToast;
