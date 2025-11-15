// Firebase 의존성 제거 (데모 모드 지원)
// import { db } from './config.js';
// import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { FoodInventory, getFoodById } from './food.js';

/**
 * 과녁 맞추기 게임 클래스
 */
class TargetGame {
  constructor(canvasId, difficulty = 'normal') {
    try {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) {
        throw new Error(`Canvas 요소를 찾을 수 없습니다: ${canvasId}`);
      }
      
      this.ctx = this.canvas.getContext('2d');
      this.difficulty = difficulty;
      
      // 게임 상태
      this.isRunning = false;
      this.score = 0;
      this.timeLeft = 30;
      this.targets = [];
      this.hitEffects = [];
      
      // 난이도별 설정
      this.config = {
        easy: { 
          size: 50, 
          speed: 1, 
          maxTargets: 3, 
          spawnInterval: 800,
          targetLifetime: 3000
        },
        normal: { 
          size: 35, 
          speed: 2, 
          maxTargets: 4, 
          spawnInterval: 600,
          targetLifetime: 2500
        },
        hard: { 
          size: 25, 
          speed: 3, 
          maxTargets: 5, 
          spawnInterval: 500,
          targetLifetime: 2000
        }
      };
      
      this.currentConfig = this.config[difficulty];
      
      // 타이머
      this.gameTimer = null;
      this.spawnTimer = null;
      this.animationFrame = null;
      
      this.init();
      
    } catch (error) {
      console.error('TargetGame 생성 실패:', error);
      throw error;
    }
  }
  
  /**
   * 게임 초기화
   */
  init() {
    try {
      this.canvas.width = 800;
      this.canvas.height = 600;
      
      // 터치 액션 설정 (모바일)
      this.canvas.style.touchAction = 'none';
      this.canvas.style.userSelect = 'none';
      this.canvas.style.webkitUserSelect = 'none';
      
      // 클릭 이벤트 (마우스)
      this.handleClickBound = (e) => this.handleClick(e);
      this.canvas.addEventListener('click', this.handleClickBound);
      
      // 터치 이벤트 (모바일) - touchstart와 touchend 모두 처리
      this.handleTouchStartBound = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.handleTouch(e);
      };
      
      this.handleTouchEndBound = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // touchend도 처리 (일부 브라우저에서 필요)
        if (e.changedTouches && e.changedTouches.length > 0) {
          this.handleTouch(e);
        }
      };
      
      this.canvas.addEventListener('touchstart', this.handleTouchStartBound, { passive: false });
      this.canvas.addEventListener('touchend', this.handleTouchEndBound, { passive: false });
      
      // 크로스헤어 커서
      this.canvas.style.cursor = 'crosshair';
      
    } catch (error) {
      console.error('게임 초기화 실패:', error);
    }
  }
  
  /**
   * 게임 시작
   */
  start() {
    try {
      this.isRunning = true;
      this.score = 0;
      this.timeLeft = 30;
      this.targets = [];
      this.hitEffects = [];
      
      // 타이머 시작
      this.gameTimer = setInterval(() => {
        this.timeLeft--;
        if (this.timeLeft <= 0) {
          this.end();
        }
      }, 1000);
      
      // 과녁 생성 타이머
      this.spawnTimer = setInterval(() => {
        this.spawnTarget();
      }, this.currentConfig.spawnInterval);
      
      // 첫 과녁
      this.spawnTarget();
      
      // 렌더링 루프
      this.gameLoop();
      
    } catch (error) {
      console.error('게임 시작 실패:', error);
    }
  }
  
  /**
   * 과녁 생성
   */
  spawnTarget() {
    try {
      if (this.targets.length >= this.currentConfig.maxTargets) {
        return;
      }
      
      const isMoving = Math.random() > 0.5;
      const target = {
        x: Math.random() * (this.canvas.width - 100) + 50,
        y: Math.random() * (this.canvas.height - 100) + 50,
        radius: this.currentConfig.size,
        isMoving: isMoving,
        vx: isMoving ? (Math.random() - 0.5) * this.currentConfig.speed * 2 : 0,
        vy: isMoving ? (Math.random() - 0.5) * this.currentConfig.speed * 2 : 0,
        points: isMoving ? 50 : 30,
        color: isMoving ? '#DC143C' : '#4169E1',
        createdAt: Date.now(),
        lifetime: this.currentConfig.targetLifetime
      };
      
      this.targets.push(target);
      
    } catch (error) {
      console.error('과녁 생성 실패:', error);
    }
  }
  
  /**
   * 게임 루프
   */
  gameLoop() {
    try {
      if (!this.isRunning) return;
      
      this.update();
      this.render();
      
      this.animationFrame = requestAnimationFrame(() => this.gameLoop());
      
    } catch (error) {
      console.error('게임 루프 실패:', error);
    }
  }
  
  /**
   * 게임 상태 업데이트
   */
  update() {
    try {
      const now = Date.now();
      
      // 과녁 업데이트
      for (let i = this.targets.length - 1; i >= 0; i--) {
        const target = this.targets[i];
        
        // 수명 체크
        if (now - target.createdAt > target.lifetime) {
          this.targets.splice(i, 1);
          continue;
        }
        
        if (target.isMoving) {
          target.x += target.vx;
          target.y += target.vy;
          
          // 벽 튕김
          if (target.x - target.radius < 0 || target.x + target.radius > this.canvas.width) {
            target.vx *= -1;
            target.x = Math.max(target.radius, Math.min(this.canvas.width - target.radius, target.x));
          }
          if (target.y - target.radius < 0 || target.y + target.radius > this.canvas.height) {
            target.vy *= -1;
            target.y = Math.max(target.radius, Math.min(this.canvas.height - target.radius, target.y));
          }
        }
      }
      
      // 히트 이펙트 업데이트
      for (let i = this.hitEffects.length - 1; i >= 0; i--) {
        const effect = this.hitEffects[i];
        effect.life -= 0.05;
        effect.radius += 2;
        
        if (effect.life <= 0) {
          this.hitEffects.splice(i, 1);
        }
      }
      
    } catch (error) {
      console.error('게임 업데이트 실패:', error);
    }
  }
  
  /**
   * 게임 렌더링
   */
  render() {
    try {
      // 배경
      this.ctx.fillStyle = '#f5f7fa';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // 과녁 그리기
      this.targets.forEach(target => {
        // 외곽원
        this.ctx.fillStyle = target.color;
        this.ctx.beginPath();
        this.ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 테두리
        this.ctx.strokeStyle = '#FFFFFF';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // 중심원
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(target.x, target.y, target.radius * 0.6, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 중심점
        this.ctx.fillStyle = target.color;
        this.ctx.beginPath();
        this.ctx.arc(target.x, target.y, target.radius * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 점수 표시
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 16px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(target.points.toString(), target.x, target.y + 5);
      });
      
      // 히트 이펙트 그리기
      this.hitEffects.forEach(effect => {
        this.ctx.save();
        this.ctx.globalAlpha = effect.life;
        this.ctx.fillStyle = effect.color;
        this.ctx.beginPath();
        this.ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      });
      
      // UI
      this.ctx.fillStyle = '#333';
      this.ctx.font = 'bold 24px sans-serif';
      this.ctx.textAlign = 'left';
      this.ctx.fillText(`점수: ${this.score}`, 20, 40);
      this.ctx.fillText(`시간: ${this.timeLeft}초`, this.canvas.width - 150, 40);
      
      // 난이도 표시
      this.ctx.font = '18px sans-serif';
      this.ctx.fillText(`난이도: ${this.difficulty.toUpperCase()}`, 20, 70);
      
    } catch (error) {
      console.error('게임 렌더링 실패:', error);
    }
  }
  
  /**
   * 클릭 이벤트 처리 (마우스)
   */
  handleClick(e) {
    try {
      if (!this.isRunning) return;
      
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      
      // 캔버스 좌표로 변환 (스케일 고려)
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      this.checkHit(x, y);
      
    } catch (error) {
      console.error('클릭 처리 실패:', error);
    }
  }
  
  /**
   * 터치 이벤트 처리 (모바일)
   */
  handleTouch(e) {
    try {
      if (!this.isRunning) {
        console.log('게임이 실행 중이 아닙니다');
        return;
      }
      
      // 터치 좌표 가져오기
      const touch = e.touches?.[0] || e.changedTouches?.[0];
      
      if (!touch) {
        console.log('터치 정보를 찾을 수 없습니다');
        return;
      }
      
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      
      // 캔버스 좌표로 변환 (스케일 고려)
      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;
      
      console.log('터치 좌표:', { x, y, touchX: touch.clientX, touchY: touch.clientY, rect });
      
      this.checkHit(x, y);
      
    } catch (error) {
      console.error('터치 처리 실패:', error);
    }
  }
  
  /**
   * 충돌 검사 및 점수 처리
   */
  checkHit(x, y) {
    try {
      // 과녁 충돌 검사
      for (let i = this.targets.length - 1; i >= 0; i--) {
        const target = this.targets[i];
        const distance = Math.sqrt((x - target.x) ** 2 + (y - target.y) ** 2);
        
        if (distance <= target.radius) {
          // 맞춤!
          this.score += target.points;
          this.targets.splice(i, 1);
          this.showHitEffect(x, y, target.points);
          break;
        }
      }
    } catch (error) {
      console.error('충돌 검사 실패:', error);
    }
  }
  
  /**
   * 히트 이펙트 표시
   */
  showHitEffect(x, y, points) {
    try {
      this.hitEffects.push({
        x: x,
        y: y,
        radius: 10,
        life: 1,
        color: points >= 50 ? '#FFD700' : '#4CAF50'
      });
      
    } catch (error) {
      console.error('히트 이펙트 표시 실패:', error);
    }
  }
  
  /**
   * 게임 종료
   */
  end() {
    try {
      this.isRunning = false;
      
      if (this.gameTimer) {
        clearInterval(this.gameTimer);
        this.gameTimer = null;
      }
      
      if (this.spawnTimer) {
        clearInterval(this.spawnTimer);
        this.spawnTimer = null;
      }
      
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
      
      // 결과 표시
      this.showResult();
      
      // 캐릭터 모션 트리거
      this.triggerGameCompleteMotion();
      
    } catch (error) {
      console.error('게임 종료 실패:', error);
    }
  }
  
  /**
   * 결과 화면 표시
   */
  showResult() {
    try {
      // 결과 화면 렌더링
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 48px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('게임 종료!', this.canvas.width / 2, this.canvas.height / 2 - 60);
      
      this.ctx.font = 'bold 36px sans-serif';
      this.ctx.fillText(`최종 점수: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
      
      // 보상 계산
      const reward = this.calculateReward();
      this.ctx.font = '24px sans-serif';
      this.ctx.fillText(`획득: ${reward.name} +${reward.exp} EXP`, this.canvas.width / 2, this.canvas.height / 2 + 60);
      
      // 등급 표시
      const grade = this.calculateGrade();
      this.ctx.font = 'bold 28px sans-serif';
      this.ctx.fillStyle = grade.color;
      this.ctx.fillText(grade.text, this.canvas.width / 2, this.canvas.height / 2 + 120);
      
      this.ctx.textAlign = 'left';
      
    } catch (error) {
      console.error('결과 표시 실패:', error);
    }
  }
  
  /**
   * 게임 완료 시 캐릭터 모션 트리거
   */
  triggerGameCompleteMotion() {
    try {
      if (window.character && window.character.setMotionState) {
        // 점수에 따른 모션 결정
        if (this.score >= 800) {
          window.character.setMotionState('excited', 3000); // 최고 점수 - 흥분
        } else if (this.score >= 500) {
          window.character.setMotionState('happy', 2500); // 좋은 점수 - 기쁨
        } else if (this.score >= 300) {
          window.character.setMotionState('happy', 2000); // 보통 점수 - 약간 기쁨
        } else {
          window.character.setMotionState('sad', 1500); // 낮은 점수 - 슬픔
        }
      }
    } catch (error) {
      console.error('게임 완료 모션 트리거 실패:', error);
    }
  }

  /**
   * 보상 계산
   */
  calculateReward() {
    try {
      // 점수에 따른 보상
      if (this.score >= 800) {
        return { name: '분노 고추', exp: 50, foodId: 3 };
      } else if (this.score >= 500) {
        return { name: '기쁨 케이크', exp: 35, foodId: 2 };
      } else if (this.score >= 300) {
        return { name: '기쁨 사탕', exp: 20, foodId: 1 };
      } else {
        return { name: '놀람 팝콘', exp: 15, foodId: 4 };
      }
    } catch (error) {
      console.error('보상 계산 실패:', error);
      return { name: '기본 보상', exp: 10, foodId: 0 };
    }
  }
  
  /**
   * 등급 계산
   */
  calculateGrade() {
    try {
      if (this.score >= 1000) {
        return { text: 'S급!', color: '#FFD700' };
      } else if (this.score >= 800) {
        return { text: 'A급!', color: '#FF6B6B' };
      } else if (this.score >= 600) {
        return { text: 'B급!', color: '#4ECDC4' };
      } else if (this.score >= 400) {
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
   * 현재 점수 반환
   */
  getScore() {
    return this.score;
  }
  
  /**
   * 게임 정리
   */
  destroy() {
    try {
      this.end();
      
      if (this.canvas) {
        if (this.handleClickBound) {
          this.canvas.removeEventListener('click', this.handleClickBound);
        }
        if (this.handleTouchStartBound) {
          this.canvas.removeEventListener('touchstart', this.handleTouchStartBound);
        }
        if (this.handleTouchEndBound) {
          this.canvas.removeEventListener('touchend', this.handleTouchEndBound);
        }
      }
      
    } catch (error) {
      console.error('게임 정리 실패:', error);
    }
  }
}

/**
 * 게임 UI 설정
 */
export function setupTargetGame(uid, character) {
  try {
    const gameCard = document.getElementById('target-game-card');
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
        const canPlay = await checkGamePlays(uid, 'target');
        if (!canPlay) {
          alert('오늘 플레이 횟수를 모두 사용했습니다.');
          return;
        }
        
        // 난이도 선택 UI 표시
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
              <button class="difficulty-btn" data-difficulty="easy" style="padding: 20px 40px; font-size: 18px; border-radius: 12px; background: #4CAF50; color: white; border: none; cursor: pointer; transition: transform 0.2s;">
                쉬움<br><span style="font-size: 14px;">큰 과녁, 느림</span>
              </button>
              <button class="difficulty-btn" data-difficulty="normal" style="padding: 20px 40px; font-size: 18px; border-radius: 12px; background: #FFD700; color: #333; border: none; cursor: pointer; transition: transform 0.2s;">
                보통<br><span style="font-size: 14px;">중간 크기, 중간 속도</span>
              </button>
              <button class="difficulty-btn" data-difficulty="hard" style="padding: 20px 40px; font-size: 18px; border-radius: 12px; background: #DC143C; color: white; border: none; cursor: pointer; transition: transform 0.2s;">
                어려움<br><span style="font-size: 14px;">작은 과녁, 빠름</span>
              </button>
            </div>
          </div>
        `;
        
        modal.classList.remove('hidden');
        modalOverlay.classList.remove('hidden');
        
        // 호버 효과
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
          btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'scale(1.05)';
          });
          btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'scale(1)';
          });
        });
        
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const difficulty = btn.dataset.difficulty;
            startGame(difficulty);
          });
        });
        
      } catch (error) {
        console.error('난이도 선택 UI 표시 실패:', error);
      }
    }
    
    /**
     * 게임 시작
     */
    function startGame(difficulty) {
      try {
        gameContainer.innerHTML = `
          <div style="text-align: center;">
            <canvas id="target-canvas" style="border: 2px solid #ddd; border-radius: 8px;"></canvas>
            <button id="game-close-btn" style="margin-top: 20px; padding: 12px 24px; font-size: 16px; border-radius: 8px; background: #DC143C; color: white; border: none; cursor: pointer;">
              게임 종료
            </button>
          </div>
        `;
        
        currentGame = new TargetGame('target-canvas', difficulty);
        currentGame.start();
        
        document.getElementById('game-close-btn').addEventListener('click', async () => {
          try {
            if (confirm('게임을 종료하시겠습니까?')) {
              const score = currentGame.getScore();
              const reward = currentGame.calculateReward();
              
              // 보상 지급
              await giveReward(uid, character, reward);
              
              // 플레이 횟수 증가
              await incrementGamePlays(uid, 'target');
              
              // 모달 닫기
              closeModal();
            }
          } catch (error) {
            console.error('게임 종료 처리 실패:', error);
          }
        });
        
      } catch (error) {
        console.error('게임 시작 실패:', error);
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
    console.error('게임 UI 설정 실패:', error);
  }
}

/**
 * 플레이 횟수 확인
 */
async function checkGamePlays(uid, gameType) {
  try {
    const progressRef = doc(db, 'gameProgress', uid);
    const progressSnap = await getDoc(progressRef);
    
    if (!progressSnap.exists()) {
      return true;
    }
    
    const data = progressSnap.data();
    const field = gameType === 'target' ? 'targetGamePlays' : 'puzzleGamePlays';
    const lastReset = data.lastReset?.toDate() || new Date(0);
    const now = new Date();
    
    // 날짜가 바뀌었으면 리셋
    if (now.toDateString() !== lastReset.toDateString()) {
      await updateDoc(progressRef, {
        targetGamePlays: 0,
        puzzleGamePlays: 0,
        lastReset: serverTimestamp()
      });
      return true;
    }
    
    return (data[field] || 0) < 5;
    
  } catch (error) {
    console.error('플레이 횟수 확인 실패:', error);
    return true;
  }
}

/**
 * 플레이 횟수 증가
 */
async function incrementGamePlays(uid, gameType) {
  try {
    const progressRef = doc(db, 'gameProgress', uid);
    const progressSnap = await getDoc(progressRef);
    
    if (!progressSnap.exists()) {
      await setDoc(progressRef, {
        targetGamePlays: gameType === 'target' ? 1 : 0,
        puzzleGamePlays: gameType === 'puzzle' ? 1 : 0,
        lastReset: serverTimestamp()
      });
    } else {
      const field = gameType === 'target' ? 'targetGamePlays' : 'puzzleGamePlays';
      const data = progressSnap.data();
      await updateDoc(progressRef, {
        [field]: (data[field] || 0) + 1
      });
    }
    
  } catch (error) {
    console.error('플레이 횟수 증가 실패:', error);
  }
}

/**
 * 보상 지급
 */
async function giveReward(uid, character, reward) {
  try {
    // 경험치 추가
    if (character && character.addExp) {
      await character.addExp(reward.exp);
    }
    
    // 인벤토리에 음식 추가
    if (reward.foodId && reward.foodId > 0) {
      const inventory = new FoodInventory(uid);
      await inventory.load();
      
      // 음식 데이터 확인
      const foodData = getFoodById(reward.foodId);
      if (foodData) {
        // 인벤토리에 음식 추가
        await inventory.addFood(reward.foodId, 1);
        
        // 음식 등급 정보를 별도로 저장 (음식 ID와 등급 매핑)
        const foodGrades = JSON.parse(localStorage.getItem(`foodGrades_${uid}`) || '{}');
        // 같은 음식 ID의 등급 정보를 배열로 저장 (여러 개 획득 가능)
        if (!foodGrades[reward.foodId]) {
          foodGrades[reward.foodId] = [];
        }
        foodGrades[reward.foodId].push({
          grade: reward.grade || 'D',
          emotionPoints: reward.emotionPoints || 1,
          acquiredAt: new Date().toISOString()
        });
        localStorage.setItem(`foodGrades_${uid}`, JSON.stringify(foodGrades));
        
        console.log(`보상 지급: ${reward.name} (+${reward.exp} EXP, 등급: ${reward.grade || 'D'}급)`);
        
        // 음식탭 UI 업데이트 (있는 경우)
        // 음식 뷰가 활성화되어 있으면 즉시 업데이트, 아니면 나중에 업데이트될 것임
        if (window.renderFoodInventory) {
          try {
            await window.renderFoodInventory(uid);
            console.log('음식 인벤토리 UI 업데이트 완료');
          } catch (error) {
            console.error('음식 인벤토리 UI 업데이트 실패:', error);
          }
        } else {
          console.warn('window.renderFoodInventory 함수를 찾을 수 없습니다.');
        }
      } else {
        console.warn(`음식 데이터를 찾을 수 없습니다: foodId=${reward.foodId}`);
      }
    } else {
      console.log(`보상 지급: ${reward.name} (+${reward.exp} EXP)`);
    }
    
  } catch (error) {
    console.error('보상 지급 실패:', error);
  }
}

/**
 * 플레이 횟수 표시 업데이트
 */
async function updateGamePlaysDisplay(uid) {
  try {
    // 데모 모드에서는 로컬 스토리지에서 확인
    if (uid.startsWith('demo_')) {
      const gameProgress = JSON.parse(localStorage.getItem('gameProgress') || '{}');
      const lastReset = gameProgress.lastReset ? new Date(gameProgress.lastReset) : new Date(0);
      const now = new Date();
      
      // 하루가 지났으면 리셋
      if (now - lastReset >= 24 * 60 * 60 * 1000) {
        gameProgress.targetGamePlays = 0;
        gameProgress.puzzleGamePlays = 0;
        gameProgress.lastReset = now.toISOString();
        localStorage.setItem('gameProgress', JSON.stringify(gameProgress));
      }
      
      const targetPlays = document.getElementById('target-plays');
      const puzzlePlays = document.getElementById('puzzle-plays');
      if (targetPlays) targetPlays.textContent = gameProgress.targetGamePlays || 0;
      if (puzzlePlays) puzzlePlays.textContent = gameProgress.puzzleGamePlays || 0;
      return;
    }
    
    // Firebase 모드 (추후 구현)
    console.log('Firebase 모드는 아직 구현되지 않았습니다.');
    const targetPlays = document.getElementById('target-plays');
    const puzzlePlays = document.getElementById('puzzle-plays');
    if (targetPlays) targetPlays.textContent = '0';
    if (puzzlePlays) puzzlePlays.textContent = '0';
    
  } catch (error) {
    console.error('플레이 횟수 표시 업데이트 실패:', error);
  }
}

export default TargetGame;

