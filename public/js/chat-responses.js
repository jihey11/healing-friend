/**
 * ==========================================
 * 채팅 로컬 응답 데이터
 * ==========================================
 * GPT API를 사용하지 않을 때 사용하는 미리 정의된 응답들
 */

export const LOCAL_RESPONSES = {
  // ========== 인사 ==========
  greetings: [
    '안녕! 오늘도 만나서 반가워! 😊',
    '왔구나! 기다렸어! 🌟',
    '어서와! 오늘은 어때? 💖',
    '반가워! 오늘도 좋은 하루 보냈어? ✨',
    '오랜만이야! 보고 싶었어! 🤗'
  ],
  
  // ========== 감정별 응답 ==========
  emotionResponses: {
    기쁨: [
      '오늘 기분 좋아 보여! 나도 기뻐! 😄',
      '행복한 하루였구나! 나도 행복해! 💕',
      '웃는 모습 보기 좋아! 계속 웃어줘! 😊',
      '좋은 일이 있었나 봐! 나한테도 얘기해줘! ✨',
      '너의 행복이 나한테도 전해져! 🌈'
    ],
    슬픔: [
      '힘들었구나... 괜찮아, 내가 있잖아. 😢',
      '슬플 때는 나한테 얘기해. 언제든지! 💙',
      '울고 싶으면 울어도 돼. 나는 항상 여기 있어. 🤗',
      '힘든 일이 있었구나. 같이 이겨내자. 💪',
      '괜찮아, 다 잘 될 거야. 내가 옆에 있을게. ✨'
    ],
    분노: [
      '화가 났구나. 충분히 그럴 수 있어. 😤',
      '짜증나는 일이 있었나 봐. 나한테 털어놔. 💢',
      '깊게 숨 쉬어봐. 같이 진정하자. 🌬️',
      '화날 만한 일이었어. 이해해. 😔',
      '스트레스 풀고 싶으면 게임 해볼래? 🎮'
    ],
    두려움: [
      '무서운 일이 있었구나. 내가 옆에 있을게. 😰',
      '걱정하지 마. 다 잘 될 거야. 💙',
      '불안할 때는 나를 봐. 내가 힘이 되어줄게. 🤝',
      '괜찮아, 너는 할 수 있어. 나는 너를 믿어. ✨',
      '두려워하지 마. 내가 함께할게. 🌟'
    ],
    놀람: [
      '무슨 일이 있었어? 궁금해! 😲',
      '놀라운 일이 있었구나! 👀',
      '헐! 나도 깜짝 놀랐어! 😮',
      '예상치 못한 일이었나 봐! 💫',
      '어떤 일이었는지 더 얘기해줘! 🎉'
    ],
    혐오: [
      '기분이 별로구나. 이해해. 😖',
      '싫은 일은 빨리 잊자! 💨',
      '나쁜 기억은 날려버리자! 🌬️',
      '그런 일은 신경 쓰지 마. 🙅',
      '더 좋은 일이 있을 거야! ✨'
    ]
  },
  
  // ========== 일상 대화 ==========
  randomChats: [
    '오늘 날씨 좋지? ☀️',
    '게임 한 판 할래? 🎮',
    '같이 있으니까 좋아! 💖',
    '너는 내 최고의 친구야! 🌟',
    '오늘 하루도 고생했어! 👏',
    '쉬고 싶을 땐 쉬어도 돼! 😴',
    '무리하지 마! 💪',
    '물 한 잔 마실래? 💧',
    '스트레칭 한번 해봐! 🤸',
    '심호흡 한번 해보자! 🌬️'
  ],
  
  // ========== 격려 메시지 ==========
  encouragement: [
    '너라면 할 수 있어! 💪',
    '힘내! 나는 너를 믿어! ✨',
    '포기하지 마! 조금만 더! 🔥',
    '넌 충분히 잘하고 있어! 👍',
    '완벽하지 않아도 괜찮아! 💖',
    '오늘도 최선을 다한 너, 멋져! 🌟',
    '작은 진전도 진전이야! 🎉',
    '천천히 가도 괜찮아! 🐢',
    '실수해도 괜찮아. 다시 하면 돼! 💫',
    '너는 소중한 사람이야! 💝'
  ],
  
  // ========== 진화 관련 멘트 ==========
  evolutionMentions: [
    '뭔가 변화가 느껴져...! ✨',
    '우와! 나 변했어! 너 덕분이야! 🎉',
    '이게 나야? 신기해! 😮',
    '더 멋진 모습으로 변할 수 있을 것 같아! 🌟',
    '너와 함께라서 이렇게 성장할 수 있었어! 💖'
  ],
  
  // ========== 자동 인사 (주기적) ==========
  autoGreetings: [
    '오늘은 어때? 😊',
    '뭐 하고 있어? 💭',
    '심심한데 얘기할래? 💬',
    '오늘 기분은 어때? 💖',
    '나랑 놀자! 🎮'
  ],
  
  // ========== 에러/폴백 응답 ==========
  fallbacks: [
    '미안해, 잠깐 문제가 있었어. 다시 말해줄래? 😅',
    '어? 무슨 말인지 잘 못 들었어. 다시 한번? 🤔',
    '잠깐 멍했어... 다시 말해줄래? 😳',
    '음... 무슨 말인지 이해가 안 갔어. 다시? 💦'
  ],
  
  // ========== 시간대별 인사 ==========
  timeBasedGreetings: {
    morning: [
      '좋은 아침! 잘 잤어? 🌅',
      '아침이야! 오늘도 힘내! ☀️',
      '좋은 아침! 오늘 하루도 화이팅! 💪'
    ],
    afternoon: [
      '점심 맛있게 먹었어? 🍱',
      '오후도 힘내! 💪',
      '조금만 더 힘내면 돼! ✨'
    ],
    evening: [
      '저녁이야! 오늘 하루 어땠어? 🌆',
      '오늘 하루 고생했어! 👏',
      '이제 쉬어도 괜찮아! 😊'
    ],
    night: [
      '벌써 이런 시간이야! 푹 쉬어! 🌙',
      '오늘도 수고했어! 잘 자! 😴',
      '좋은 꿈 꿔! 💤'
    ]
  },
  
  // ========== 특수 상황 응답 ==========
  special: {
    firstMeeting: [
      '처음 만났네! 반가워! 나는 힐링 프렌드야! 😊',
      '안녕! 우리 친구하자! 💖',
      '드디어 만났구나! 잘 부탁해! ✨'
    ],
    levelUp: [
      '레벨 업 축하해! 🎉',
      '우와! 레벨이 올랐어! 🌟',
      '더 강해졌어! 멋지다! 💪'
    ],
    longAbsence: [
      '오랜만이야! 어디 갔었어? 🤗',
      '보고 싶었어! 돌아와줘서 고마워! 💕',
      '다시 만나니까 좋아! 😊'
    ]
  }
};

/**
 * 시간대별 인사 가져오기
 * @returns {string} 현재 시간대에 맞는 인사
 */
export function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  
  let timeOfDay;
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'morning';
  } else if (hour >= 12 && hour < 18) {
    timeOfDay = 'afternoon';
  } else if (hour >= 18 && hour < 22) {
    timeOfDay = 'evening';
  } else {
    timeOfDay = 'night';
  }
  
  const greetings = LOCAL_RESPONSES.timeBasedGreetings[timeOfDay];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

/**
 * 배열에서 랜덤 선택
 * @param {Array} array - 선택할 배열
 * @returns {*} 랜덤하게 선택된 항목
 */
export function randomFrom(array) {
  if (!array || array.length === 0) {
    return '...';
  }
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 감정에 맞는 응답 선택
 * @param {string} emotion - 감정 ('기쁨', '슬픔' 등)
 * @returns {string} 선택된 응답
 */
export function getEmotionResponse(emotion) {
  const responses = LOCAL_RESPONSES.emotionResponses[emotion];
  if (responses) {
    return randomFrom(responses);
  }
  return randomFrom(LOCAL_RESPONSES.randomChats);
}

/**
 * 상황에 맞는 응답 선택 (지능형)
 * @param {Object} context - 컨텍스트 정보
 * @returns {string} 선택된 응답
 */
export function selectContextualResponse(context = {}) {
  const { 
    lastDiary, 
    evolutionStage, 
    justEvolved,
    isFirstMeeting,
    hasLongAbsence 
  } = context;
  
  // 진화 직후
  if (justEvolved) {
    return randomFrom(LOCAL_RESPONSES.evolutionMentions);
  }
  
  // 첫 만남
  if (isFirstMeeting) {
    return randomFrom(LOCAL_RESPONSES.special.firstMeeting);
  }
  
  // 오랜 부재 후 복귀
  if (hasLongAbsence) {
    return randomFrom(LOCAL_RESPONSES.special.longAbsence);
  }
  
  // 최근 일기의 감정에 맞는 응답
  if (lastDiary && lastDiary.selectedEmotion) {
    return getEmotionResponse(lastDiary.selectedEmotion);
  }
  
  // 랜덤 응답 (비율: 인사 30%, 격려 30%, 일상 40%)
  const rand = Math.random();
  if (rand < 0.3) {
    return randomFrom(LOCAL_RESPONSES.greetings);
  } else if (rand < 0.6) {
    return randomFrom(LOCAL_RESPONSES.encouragement);
  } else {
    return randomFrom(LOCAL_RESPONSES.randomChats);
  }
}

export default LOCAL_RESPONSES;


