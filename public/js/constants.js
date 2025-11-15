/**
 * ==========================================
 * 애플리케이션 전역 상수 및 설정
 * ==========================================
 */

// ========== API 설정 ==========
export const API_CONFIG = {
  // 백엔드 API URL (환경변수에서 가져오거나 기본값 사용)
  getApiUrl: () => window.ENV?.API_URL || 'http://localhost:3000',
  
  // API 엔드포인트
  endpoints: {
    chat: '/api/chat',
    analysis: '/api/analyze',
    health: '/api/health'
  },
  
  // 요청 타임아웃
  timeout: 30000, // 30초
};

// ========== 감정 관련 상수 ==========
export const EMOTIONS = {
  // 감정 이름 배열
  list: ['기쁨', '슬픔', '분노', '두려움', '놀람', '혐오'],
  
  // 감정별 색상 매핑
  colors: {
    기쁨: '#FFFF84',
    슬픔: '#4169E1',
    분노: '#ff7792',
    두려움: '#2F4F4F',
    놀람: '#00CED1',
    혐오: '#9370DB'
  },
  
  // 감정별 이모지
  emojis: {
    기쁨: '😊',
    슬픔: '😢',
    분노: '😡',
    두려움: '😰',
    놀람: '😲',
    혐오: '😖'
  },
  
  // 감정별 도형 (2단계 진화)
  shapes: {
    기쁨: 'star',
    슬픔: 'drop',
    분노: 'lightning',
    두려움: 'triangle',
    놀람: 'burst',
    혐오: 'wave'
  }
};

// ========== 캐릭터 진화 설정 ==========
export const EVOLUTION_CONFIG = {
  // 진화 단계별 필요 감정 점수
  stages: [
    { stage: 0, requiredScore: 0, name: '알' },
    { stage: 1, requiredScore: 30, name: '1단계' },
    { stage: 2, requiredScore: 60, name: '2단계' },
    { stage: 3, requiredScore: 90, name: '3단계 (최종)' }
  ],
  
  // 레벨업 필요 경험치 계산 공식
  getRequiredExp: (level) => level * 50 + 50,
  
  // 최대 레벨
  maxLevel: 100,
  
  // 최대 진화 단계
  maxEvolutionStage: 3
};

// ========== 애니메이션 설정 ==========
export const ANIMATION_CONFIG = {
  // 타이핑 효과 속도
  typingSpeed: 20, // ms
  
  // 파티클 설정
  particle: {
    count: {
      click: 10,
      levelUp: 50,
      evolution: 30
    },
    colors: ['#FFD700', '#FF69B4', '#00CED1', '#9370DB', '#FF6B6B', '#4ECDC4']
  },
  
  // 모션 지속 시간
  motionDuration: {
    click: 200,
    happy: 2000,
    levelUp: 2000,
    emotion: 2000
  }
};

// ========== 채팅 설정 ==========
export const CHAT_CONFIG = {
  // 메시지 길이 임계값 (이 길이 이상이면 GPT API 사용)
  gptThreshold: 10,
  
  // 대화 이력 최대 개수
  maxHistoryLength: 12,
  
  // API 호출 시 포함할 최근 메시지 개수
  contextMessageCount: 6,
  
  // 자동 인사 간격 (밀리초)
  autoGreetingInterval: 30 * 60 * 1000 // 30분
};

// ========== 로컬 스토리지 키 ==========
export const STORAGE_KEYS = {
  demoUser: 'demoUser',
  characterData: 'characterData',
  
  // 사용자별 키 생성 함수
  chatHistory: (uid) => `chatHistory_${uid}`,
  simpleChatHistory: (uid) => `simple_chat_${uid}`,
  diaries: (uid) => `diaries_${uid}`,
  userCreatedAt: (uid) => `userCreatedAt_${uid}`
};

// ========== UI 설정 ==========
export const UI_CONFIG = {
  // 토스트 메시지 기본 지속 시간
  toastDuration: 3000,
  
  // 말풍선 표시 시간
  speechBubbleDuration: 3000,
  
  // 로딩 인디케이터 최소 표시 시간
  minLoadingDuration: 500,
  
  // 일기 목록 최대 표시 개수
  maxDiaryDisplay: 20,
  
  // 일기 수정 가능 시간 (시간)
  diaryEditableHours: 24
};

// ========== 정규식 패턴 ==========
export const REGEX_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^.{6,}$/, // 최소 6자
  nickname: /^[가-힣a-zA-Z0-9]{2,10}$/ // 2-10자, 한글/영문/숫자
};

// ========== 에러 메시지 ==========
export const ERROR_MESSAGES = {
  network: '네트워크 연결을 확인해주세요.',
  api: 'API 서버와 통신에 실패했습니다.',
  auth: '인증에 실패했습니다.',
  validation: '입력값을 확인해주세요.',
  unknown: '알 수 없는 오류가 발생했습니다.',
  
  // 특정 상황별 메시지
  chatFailed: '메시지 전송에 실패했습니다.',
  diaryFailed: '일기 저장에 실패했습니다.',
  characterFailed: '캐릭터 초기화에 실패했습니다.'
};

// ========== 성공 메시지 ==========
export const SUCCESS_MESSAGES = {
  login: '로그인되었습니다.',
  logout: '로그아웃되었습니다.',
  signup: '회원가입이 완료되었습니다.',
  diarySaved: '일기가 저장되었습니다.',
  diaryDeleted: '일기가 삭제되었습니다.',
  levelUp: (level) => `레벨 업! Lv.${level} 🎉`,
  evolution: (stage) => `${stage}단계로 진화했습니다! 🌟`
};

// ========== 관리자 설정 ==========
export const ADMIN_CONFIG = {
  // 관리자 이메일 목록
  emails: ['ghrkrtldk@gmail.com'],
  
  // 관리자 권한 확인
  isAdmin: (email) => ADMIN_CONFIG.emails.includes(email)
};

// ========== 개발 모드 설정 ==========
export const DEV_CONFIG = {
  // 디버그 로그 활성화
  enableDebugLog: true,
  
  // 데모 모드 활성화
  enableDemoMode: true,
  
  // 개발용 빠른 진화 (감정 점수 요구치 낮춤)
  fastEvolution: false
};

// ========== 기본 export ==========
export default {
  API_CONFIG,
  EMOTIONS,
  EVOLUTION_CONFIG,
  ANIMATION_CONFIG,
  CHAT_CONFIG,
  STORAGE_KEYS,
  UI_CONFIG,
  REGEX_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ADMIN_CONFIG,
  DEV_CONFIG
};


