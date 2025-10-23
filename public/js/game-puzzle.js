// Firebase 의존성 제거 (데모 모드 지원)
// import { db } from './config.js';
// import { doc, getDoc, updateDoc, serverTimestamp, setDoc } from 'firebase/firestore';

// 공통 게임 함수 import
import { checkGamePlays, incrementGamePlays, giveReward, updateGamePlaysDisplay } from './game-target.js';

/**
 * 슬라이딩 퍼즐 게임 클래스
 */
class PuzzleGame {
  constructor(canvasId, gridSize = 3, imageUrl = null) {
    try {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) {
        throw new Error(`Canvas 요소를 찾을 수 없습니다: ${canvasId}`);
      }
      
      this.ctx = this.canvas.getContext('2d');
      this.gridSize = gridSize;
      
      // 게임 상태
      this.isRunning = false;
      this.startTime = null;
      this.tiles = [];
      this.emptyPos = { row: gridSize - 1, col: gridSize - 1 };
      this.moves = 0;
      
      // 이미지
      this.image = new Image();
      this.imageLoaded = false;
      
      // 기본 힐링 이미지들 (SVG 데이터 URL)
      this.defaultImages = [
        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%234169E1" width="400" height="400"/><circle cx="200" cy="200" r="100" fill="%23FFD700"/></svg>',
        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%2300CED1" width="400" height="400"/><rect x="150" y="150" width="100" height="100" fill="%239370DB"/></svg>',
        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%23FFD700" width="400" height="400"/><path d="M200,100 L250,200 L200,300 L150,200 Z" fill="%23DC143C"/></svg>',
        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%239370DB" width="400" height="400"/><circle cx="200" cy="150" r="50" fill="%23FF69B4"/><circle cx="200" cy="250" r="50" fill="%23FF69B4"/></svg>',
        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect fill="%232F4F4F" width="400" height="400"/><polygon points="200,100 300,200 200,300 100,200" fill="%2300CED1"/></svg>'
      ];
      
      this.imageUrl = imageUrl || this.defaultImages[Math.floor(Math.random() * this.defaultImages.length)];
      
      this.init();
      
    } catch (error) {
      console.error('PuzzleGame 생성 실패:', error);
      throw error;
    }
  }
  
  /**
   * 게임 초기화
   */
  init() {
    try {
      this.canvas.width = 500;
      this.canvas.height = 500;
      
      this.tileSize = this.canvas.width / this.gridSize;
      
      // 이미지 로드
      this.image.onload = () => {
        this.imageLoaded = true;
        console.log('이미지 로드 완료');
        // 게임이 시작되지 않았다면 초기화만 수행
        if (!this.isRunning && (!this.tiles || this.tiles.length === 0)) {
          this.initializeTiles();
        }
        // 게임이 실행 중이면 렌더링만 수행
        this.render();
      };
      
      this.image.onerror = () => {
        console.error('이미지 로드 실패, 기본 이미지 사용');
        this.imageUrl = this.defaultImages[0];
        this.image.src = this.imageUrl;
      };
      
      this.image.src = this.imageUrl;
      
      // 클릭 이벤트
      this.canvas.addEventListener('click', (e) => this.handleClick(e));
      
    } catch (error) {
      console.error('게임 초기화 실패:', error);
    }
  }
  
  /**
   * 타일 배열 초기화
   */
  initializeTiles() {
    try {
      console.log('타일 배열 초기화 시작, 그리드 크기:', this.gridSize);
      
      // 타일 배열 초기화 (0 ~ gridSize² - 1)
      this.tiles = [];
      for (let row = 0; row < this.gridSize; row++) {
        this.tiles[row] = [];
        for (let col = 0; col < this.gridSize; col++) {
          this.tiles[row][col] = row * this.gridSize + col;
        }
      }
      
      // 마지막 타일을 빈 칸으로
      this.tiles[this.gridSize - 1][this.gridSize - 1] = -1;
      this.emptyPos = { row: this.gridSize - 1, col: this.gridSize - 1 };
      
      console.log('타일 배열 초기화 완료:', this.tiles);
      
    } catch (error) {
      console.error('타일 초기화 실패:', error);
    }
  }
  
  /**
   * 게임 시작
   */
  start() {
    try {
      console.log('=== 게임 시작 ===');
      
      this.isRunning = true;
      this.startTime = Date.now();
      this.moves = 0;
      
      // 타일 배열 초기화 및 섞기 (한 번에 처리)
      this.initializeAndShuffle();
      
      // 타이머 표시
      this.updateTimer();
      
      console.log('게임 시작 완료');
      
    } catch (error) {
      console.error('게임 시작 실패:', error);
    }
  }
  
  /**
   * 타일 배열 초기화 및 섞기
   */
  initializeAndShuffle() {
    try {
      console.log('타일 초기화 및 섞기 시작');
      
      // 먼저 정렬된 상태로 초기화
      this.tiles = [];
      for (let row = 0; row < this.gridSize; row++) {
        this.tiles[row] = [];
        for (let col = 0; col < this.gridSize; col++) {
          this.tiles[row][col] = row * this.gridSize + col;
        }
      }
      
      // 마지막 타일을 빈 칸으로
      this.tiles[this.gridSize - 1][this.gridSize - 1] = -1;
      this.emptyPos = { row: this.gridSize - 1, col: this.gridSize - 1 };
      
      console.log('초기 상태 (정렬됨):', JSON.parse(JSON.stringify(this.tiles)));
      
      // 실제 이동으로만 섞기 (해결 가능한 상태 보장)
      const moves = 500; // 충분히 많이 섞기
      let lastMove = null;
      
      for (let i = 0; i < moves; i++) {
        const neighbors = this.getEmptyNeighbors();
        
        // 이전 이동의 반대 방향을 제외 (왔다갔다 방지)
        const validNeighbors = neighbors.filter(neighbor => {
          if (!lastMove) return true;
          return !(neighbor.row === lastMove.row && neighbor.col === lastMove.col);
        });
        
        if (validNeighbors.length > 0) {
          const randomNeighbor = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
          lastMove = { ...this.emptyPos }; // 현재 빈 칸 위치 저장
          this.swapTiles(this.emptyPos, randomNeighbor, false);
        }
      }
      
      console.log('섞기 후 최종 타일 배열:', this.tiles);
      console.log('섞기 후 빈 칸 위치:', this.emptyPos);
      
      // 렌더링
      this.render();
      
    } catch (error) {
      console.error('초기화 및 섞기 실패:', error);
    }
  }
  
  /**
   * 퍼즐 섞기
   */
  shuffle() {
    try {
      console.log('퍼즐 섞기 시작, 초기 빈 칸 위치:', this.emptyPos);
      console.log('섞기 전 타일 배열:', this.tiles);
      
      // 완전히 랜덤한 섞기: Fisher-Yates 알고리즘 사용
      const totalTiles = this.gridSize * this.gridSize;
      const tileNumbers = [];
      
      // 0부터 totalTiles-2까지의 숫자 배열 생성 (빈 칸 -1 제외)
      for (let i = 0; i < totalTiles - 1; i++) {
        tileNumbers.push(i);
      }
      
      // Fisher-Yates 셔플
      for (let i = tileNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [tileNumbers[i], tileNumbers[j]] = [tileNumbers[j], tileNumbers[i]];
      }
      
      // 타일 배열에 적용
      let tileIndex = 0;
      for (let row = 0; row < this.gridSize; row++) {
        for (let col = 0; col < this.gridSize; col++) {
          if (row === this.gridSize - 1 && col === this.gridSize - 1) {
            this.tiles[row][col] = -1; // 빈 칸
            this.emptyPos = { row, col };
          } else {
            this.tiles[row][col] = tileNumbers[tileIndex++];
          }
        }
      }
      
      console.log('섞기 후 빈 칸 위치:', this.emptyPos);
      console.log('섞기 후 타일 배열:', this.tiles);
      
      this.render();
      
    } catch (error) {
      console.error('퍼즐 섞기 실패:', error);
    }
  }
  
  /**
   * 빈 칸 주변의 인접한 타일들 반환
   */
  getEmptyNeighbors() {
    try {
      const neighbors = [];
      const { row, col } = this.emptyPos;
      
      // 상하좌우 체크
      if (row > 0) neighbors.push({ row: row - 1, col });
      if (row < this.gridSize - 1) neighbors.push({ row: row + 1, col });
      if (col > 0) neighbors.push({ row, col: col - 1 });
      if (col < this.gridSize - 1) neighbors.push({ row, col: col + 1 });
      
      return neighbors;
      
    } catch (error) {
      console.error('인접 타일 검색 실패:', error);
      return [];
    }
  }
  
  /**
   * 두 타일 위치 교환
   */
  swapTiles(pos1, pos2, countMove = true) {
    try {
      // 배열 범위 확인
      if (!this.tiles || !this.tiles[pos1.row] || !this.tiles[pos2.row]) {
        console.warn('타일 배열이 올바르지 않습니다. 게임을 다시 초기화합니다.');
        this.initializeTiles();
        return;
      }
      
      if (pos1.row < 0 || pos1.row >= this.tiles.length || 
          pos1.col < 0 || pos1.col >= this.tiles[0].length ||
          pos2.row < 0 || pos2.row >= this.tiles.length || 
          pos2.col < 0 || pos2.col >= this.tiles[0].length) {
        console.warn('잘못된 위치:', pos1, pos2);
        return;
      }
      
      // 빈 칸 위치 확인
      const pos1IsEmpty = this.tiles[pos1.row][pos1.col] === -1;
      const pos2IsEmpty = this.tiles[pos2.row][pos2.col] === -1;
      
      // 타일 교환
      const temp = this.tiles[pos1.row][pos1.col];
      this.tiles[pos1.row][pos1.col] = this.tiles[pos2.row][pos2.col];
      this.tiles[pos2.row][pos2.col] = temp;
      
      // 빈 칸 위치 업데이트 (교환 후)
      if (pos1IsEmpty) {
        this.emptyPos = pos2;
      } else if (pos2IsEmpty) {
        this.emptyPos = pos1;
      }
      
      if (countMove) {
        this.moves++;
      }
      
    } catch (error) {
      console.error('타일 교환 실패:', error);
    }
  }
  
  /**
   * 클릭 이벤트 처리
   */
  handleClick(e) {
    try {
      if (!this.isRunning || !this.imageLoaded) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const col = Math.floor(x / this.tileSize);
      const row = Math.floor(y / this.tileSize);
      
      // 경계 체크
      if (row < 0 || row >= this.gridSize || col < 0 || col >= this.gridSize) {
        return;
      }
      
      // 클릭한 타일이 빈 칸과 인접한지 확인
      const neighbors = this.getEmptyNeighbors();
      const isNeighbor = neighbors.some(n => n.row === row && n.col === col);
      
      if (isNeighbor) {
        this.swapTiles(this.emptyPos, { row, col });
        this.render();
        
        // 완성 체크
        if (this.checkComplete()) {
          this.end();
        }
      }
      
    } catch (error) {
      console.error('클릭 처리 실패:', error);
    }
  }
  
  /**
   * 퍼즐 완성 여부 확인
   */
  checkComplete() {
    try {
      console.log('=== 완성 체크 시작 ===');
      console.log('현재 타일 배열:', this.tiles);
      
      for (let row = 0; row < this.gridSize; row++) {
        for (let col = 0; col < this.gridSize; col++) {
          const expectedValue = row * this.gridSize + col;
          const actualValue = this.tiles[row][col];
          
          // 마지막 타일은 -1 (빈 칸)
          if (row === this.gridSize - 1 && col === this.gridSize - 1) {
            console.log(`[${row},${col}] 빈 칸 위치 (기대값: -1, 실제값: ${actualValue})`);
            if (actualValue !== -1) {
              console.log('빈 칸이 제 위치에 없습니다!');
              return false;
            }
            continue;
          }
          
          console.log(`[${row},${col}] 기대값: ${expectedValue}, 실제값: ${actualValue}`);
          
          if (actualValue !== expectedValue) {
            console.log(`위치 [${row},${col}]가 맞지 않습니다!`);
            return false;
          }
        }
      }
      
      console.log('✅ 퍼즐 완성!');
      return true;
      
    } catch (error) {
      console.error('완성 체크 실패:', error);
      return false;
    }
  }
  
  /**
   * 게임 렌더링
   */
  render() {
    try {
      if (!this.imageLoaded) {
        return;
      }
      
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      for (let row = 0; row < this.gridSize; row++) {
        for (let col = 0; col < this.gridSize; col++) {
          const tileNum = this.tiles[row][col];
          
          if (tileNum === -1) {
            // 빈 칸
            this.ctx.fillStyle = '#E0E0E0';
            this.ctx.fillRect(
              col * this.tileSize,
              row * this.tileSize,
              this.tileSize,
              this.tileSize
            );
          } else {
            // 타일 그리기
            const srcRow = Math.floor(tileNum / this.gridSize);
            const srcCol = tileNum % this.gridSize;
            
            const srcX = srcCol * (this.image.width / this.gridSize);
            const srcY = srcRow * (this.image.height / this.gridSize);
            const srcW = this.image.width / this.gridSize;
            const srcH = this.image.height / this.gridSize;
            
            this.ctx.drawImage(
              this.image,
              srcX, srcY, srcW, srcH,
              col * this.tileSize,
              row * this.tileSize,
              this.tileSize,
              this.tileSize
            );
            
            // 타일 번호 표시 (왼쪽 위) - 1부터 시작
            const x = col * this.tileSize;
            const y = row * this.tileSize;
            
            // 반투명 배경
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(x + 5, y + 5, 30, 30);
            
            // 숫자 표시 (타일 번호 + 1)
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = 'bold 20px sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText((tileNum + 1).toString(), x + 20, y + 20);
          }
          
          // 테두리
          this.ctx.strokeStyle = '#333';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(
            col * this.tileSize,
            row * this.tileSize,
            this.tileSize,
            this.tileSize
          );
        }
      }
      
      // UI 정보
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, 50);
      
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 20px sans-serif';
      this.ctx.fillText(`이동: ${this.moves}`, 20, 30);
      
      if (this.isRunning) {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        this.ctx.fillText(
          `시간: ${minutes}:${seconds.toString().padStart(2, '0')}`,
          this.canvas.width - 150,
          30
        );
      }
      
    } catch (error) {
      console.error('렌더링 실패:', error);
    }
  }
  
  /**
   * 타이머 업데이트
   */
  updateTimer() {
    try {
      if (!this.isRunning) return;
      
      this.render();
      requestAnimationFrame(() => this.updateTimer());
      
    } catch (error) {
      console.error('타이머 업데이트 실패:', error);
    }
  }
  
  /**
   * 게임 종료
   */
  end() {
    try {
      this.isRunning = false;
      
      const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      
      // 결과 표시
      this.showResult(elapsed);
      
    } catch (error) {
      console.error('게임 종료 실패:', error);
    }
  }
  
  /**
   * 결과 화면 표시
   */
  showResult(timeInSeconds) {
    try {
      // 오버레이
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 48px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('완성! 🎉', this.canvas.width / 2, this.canvas.height / 2 - 80);
      
      const minutes = Math.floor(timeInSeconds / 60);
      const seconds = timeInSeconds % 60;
      this.ctx.font = 'bold 32px sans-serif';
      this.ctx.fillText(
        `시간: ${minutes}:${seconds.toString().padStart(2, '0')}`,
        this.canvas.width / 2,
        this.canvas.height / 2 - 20
      );
      
      this.ctx.font = '24px sans-serif';
      this.ctx.fillText(`이동 횟수: ${this.moves}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
      
      // 보상
      const reward = this.calculateReward(timeInSeconds);
      this.ctx.fillText(
        `획득: ${reward.name} +${reward.exp} EXP`,
        this.canvas.width / 2,
        this.canvas.height / 2 + 70
      );
      
      // 등급 표시
      const grade = this.calculateGrade(timeInSeconds);
      this.ctx.font = 'bold 28px sans-serif';
      this.ctx.fillStyle = grade.color;
      this.ctx.fillText(grade.text, this.canvas.width / 2, this.canvas.height / 2 + 120);
      
      this.ctx.textAlign = 'left';
      this.ctx.fillStyle = '#FFFFFF';
      
    } catch (error) {
      console.error('결과 표시 실패:', error);
    }
  }
  
  /**
   * 보상 계산
   */
  calculateReward(timeInSeconds) {
    try {
      if (timeInSeconds <= 60) {
        return { name: '슬픔 푸딩', exp: 40, foodId: 7 };
      } else if (timeInSeconds <= 180) {
        return { name: '슬픔 물방울', exp: 25, foodId: 6 };
      } else {
        return { name: '혐오 허브', exp: 15, foodId: 8 };
      }
    } catch (error) {
      console.error('보상 계산 실패:', error);
      return { name: '기본 보상', exp: 10, foodId: 0 };
    }
  }
  
  /**
   * 등급 계산
   */
  calculateGrade(timeInSeconds) {
    try {
      if (timeInSeconds <= 30) {
        return { text: 'S급!', color: '#FFD700' };
      } else if (timeInSeconds <= 60) {
        return { text: 'A급!', color: '#FF6B6B' };
      } else if (timeInSeconds <= 120) {
        return { text: 'B급!', color: '#4ECDC4' };
      } else if (timeInSeconds <= 300) {
        return { text: 'C급!', color: '#45B7D1' };
      } else {
        return { text: 'D급', color: '#96CEB4' };
      }
    } catch (error) {
      console.error('등급 계산 실패:', error);
      return { text: 'D급', color: '#96CEB4' };
    }
  }
  
  /**
   * 현재 경과 시간 반환
   */
  getTime() {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }
  
  /**
   * 게임 정리
   */
  destroy() {
    try {
      this.isRunning = false;
      
      if (this.canvas) {
        this.canvas.removeEventListener('click', this.handleClick);
      }
      
    } catch (error) {
      console.error('게임 정리 실패:', error);
    }
  }
}

/**
 * 퍼즐 게임 UI 설정
 */
export function setupPuzzleGame(uid, character) {
  try {
    const gameCard = document.getElementById('puzzle-game-card');
    const modal = document.getElementById('game-modal');
    const modalOverlay = document.getElementById('modal-overlay');
    const gameContainer = document.getElementById('game-container');
    const closeBtn = modal.querySelector('.modal-close');
    
    let currentGame = null;
    
    if (!gameCard || !modal || !modalOverlay || !gameContainer || !closeBtn) {
      console.error('필수 DOM 요소를 찾을 수 없습니다.');
      return;
    }
    
    gameCard.querySelector('button').addEventListener('click', async () => {
      try {
        // 플레이 횟수 확인
        const canPlay = await checkGamePlays(uid, 'puzzle');
        if (!canPlay) {
          alert('오늘 플레이 횟수를 모두 사용했습니다.');
          return;
        }
        
        // 난이도 선택 UI
        showDifficultySelector();
        
      } catch (error) {
        console.error('게임 시작 실패:', error);
        alert('게임을 시작할 수 없습니다.');
      }
    });
    
    /**
     * 난이도 선택 UI 표시
     */
    function showDifficultySelector() {
      try {
        gameContainer.innerHTML = `
          <div style="text-align: center; padding: 40px;">
            <h2 style="margin-bottom: 30px; color: #333;">난이도 선택</h2>
            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
              <button class="puzzle-difficulty-btn" data-size="3" style="padding: 20px 40px; font-size: 18px; border-radius: 12px; background: #4CAF50; color: white; border: none; cursor: pointer; transition: transform 0.2s;">
                쉬움<br><span style="font-size: 14px;">3×3</span>
              </button>
              <button class="puzzle-difficulty-btn" data-size="4" style="padding: 20px 40px; font-size: 18px; border-radius: 12px; background: #FFD700; color: #333; border: none; cursor: pointer; transition: transform 0.2s;">
                보통<br><span style="font-size: 14px;">4×4</span>
              </button>
            </div>
          </div>
        `;
        
        modal.classList.remove('hidden');
        modalOverlay.classList.remove('hidden');
        
        // 호버 효과
        document.querySelectorAll('.puzzle-difficulty-btn').forEach(btn => {
          btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.05)';
          });
          btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
          });
        });
        
        document.querySelectorAll('.puzzle-difficulty-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const size = parseInt(btn.dataset.size);
            startGame(size);
          });
        });
        
      } catch (error) {
        console.error('난이도 선택 UI 표시 실패:', error);
      }
    }
    
    /**
     * 게임 시작
     */
    function startGame(gridSize) {
      try {
        gameContainer.innerHTML = `
          <div style="text-align: center;">
            <canvas id="puzzle-canvas" style="border: 2px solid #ddd; border-radius: 8px;"></canvas>
            <div style="margin-top: 20px; display: flex; gap: 12px; justify-content: center;">
              <button id="puzzle-hint-btn" style="padding: 12px 24px; font-size: 16px; border-radius: 8px; background: #00CED1; color: white; border: none; cursor: pointer;">
                힌트 보기
              </button>
              <button id="puzzle-close-btn" style="padding: 12px 24px; font-size: 16px; border-radius: 8px; background: #DC143C; color: white; border: none; cursor: pointer;">
                게임 종료
              </button>
            </div>
          </div>
        `;
        
        currentGame = new PuzzleGame('puzzle-canvas', gridSize);
        currentGame.start();
        
        // 힌트 버튼
        document.getElementById('puzzle-hint-btn').addEventListener('click', () => {
          showHint(currentGame);
        });
        
        // 종료 버튼
        document.getElementById('puzzle-close-btn').addEventListener('click', async () => {
          try {
            if (currentGame.isRunning && !confirm('게임을 종료하시겠습니까?')) {
              return;
            }
            
            if (!currentGame.isRunning) {
              // 완성한 경우
              const time = currentGame.getTime();
              const reward = currentGame.calculateReward(time);
              
              // 보상 지급
              await giveReward(uid, character, reward);
              
              // 플레이 횟수 증가
              await incrementGamePlays(uid, 'puzzle');
            }
            
            closeModal();
          } catch (error) {
            console.error('게임 종료 처리 실패:', error);
          }
        });
        
      } catch (error) {
        console.error('게임 시작 실패:', error);
      }
    }
    
    /**
     * 힌트 표시
     */
    function showHint(game) {
      try {
        if (!game || !game.isRunning) return;
        
        // 1초간 완성된 이미지 표시
        const originalTiles = JSON.parse(JSON.stringify(game.tiles));
        const originalEmpty = { ...game.emptyPos };
        
        // 완성 상태로 임시 변경
        for (let row = 0; row < game.gridSize; row++) {
          for (let col = 0; col < game.gridSize; col++) {
            game.tiles[row][col] = row * game.gridSize + col;
          }
        }
        game.tiles[game.gridSize - 1][game.gridSize - 1] = -1;
        game.render();
        
        // 1초 후 원상복구
        setTimeout(() => {
          game.tiles = originalTiles;
          game.emptyPos = originalEmpty;
          game.render();
        }, 1000);
        
      } catch (error) {
        console.error('힌트 표시 실패:', error);
      }
    }
    
    /**
     * 모달 닫기
     */
    function closeModal() {
      try {
        if (currentGame) {
          currentGame.destroy();
          currentGame = null;
        }
        
        modal.classList.add('hidden');
        modalOverlay.classList.add('hidden');
        gameContainer.innerHTML = '';
        
        // 플레이 횟수 업데이트
        updateGamePlaysDisplay(uid);
        
      } catch (error) {
        console.error('모달 닫기 실패:', error);
      }
    }
    
    closeBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', closeModal);
    
  } catch (error) {
    console.error('퍼즐 게임 UI 설정 실패:', error);
  }
}

export default PuzzleGame;

