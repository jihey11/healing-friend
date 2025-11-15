/**
 * 음식 시스템 모듈
 * 음식 데이터, 인벤토리 관리, 먹이기 기능
 */

// Firebase는 데모 모드에서 사용하지 않음
// import { db } from './config.js';
// import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

/**
 * 음식 데이터 정의
 * 각 음식은 게임 보상으로 획득 가능
 */
export const FOOD_DATA = [
  // ===== 타겟 게임 보상 =====
  {
    id: 1,
    name: '기쁨 사탕',
    emoji: '🍬',
    color: '#FFFF84',
    exp: 20,
    emotion: '기쁨',
    description: '달콤한 사탕이 기분을 좋게 해요',
    source: 'target',
    rarity: 'common'
  },
  {
    id: 2,
    name: '기쁨 케이크',
    emoji: '🍰',
    color: '#FFFF84',
    exp: 35,
    emotion: '기쁨',
    description: '특별한 날을 위한 케이크예요',
    source: 'target',
    rarity: 'rare'
  },
  {
    id: 3,
    name: '분노 고추',
    emoji: '🌶️',
    color: '#DC143C',
    exp: 30,
    emotion: '분노',
    description: '매운 맛이 에너지를 줘요',
    source: 'target',
    rarity: 'common'
  },
  {
    id: 4,
    name: '놀람 팝콘',
    emoji: '🍿',
    color: '#00CED1',
    exp: 15,
    emotion: '놀람',
    description: '튀어오르는 재미가 있어요',
    source: 'target',
    rarity: 'common'
  },
  {
    id: 5,
    name: '두려움 아이스',
    emoji: '🧊',
    color: '#2F4F4F',
    exp: 25,
    emotion: '두려움',
    description: '차가운 얼음이 진정시켜줘요',
    source: 'target',
    rarity: 'common'
  },
  {
    id: 6,
    name: '기쁨 도넛',
    emoji: '🍩',
    color: '#FFFF84',
    exp: 28,
    emotion: '기쁨',
    description: '달콤한 도넛으로 행복해져요',
    source: 'target',
    rarity: 'uncommon'
  },
  
  // ===== 퍼즐 게임 보상 =====
  {
    id: 7,
    name: '슬픔 물방울',
    emoji: '💧',
    color: '#4169E1',
    exp: 20,
    emotion: '슬픔',
    description: '눈물도 때로는 필요해요',
    source: 'puzzle',
    rarity: 'common'
  },
  {
    id: 8,
    name: '슬픔 푸딩',
    emoji: '🍮',
    color: '#4169E1',
    exp: 30,
    emotion: '슬픔',
    description: '부드러운 위로가 되어줄게요',
    source: 'puzzle',
    rarity: 'uncommon'
  },
  {
    id: 9,
    name: '혐오 허브',
    emoji: '🌿',
    color: '#9370DB',
    exp: 20,
    emotion: '혐오',
    description: '자연의 향기로 정화해요',
    source: 'puzzle',
    rarity: 'common'
  },
  {
    id: 10,
    name: '두려움 구름',
    emoji: '☁️',
    color: '#2F4F4F',
    exp: 22,
    emotion: '두려움',
    description: '포근한 구름에 안겨요',
    source: 'puzzle',
    rarity: 'common'
  },
  {
    id: 11,
    name: '놀람 별사탕',
    emoji: '⭐',
    color: '#00CED1',
    exp: 25,
    emotion: '놀람',
    description: '반짝이는 놀라움이에요',
    source: 'puzzle',
    rarity: 'uncommon'
  },
  {
    id: 12,
    name: '혐오 민트',
    emoji: '🍃',
    color: '#9370DB',
    exp: 18,
    emotion: '혐오',
    description: '상쾌한 민트로 기분 전환',
    source: 'puzzle',
    rarity: 'common'
  },
  
  // ===== 추가 음식 =====
  {
    id: 13,
    name: '분노 핫소스',
    emoji: '🔥',
    color: '#DC143C',
    exp: 40,
    emotion: '분노',
    description: '불타는 열정을 일깨워요',
    source: 'target',
    rarity: 'rare'
  },
  {
    id: 14,
    name: '슬픔 초콜릿',
    emoji: '🍫',
    color: '#4169E1',
    exp: 35,
    emotion: '슬픔',
    description: '달콤 쌉싸름한 위로',
    source: 'puzzle',
    rarity: 'rare'
  },
  {
    id: 15,
    name: '놀람 폭죽',
    emoji: '🎆',
    color: '#00CED1',
    exp: 45,
    emotion: '놀람',
    description: '화려한 축하의 폭죽!',
    source: 'target',
    rarity: 'epic'
  }
];

/**
 * 음식 ID로 데이터 가져오기
 * @param {number} foodId - 음식 ID
 * @returns {Object|undefined} 음식 데이터 또는 undefined
 */
export function getFoodById(foodId) {
  try {
    return FOOD_DATA.find(food => food.id === foodId);
  } catch (error) {
    console.error('음식 조회 실패:', error);
    return undefined;
  }
}

/**
 * 음식 소스별 필터링
 * @param {string} source - 음식 소스 ('target' | 'puzzle')
 * @returns {Array} 필터링된 음식 배열
 */
export function getFoodsBySource(source) {
  try {
    return FOOD_DATA.filter(food => food.source === source);
  } catch (error) {
    console.error('음식 필터링 실패:', error);
    return [];
  }
}

/**
 * 감정별 음식 필터링
 * @param {string} emotion - 감정 이름
 * @returns {Array} 필터링된 음식 배열
 */
export function getFoodsByEmotion(emotion) {
  try {
    return FOOD_DATA.filter(food => food.emotion === emotion);
  } catch (error) {
    console.error('감정별 음식 필터링 실패:', error);
    return [];
  }
}

/**
 * 희귀도별 음식 필터링
 * @param {string} rarity - 희귀도 ('common' | 'uncommon' | 'rare' | 'epic')
 * @returns {Array} 필터링된 음식 배열
 */
export function getFoodsByRarity(rarity) {
  try {
    return FOOD_DATA.filter(food => food.rarity === rarity);
  } catch (error) {
    console.error('희귀도별 음식 필터링 실패:', error);
    return [];
  }
}

/**
 * 인벤토리 매니저 클래스
 * 음식 아이템 관리 (획득, 사용, 저장)
 */
export class FoodInventory {
  /**
   * 생성자
   * @param {string} uid - 사용자 ID
   */
  constructor(uid) {
    this.uid = uid;
    this.items = {}; // { foodId: quantity }
    console.log('FoodInventory 생성:', uid);
  }
  
  /**
   * 로컬 스토리지에서 인벤토리 로드
   * @returns {Promise<Object>} 인벤토리 아이템 객체
   */
  async load() {
    try {
      console.log('인벤토리 로드 시작:', this.uid);
      
      // 데모 모드: 로컬 스토리지 사용
      const storageKey = `inventory_${this.uid}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        this.items = JSON.parse(stored);
        console.log('인벤토리 로드 완료:', this.items);
      } else {
        // 초기 인벤토리 생성
        this.items = {};
        await this.save();
        console.log('새 인벤토리 생성');
      }
      
      return this.items;
      
    } catch (error) {
      console.error('인벤토리 로드 실패:', error);
      this.items = {};
      return this.items;
    }
  }
  
  /**
   * 로컬 스토리지에 인벤토리 저장
   * @returns {Promise<boolean>} 저장 성공 여부
   */
  async save() {
    try {
      const storageKey = `inventory_${this.uid}`;
      localStorage.setItem(storageKey, JSON.stringify(this.items));
      console.log('인벤토리 저장 완료:', this.items);
      return true;
      
    } catch (error) {
      console.error('인벤토리 저장 실패:', error);
      return false;
    }
  }
  
  /**
   * 음식 추가
   * @param {number} foodId - 음식 ID
   * @param {number} quantity - 추가할 개수 (기본값: 1)
   * @returns {Promise<boolean>} 추가 성공 여부
   */
  async addFood(foodId, quantity = 1) {
    try {
      const food = getFoodById(foodId);
      
      if (!food) {
        console.error('존재하지 않는 음식 ID:', foodId);
        return false;
      }
      
      if (quantity <= 0) {
        console.error('유효하지 않은 수량:', quantity);
        return false;
      }
      
      this.items[foodId] = (this.items[foodId] || 0) + quantity;
      await this.save();
      
      console.log(`음식 추가: ${food.name} x${quantity}`);
      return true;
      
    } catch (error) {
      console.error('음식 추가 실패:', error);
      return false;
    }
  }
  
  /**
   * 음식 사용
   * @param {number} foodId - 음식 ID
   * @returns {Promise<boolean>} 사용 성공 여부
   */
  async useFood(foodId) {
    try {
      if (!this.items[foodId] || this.items[foodId] <= 0) {
        console.error('보유하지 않은 음식:', foodId);
        return false;
      }
      
      this.items[foodId] -= 1;
      
      // 0개가 되면 삭제
      if (this.items[foodId] === 0) {
        delete this.items[foodId];
      }
      
      await this.save();
      
      const food = getFoodById(foodId);
      console.log(`음식 사용: ${food ? food.name : foodId}`);
      return true;
      
    } catch (error) {
      console.error('음식 사용 실패:', error);
      return false;
    }
  }
  
  /**
   * 음식 개수 확인
   * @param {number} foodId - 음식 ID
   * @returns {number} 보유 개수
   */
  getQuantity(foodId) {
    try {
      return this.items[foodId] || 0;
    } catch (error) {
      console.error('음식 개수 확인 실패:', error);
      return 0;
    }
  }
  
  /**
   * 음식 제거 (관리자 기능)
   * @param {number} foodId - 음식 ID
   * @param {number} quantity - 제거할 개수
   * @returns {Promise<boolean>} 제거 성공 여부
   */
  async removeFood(foodId, quantity = 1) {
    try {
      if (!this.items[foodId]) {
        return false;
      }
      
      this.items[foodId] = Math.max(0, this.items[foodId] - quantity);
      
      if (this.items[foodId] === 0) {
        delete this.items[foodId];
      }
      
      await this.save();
      return true;
      
    } catch (error) {
      console.error('음식 제거 실패:', error);
      return false;
    }
  }
  
  /**
   * 전체 음식 목록 (데이터 포함)
   * @returns {Array} 음식 목록 배열
   */
  getAllFoods() {
    try {
      const foods = [];
      
      for (const [foodId, quantity] of Object.entries(this.items)) {
        const foodData = getFoodById(parseInt(foodId));
        if (foodData && quantity > 0) {
          foods.push({
            ...foodData,
            quantity
          });
        }
      }
      
      // 감정별, 희귀도별, ID순으로 정렬
      return foods.sort((a, b) => {
        // 1. 감정 순
        if (a.emotion !== b.emotion) {
          return a.emotion.localeCompare(b.emotion, 'ko');
        }
        // 2. 희귀도 순 (epic > rare > uncommon > common)
        const rarityOrder = { epic: 0, rare: 1, uncommon: 2, common: 3 };
        const rarityDiff = rarityOrder[a.rarity] - rarityOrder[b.rarity];
        if (rarityDiff !== 0) {
          return rarityDiff;
        }
        // 3. ID 순
        return a.id - b.id;
      });
      
    } catch (error) {
      console.error('음식 목록 조회 실패:', error);
      return [];
    }
  }
  
  /**
   * 감정별로 그룹화된 음식 목록
   * @returns {Object} 감정별 음식 객체
   */
  getFoodsByEmotionGroup() {
    try {
      const allFoods = this.getAllFoods();
      const grouped = {};
      
      allFoods.forEach(food => {
        if (!grouped[food.emotion]) {
          grouped[food.emotion] = [];
        }
        grouped[food.emotion].push(food);
      });
      
      return grouped;
      
    } catch (error) {
      console.error('감정별 그룹화 실패:', error);
      return {};
    }
  }
  
  /**
   * 총 음식 개수
   * @returns {number} 전체 음식 개수
   */
  getTotalCount() {
    try {
      return Object.values(this.items).reduce((sum, qty) => sum + qty, 0);
    } catch (error) {
      console.error('총 개수 계산 실패:', error);
      return 0;
    }
  }
  
  /**
   * 총 음식 종류 수
   * @returns {number} 보유 중인 음식 종류 수
   */
  getTotalTypes() {
    try {
      return Object.keys(this.items).length;
    } catch (error) {
      console.error('종류 수 계산 실패:', error);
      return 0;
    }
  }
  
  /**
   * 비어있는지 확인
   * @returns {boolean} 인벤토리가 비어있는지 여부
   */
  isEmpty() {
    try {
      return this.getTotalCount() === 0;
    } catch (error) {
      console.error('비어있음 확인 실패:', error);
      return true;
    }
  }
  
  /**
   * 인벤토리 초기화 (모든 아이템 삭제)
   * @returns {Promise<boolean>} 초기화 성공 여부
   */
  async clear() {
    try {
      this.items = {};
      await this.save();
      console.log('인벤토리 초기화 완료');
      return true;
      
    } catch (error) {
      console.error('인벤토리 초기화 실패:', error);
      return false;
    }
  }
}

/**
 * 캐릭터에게 음식 먹이기
 * @param {Object} character - 캐릭터 인스턴스
 * @param {number} foodId - 음식 ID
 * @param {FoodInventory} inventory - 인벤토리 인스턴스
 * @returns {Promise<Object>} 먹이기 결과
 */
export async function feedCharacter(character, foodId, inventory) {
  try {
    console.log('음식 먹이기 시작:', foodId);
    
    const food = getFoodById(foodId);
    
    if (!food) {
      throw new Error('존재하지 않는 음식입니다.');
    }
    
    // 인벤토리 확인
    if (inventory.getQuantity(foodId) <= 0) {
      throw new Error('음식이 부족합니다.');
    }
    
    // 현재 레벨 및 경험치 저장
    const prevLevel = character.level;
    const prevExp = character.exp;
    
    // 음식 등급 정보 가져오기 (가장 오래된 것부터 사용)
    let emotionPoints = 1; // 기본값
    let grade = 'D';
    
    if (uid) {
      const foodGrades = JSON.parse(localStorage.getItem(`foodGrades_${uid}`) || '{}');
      if (foodGrades[foodId] && foodGrades[foodId].length > 0) {
        // 가장 오래된 음식 사용 (FIFO)
        const foodGrade = foodGrades[foodId].shift();
        emotionPoints = foodGrade.emotionPoints || 1;
        grade = foodGrade.grade || 'D';
        localStorage.setItem(`foodGrades_${uid}`, JSON.stringify(foodGrades));
      }
    }
    
    // 인벤토리에서 음식 사용
    const success = await inventory.useFood(foodId);
    
    if (!success) {
      throw new Error('음식 사용에 실패했습니다.');
    }
    
    // 캐릭터에게 경험치 추가
    await character.addExp(food.exp);
    
    // 캐릭터에게 감정 점수 추가 (등급에 따라)
    if (character && character.updateEmotions) {
      const emotionScores = {};
      emotionScores[food.emotion] = emotionPoints;
      await character.updateEmotions(emotionScores);
      console.log(`${food.emotion} 감정 점수 +${emotionPoints} (${grade}급)`);
    }
    
    // 먹이기 애니메이션
    await showFeedingAnimation(character, food);
    
    // 캐릭터 반응
    showCharacterReaction(character, food);
    
    // 레벨업 체크
    const leveledUp = character.level > prevLevel;
    
    const result = {
      foodName: food.name,
      foodEmoji: food.emoji,
      expGained: food.exp,
      emotionPoints: emotionPoints,
      grade: grade,
      prevExp: prevExp,
      newExp: character.exp,
      prevLevel: prevLevel,
      newLevel: character.level,
      leveledUp: leveledUp
    };
    
    console.log('음식 먹이기 완료:', result);
    return result;
    
  } catch (error) {
    console.error('음식 먹이기 실패:', error);
    throw error;
  }
}

/**
 * 먹이기 애니메이션
 * @param {Object} character - 캐릭터 인스턴스
 * @param {Object} food - 음식 데이터
 * @returns {Promise<void>}
 */
function showFeedingAnimation(character, food) {
  return new Promise((resolve) => {
    try {
      // 음식 이모지 파티클
      const canvas = character.canvas;
      const ctx = character.ctx;
      
      if (!canvas || !ctx) {
        console.warn('캔버스를 찾을 수 없습니다.');
        resolve();
        return;
      }
      
      // 음식 이모지를 캐릭터 위치로 이동
      const startX = canvas.width / 2;
      const startY = 50;
      const endX = canvas.width / 2;
      const endY = canvas.height / 2;
      
      let progress = 0;
      const duration = 30; // 프레임
      
      function animate() {
        if (progress >= duration) {
          // 도착 후 파티클 효과
          if (character.emitParticles) {
            character.emitParticles(20);
          }
          resolve();
          return;
        }
        
        progress++;
        const t = progress / duration;
        const easeT = 1 - Math.pow(1 - t, 3); // ease-out cubic
        
        const x = startX + (endX - startX) * easeT;
        const y = startY + (endY - startY) * easeT;
        
        // 캐릭터 다시 그리기
        character.render();
        
        // 음식 이모지 그리기
        ctx.save();
        ctx.font = '48px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(food.emoji, x, y);
        ctx.restore();
        
        requestAnimationFrame(animate);
      }
      
      animate();
      
    } catch (error) {
      console.error('먹이기 애니메이션 실패:', error);
      resolve();
    }
  });
}

/**
 * 캐릭터 반응 표시
 * @param {Object} character - 캐릭터 인스턴스
 * @param {Object} food - 음식 데이터
 */
function showCharacterReaction(character, food) {
  try {
    const reactions = [
      '맛있어! 😋',
      '고마워! 💖',
      '더 먹고 싶어! 🤤',
      '최고야! ✨',
      '행복해! 😊',
      '냠냠! 😍',
      '기운이 나! 💪',
      '사랑해! ❤️'
    ];
    
    const reaction = reactions[Math.floor(Math.random() * reactions.length)];
    
    const bubble = document.getElementById('speech-bubble');
    const text = document.getElementById('speech-text');
    
    if (bubble && text) {
      text.textContent = reaction;
      bubble.classList.remove('hidden');
      
      setTimeout(() => {
        bubble.classList.add('hidden');
      }, 2000);
    }
    
  } catch (error) {
    console.error('캐릭터 반응 표시 실패:', error);
  }
}

/**
 * 게임 보상으로 음식 획득
 * @param {string} gameType - 게임 타입 ('target' | 'puzzle')
 * @param {FoodInventory} inventory - 인벤토리 인스턴스
 * @returns {Promise<Object>} 획득한 음식 데이터
 */
export async function getRandomFoodReward(gameType, inventory) {
  try {
    // 해당 게임의 음식 목록
    const foods = getFoodsBySource(gameType);
    
    if (foods.length === 0) {
      throw new Error('보상 음식이 없습니다.');
    }
    
    // 희귀도 기반 가중치
    const rarityWeights = {
      common: 60,    // 60%
      uncommon: 25,  // 25%
      rare: 12,      // 12%
      epic: 3        // 3%
    };
    
    // 가중치 기반 랜덤 선택
    const totalWeight = foods.reduce((sum, food) => sum + rarityWeights[food.rarity], 0);
    let random = Math.random() * totalWeight;
    
    let selectedFood = foods[0];
    
    for (const food of foods) {
      random -= rarityWeights[food.rarity];
      if (random <= 0) {
        selectedFood = food;
        break;
      }
    }
    
    // 인벤토리에 추가
    await inventory.addFood(selectedFood.id, 1);
    
    console.log(`보상 획득: ${selectedFood.name} (${selectedFood.rarity})`);
    
    return selectedFood;
    
  } catch (error) {
    console.error('음식 보상 획득 실패:', error);
    throw error;
  }
}

/**
 * 희귀도 표시 이름
 * @param {string} rarity - 희귀도
 * @returns {string} 한글 희귀도 이름
 */
export function getRarityDisplayName(rarity) {
  const names = {
    common: '일반',
    uncommon: '고급',
    rare: '희귀',
    epic: '전설'
  };
  return names[rarity] || '알 수 없음';
}

/**
 * 희귀도 색상
 * @param {string} rarity - 희귀도
 * @returns {string} CSS 색상 코드
 */
export function getRarityColor(rarity) {
  const colors = {
    common: '#999999',
    uncommon: '#1eff00',
    rare: '#0070dd',
    epic: '#a335ee'
  };
  return colors[rarity] || '#999999';
}

// 기본 export
export default FoodInventory;

