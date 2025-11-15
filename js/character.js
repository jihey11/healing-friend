//대부분 AI 사용
// import { doc, updateDoc, getDoc } from 'firebase/firestore';
// import { db } from './config.js';

/**
 * 파티클 클래스 - 캐릭터 애니메이션 효과용
 */
class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 6;
    this.vy = (Math.random() - 0.5) * 6 - 2;
    this.gravity = 0.3;
    this.alpha = 1;
    this.size = Math.random() * 8 + 4;
    this.color = this.randomColor();
  }

  /**
   * 랜덤 색상 생성
   */
  randomColor() {
    const colors = ['#FFD700', '#FF69B4', '#00CED1', '#9370DB', '#FF6B6B', '#4ECDC4'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * 파티클 업데이트
   */
  update() {
    this.vy += this.gravity;
    this.x += this.vx;
    this.y += this.vy;
    this.alpha -= 0.02;
  }

  /**
   * 파티클 그리기
   */
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * 파티클 생명 체크
   */
  isDead() {
    return this.alpha <= 0;
  }
}

/**
 * 캐릭터 클래스 - Canvas를 사용한 캐릭터 렌더링 및 관리
 */
export class Character {
  constructor(canvasId, userData) {
    try {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) {
        throw new Error(`Canvas 요소를 찾을 수 없습니다: ${canvasId}`);
      }
      
      this.ctx = this.canvas.getContext('2d');
      this.uid = userData.uid;
      
      // 캐릭터 속성
      this.level = userData.level || 1;
      this.exp = userData.exp || 0;
      this.evolutionStage = userData.evolutionStage || 0;
      this.firstEmotionColor = userData.firstEmotionColor || null;
      this.currentShape = userData.currentShape || 'circle';
      
      // 감정 점수
      this.emotions = userData.emotions || {
        기쁨: 0, 슬픔: 0, 분노: 0,
        두려움: 0, 놀람: 0, 혐오: 0
      };
      
      // 애니메이션
      this.animationFrame = null;
      this.particles = [];
      this.animationTime = 0;
      this.isAnimating = false;
      
      // 모션 시스템
      this.motionState = 'idle'; // idle, hover, click, happy, sad, angry, excited
      this.motionTime = 0;
      this.bounceOffset = 0;
      this.rotationAngle = 0;
      this.scaleFactor = 1;
      this.pulsePhase = 0;
      this.motionStartTime = 0;
      
      // 색상 매핑
      this.emotionColors = {
        기쁨: '#FFFF84',
        슬픔: '#4169E1',
        분노: '#ff7792',
        두려움: '#2F4F4F',
        놀람: '#00CED1',
        혐오: '#9370DB'
      };
      
      // 도형 매핑
      this.shapeTypes = {
        circle: '원',
        square: '사각형',
        triangle: '삼각형',
        star: '별',
        heart: '하트',
        diamond: '다이아몬드',
        drop: '방울',
        lightning: '번개',
        burst: '폭발',
        wave: '파도'
      };
      
      this.init();
      
    } catch (error) {
      console.error('캐릭터 생성 실패:', error);
      throw error;
    }
  }
  
  /**
   * 캐릭터 초기화
   */
  init() {
    try {
      // Canvas 크기 설정
      this.centerX = this.canvas.width / 2;
      this.centerY = this.canvas.height / 2;
      this.baseRadius = 110;
      
      // 클릭 이벤트
      this.canvas.addEventListener('click', () => this.onClick());
      
      // 호버 이벤트
      this.canvas.addEventListener('mouseenter', () => this.setMotionState('hover'));
      this.canvas.addEventListener('mouseleave', () => this.setMotionState('idle'));
      
      // 애니메이션 시작
      this.isAnimating = true;
      
      // 첫 렌더링
      this.render();
      
      console.log('캐릭터 초기화 완료:', {
        level: this.level,
        evolutionStage: this.evolutionStage,
        currentShape: this.currentShape
      });
      
    } catch (error) {
      console.error('캐릭터 초기화 실패:', error);
    }
  }
  
  /**
   * 캐릭터 렌더링
   */
  render() {
    try {
      // 캔버스 초기화
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // 모션 업데이트
      this.updateMotion();
      
      // 모션 변환을 한 번만 적용
      this.ctx.save();
      this.applyMotionTransforms();
      
      // 진화 단계에 따라 렌더링
      switch(this.evolutionStage) {
        case 0:
          this.drawStage0(); // 흰색 원
          break;
        case 1:
          this.drawStage1(); // 색상 원
          break;
        case 2:
          this.drawStage2(); // 도형
          break;
        case 3:
          this.drawStage3(); // 그라데이션 도형
          break;
        default:
          this.drawStage0();
      }
      
      // 모션 변환 복원
      this.ctx.restore();
      
      // 파티클 그리기
      this.drawParticles();
      
      // 애니메이션 계속
      if (this.isAnimating) {
        this.animationFrame = requestAnimationFrame(() => {
          this.animationTime += 0.016; // 60fps 기준
          this.motionTime += 0.016;
          this.render();
        });
      }
      
    } catch (error) {
      console.error('캐릭터 렌더링 실패:', error);
    }
  }
  
  /**
   * 0단계: 흰색 원 (기본 상태)
   */
  drawStage0() {
    try {
      const fill = '#FFFFFF';
      const stroke = '#E0E0E0';
      this.drawMochiBody(fill, stroke);
      
      // 눈/볼터치
      this.drawEyes(this.centerX, this.centerY);
      this.drawBlush(this.centerX, this.centerY);
      
    } catch (error) {
      console.error('0단계 그리기 실패:', error);
    }
  }
  
  /**
   * 1단계: 가장 높은 감정의 색상으로 원
   */
  drawStage1() {
    try {
      const highestEmotion = this.getHighestEmotion();
      const chosenColor = this.firstEmotionColor || this.emotionColors[highestEmotion];
      // 기쁨 윤곽선 여부: 선택 색이 기쁨색이면 기쁨으로 간주
      const isJoy = this.firstEmotionColor
        ? (this.firstEmotionColor.toLowerCase() === this.emotionColors['기쁨'].toLowerCase())
        : (highestEmotion === '기쁨');
      const stroke = isJoy ? '#FFF68E' : this.darkenColor(chosenColor, 20);
      this.drawMochiBody(chosenColor, stroke);
      
      // 눈/볼터치
      this.drawEyes(this.centerX, this.centerY);
      this.drawBlush(this.centerX, this.centerY);
      
    } catch (error) {
      console.error('1단계 그리기 실패:', error);
    }
  }
  
  /**
   * 2단계: 가장 높은 감정의 도형
   */
  drawStage2() {
    try {
      const highestEmotion = this.getHighestEmotion();
      const color = this.firstEmotionColor || this.emotionColors[highestEmotion];
      const stroke = highestEmotion === '기쁨' ? '#FFF68E' : this.darkenColor(color, 20);
      this.drawMochiBody(color, stroke);
      this.drawExpression(this.centerX, this.centerY, highestEmotion);
      
    } catch (error) {
      console.error('2단계 그리기 실패:', error);
    }
  }
  
  /**
   * 3단계: 그라데이션 도형 (1차 색 → 현재 최고 감정 색)
   */
  drawStage3() {
    try {
      const currentHighest = this.getHighestEmotion();
      const color1 = this.firstEmotionColor || this.emotionColors[currentHighest];
      const color2 = this.emotionColors[currentHighest];
      
      const gradient = this.ctx.createLinearGradient(
        this.centerX - this.baseRadius,
        this.centerY - this.baseRadius,
        this.centerX + this.baseRadius,
        this.centerY + this.baseRadius
      );
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);

      const stroke = currentHighest === '기쁨' ? '#FFF68E' : this.darkenColor(color2, 20);
      this.drawMochiBody(gradient, stroke);
      this.drawExpression(this.centerX, this.centerY, currentHighest);
      
    } catch (error) {
      console.error('3단계 그리기 실패:', error);
    }
  }
  
  /**
   * 별 그리기
   */
  drawStar(cx, cy, spikes, outerRadius, innerRadius) {
    try {
      let rot = Math.PI / 2 * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;
      
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - outerRadius);

      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        this.ctx.lineTo(x, y);
        rot += step;
        
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        this.ctx.lineTo(x, y);
        rot += step;
      }

      this.ctx.lineTo(cx, cy - outerRadius);
      this.ctx.closePath();
      
    } catch (error) {
      console.error('별 그리기 실패:', error);
    }
  }
  
  /**
   * 방울 그리기
   */
  drawDrop(cx, cy, radius) {
    try {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius * 0.7, 0, Math.PI, true);
      this.ctx.quadraticCurveTo(cx, cy + radius, cx, cy + radius);
      this.ctx.quadraticCurveTo(cx, cy + radius, cx + radius * 0.7 * Math.cos(0), cy + radius * 0.7 * Math.sin(0));
      this.ctx.closePath();
      
    } catch (error) {
      console.error('방울 그리기 실패:', error);
    }
  }
  
  /**
   * 번개 그리기
   */
  drawLightning(cx, cy, radius) {
    try {
      const width = radius * 0.6;
      const height = radius * 1.5;
      
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - height/2);
      this.ctx.lineTo(cx - width/4, cy);
      this.ctx.lineTo(cx + width/4, cy);
      this.ctx.lineTo(cx, cy + height/2);
      this.ctx.lineTo(cx + width/2, cy - height/4);
      this.ctx.lineTo(cx, cy - height/4);
      this.ctx.closePath();
      
    } catch (error) {
      console.error('번개 그리기 실패:', error);
    }
  }
  
  /**
   * 삼각형 그리기
   */
  drawTriangle(cx, cy, radius) {
    try {
      this.ctx.beginPath();
      this.ctx.moveTo(cx, cy - radius);
      this.ctx.lineTo(cx - radius * 0.866, cy + radius * 0.5);
      this.ctx.lineTo(cx + radius * 0.866, cy + radius * 0.5);
      this.ctx.closePath();
      
    } catch (error) {
      console.error('삼각형 그리기 실패:', error);
    }
  }
  
  /**
   * 폭발 그리기
   */
  drawBurst(cx, cy, radius) {
    try {
      const spikes = 8; // 8개의 가시
      const outerRadius = radius;
      const innerRadius = radius * 0.4; // 내부 반지름 (더 뾰족하게)
      const rotation = -Math.PI / 2; // 위쪽을 가리키도록 회전
      
      this.ctx.beginPath();
      
      for (let i = 0; i < spikes * 2; i++) {
        const angle = (i * Math.PI) / spikes + rotation;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        
        if (i === 0) {
          this.ctx.moveTo(x, y);
        } else {
          this.ctx.lineTo(x, y);
        }
      }
      
      this.ctx.closePath();
      
    } catch (error) {
      console.error('폭발 그리기 실패:', error);
    }
  }
  
  /**
   * 파도 그리기
   */
  drawWave(cx, cy, radius) {
    try {
      this.ctx.beginPath();
      this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      this.ctx.closePath();
      
      // 울퉁불퉁 효과
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 / 6) * i;
        const x = cx + Math.cos(angle) * radius * 1.1;
        const y = cy + Math.sin(angle) * radius * 1.1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 0.2, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
    } catch (error) {
      console.error('파도 그리기 실패:', error);
    }
  }
  
  /**
   * 눈 그리기
   */
  drawEyes(cx, cy) {
    try {
      const eyeOffsetX = this.baseRadius * 0.28;
      const eyeOffsetY = this.baseRadius * -0.12;
      const eyeRadius = Math.max(4, this.baseRadius * 0.06);
      this.ctx.fillStyle = '#000000';
      this.ctx.beginPath();
      this.ctx.arc(cx - eyeOffsetX, cy + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
      this.ctx.arc(cx + eyeOffsetX, cy + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
      this.ctx.fill();
      
    } catch (error) {
      console.error('눈 그리기 실패:', error);
    }
  }

  /**
   * 감정별 표정 (2단계)
   */
  drawExpression(cx, cy, emotion) {
    const ctx = this.ctx;
    const eyeOffsetX = this.baseRadius * 0.28;
    const eyeOffsetY = this.baseRadius * -0.12;
    const eyeRadius = Math.max(4, this.baseRadius * 0.06);

    // 기본: 동그란 눈
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx - eyeOffsetX, cy + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(cx + eyeOffsetX, cy + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    // 입 기본 위치/크기
    const mouthY = cy + this.baseRadius * 0.048 - 5;
    const mouthW = this.baseRadius * 0.38 - 3;
    const mouthH = this.baseRadius * 0.18 - 3;

    ctx.lineWidth = Math.max(2, this.baseRadius * 0.035);
    ctx.strokeStyle = '#3A3A3A';
    ctx.fillStyle = '#3A3A3A';

    switch (emotion) {
      case '기쁨': {
        // 웃는 눈 (반원) + 스마일
        ctx.strokeStyle = '#000000';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx - eyeOffsetX, cy + eyeOffsetY + eyeRadius * 0.2, eyeRadius * 0.9, Math.PI * 0.1, Math.PI - Math.PI * 0.1);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + eyeOffsetX, cy + eyeOffsetY + eyeRadius * 0.2, eyeRadius * 0.9, Math.PI * 0.1, Math.PI - Math.PI * 0.1);
        ctx.stroke();
        // 스마일 입
        ctx.beginPath();
        ctx.arc(cx, mouthY, mouthW * 0.55, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
        this.drawBlush(cx, cy);
        break;
      }
      case '슬픔': {
        // 아래로 처진 눈썹 + 눈물 + 하강 곡선
        ctx.strokeStyle = '#000000';
        ctx.lineCap = 'round';
        // 눈썹
        const browY = cy + eyeOffsetY - eyeRadius * 1.6;
        ctx.beginPath();
        ctx.moveTo(cx - eyeOffsetX - eyeRadius, browY);
        ctx.quadraticCurveTo(cx - eyeOffsetX, browY + eyeRadius * 0.8, cx - eyeOffsetX + eyeRadius, browY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + eyeOffsetX - eyeRadius, browY);
        ctx.quadraticCurveTo(cx + eyeOffsetX, browY + eyeRadius * 0.8, cx + eyeOffsetX + eyeRadius, browY);
        ctx.stroke();
        // 눈물
        ctx.fillStyle = '#4AA3FF';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.ellipse(cx + eyeOffsetX, cy + eyeOffsetY + eyeRadius * 1.6, eyeRadius * 0.35, eyeRadius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // 하강 곡선 입
        ctx.strokeStyle = '#3A3A3A';
        ctx.beginPath();
        ctx.arc(cx, mouthY + mouthH * 0.25, mouthW * 0.4, 1.15 * Math.PI, 1.85 * Math.PI, true);
        ctx.stroke();
        break;
      }
      case '분노': {
        // 사선 눈썹 + 찡그린 입
        ctx.strokeStyle = '#000000';
        ctx.lineCap = 'round';
        const browY = cy + eyeOffsetY - eyeRadius * 1.8;
        ctx.beginPath();
        ctx.moveTo(cx - eyeOffsetX - eyeRadius, browY + eyeRadius * 0.4);
        ctx.lineTo(cx - eyeOffsetX + eyeRadius, browY - eyeRadius * 0.4);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + eyeOffsetX - eyeRadius, browY - eyeRadius * 0.4);
        ctx.lineTo(cx + eyeOffsetX + eyeRadius, browY + eyeRadius * 0.4);
        ctx.stroke();
        // 찡그린 입
        ctx.strokeStyle = '#3A3A3A';
        ctx.beginPath();
        ctx.moveTo(cx - mouthW * 0.35, mouthY + mouthH * 0.05);
        ctx.quadraticCurveTo(cx, mouthY - mouthH * 0.35, cx + mouthW * 0.35, mouthY + mouthH * 0.05);
        ctx.stroke();
        break;
      }
      case '두려움': {
        // 커진 눈 + 작고 납작한 입
        const bigEye = eyeRadius * 1.3;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx - eyeOffsetX, cy + eyeOffsetY, bigEye, 0, Math.PI * 2);
        ctx.arc(cx + eyeOffsetX, cy + eyeOffsetY, bigEye, 0, Math.PI * 2);
        ctx.fill();
        // 입
        ctx.strokeStyle = '#3A3A3A';
        ctx.beginPath();
        ctx.moveTo(cx - mouthW * 0.18, mouthY);
        ctx.lineTo(cx + mouthW * 0.18, mouthY);
        ctx.stroke();
        break;
      }
      case '놀람': {
        // 동그란 입 "O"
        ctx.strokeStyle = '#3A3A3A';
        ctx.lineWidth = Math.max(2, this.baseRadius * 0.04);
        ctx.beginPath();
        ctx.arc(cx, mouthY, mouthW * 0.22, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }
      case '혐오': {
        // 지그재그/물결 입
        ctx.strokeStyle = '#3A3A3A';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        const startX = cx - mouthW * 0.35;
        const endX = cx + mouthW * 0.35;
        const step = (endX - startX) / 4;
        let x = startX;
        let y = mouthY + mouthH * 0.05;
        ctx.moveTo(x, y);
        for (let i = 0; i < 4; i++) {
          x += step;
          y = i % 2 === 0 ? mouthY - mouthH * 0.1 : mouthY + mouthH * 0.1;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
        break;
      }
      default: {
        // 기본 표정
        ctx.beginPath();
        ctx.arc(cx, mouthY, mouthW * 0.35, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      }
    }
  }

  /**
   * 찹쌀떡 모양 본체 그리기
   */
  drawMochiBody(fillStyle, strokeStyle) {
    const ctx = this.ctx;
    const cx = this.centerX;
    const cy = this.centerY;
    const rx = this.baseRadius * 1.05;
    const ry = this.baseRadius * 0.9;
    const k = 0.552284749831; // 베지어 원 상수
    const ox = rx * k;
    const oy = ry * k;

    // 부드러운 그림자
    ctx.shadowColor = 'rgba(0,0,0,0.08)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 6;

    ctx.fillStyle = fillStyle;
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(cx, cy - ry);
    ctx.bezierCurveTo(cx + ox, cy - ry, cx + rx, cy - oy, cx + rx, cy);
    ctx.bezierCurveTo(cx + rx, cy + oy * 1.1, cx + ox * 1.1, cy + ry * 1.05, cx, cy + ry * 1.05);
    ctx.bezierCurveTo(cx - ox * 1.1, cy + ry * 1.05, cx - rx, cy + oy * 1.1, cx - rx, cy);
    ctx.bezierCurveTo(cx - rx, cy - oy, cx - ox, cy - ry, cx, cy - ry);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 하이라이트 (상단 좌측)
    ctx.shadowColor = 'transparent';
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(cx - rx * 0.35, cy - ry * 0.35, rx * 0.25, ry * 0.15, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  /**
   * 볼터치
   */
  drawBlush(cx, cy) {
    const ctx = this.ctx;
    const blushOffsetX = this.baseRadius * 0.35;
    const blushOffsetY = this.baseRadius * 0.05;
    const blushR = Math.max(6, this.baseRadius * 0.12);
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = '#FF9BB3';
    ctx.beginPath();
    ctx.arc(cx - blushOffsetX, cy + blushOffsetY, blushR, 0, Math.PI * 2);
    ctx.arc(cx + blushOffsetX, cy + blushOffsetY, blushR, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  
  /**
   * 파티클 그리기
   */
  drawParticles() {
    try {
      this.particles.forEach((particle, index) => {
        particle.update();
        particle.draw(this.ctx);
        
        if (particle.isDead()) {
          this.particles.splice(index, 1);
        }
      });

      if (this.particles.length > 0) {
        requestAnimationFrame(() => this.render());
      }
      
    } catch (error) {
      console.error('파티클 그리기 실패:', error);
    }
  }
  
  /**
   * 모션 업데이트
   */
  updateMotion() {
    try {
      // 현재 모션의 상대적 시간 계산
      const currentTime = Date.now();
      const relativeTime = (currentTime - this.motionStartTime) / 1000; // 초 단위
      
      switch(this.motionState) {
        case 'idle':
          // 기본 대기 모션 - 부드러운 호흡
          this.pulsePhase += 0.05;
          this.scaleFactor = 1 + Math.sin(this.pulsePhase) * 0.02;
          this.bounceOffset = 0;
          this.rotationAngle = 0;
          break;
          
        case 'hover':
          // 호버 모션 - 살짝 커지고 위로 떠오름
          this.bounceOffset = Math.sin(relativeTime * 4) * 3;
          this.scaleFactor = 1.05;
          this.rotationAngle = 0;
          break;
          
        case 'click':
          // 클릭 모션 - 짧은 스퀴시 효과
          const clickProgress = Math.min(relativeTime * 10, 1);
          this.scaleFactor = 1 - clickProgress * 0.1;
          if (clickProgress >= 1) {
            this.motionState = 'idle';
            this.motionTime = 0;
          }
          break;
          
        case 'happy':
          // 기쁨 모션 - 위아래로 튀는 효과
          this.bounceOffset = Math.sin(relativeTime * 6) * 8;
          this.scaleFactor = 1 + Math.sin(relativeTime * 3) * 0.05;
          this.rotationAngle = 0;
          break;
          
        case 'sad':
          // 슬픔 모션 - 아래로 처짐
          this.bounceOffset = -5;
          this.scaleFactor = 0.95;
          this.rotationAngle = 0;
          break;
          
        case 'angry':
          // 분노 모션 - 좌우로 흔들림
          this.rotationAngle = Math.sin(relativeTime * 8) * 0.1;
          this.scaleFactor = 1.02;
          this.bounceOffset = 0;
          break;
          
        case 'excited':
          // excited 모션 - 최소한의 변화만 (거의 정적)
          this.rotationAngle = 0;
          this.scaleFactor = 1 + Math.sin(relativeTime * 0.5) * 0.02;  // 매우 느린 속도, 매우 작은 범위
          this.bounceOffset = 0;
          break;
      }
      
    } catch (error) {
      console.error('모션 업데이트 실패:', error);
    }
  }
  
  /**
   * 모션 변환 적용
   */
  applyMotionTransforms() {
    try {
      // 중심점으로 이동
      this.ctx.translate(this.centerX, this.centerY + this.bounceOffset);
      
      // 회전 적용
      if (this.rotationAngle !== 0) {
        this.ctx.rotate(this.rotationAngle);
      }
      
      // 스케일 적용
      if (this.scaleFactor !== 1) {
        this.ctx.scale(this.scaleFactor, this.scaleFactor);
      }
      
      // 중심점을 다시 원점으로 조정
      this.ctx.translate(-this.centerX, -this.centerY);
      
    } catch (error) {
      console.error('모션 변환 적용 실패:', error);
    }
  }
  
  /**
   * 모션 상태 변경
   */
  setMotionState(state, duration = 0) {
    try {
      this.motionState = state;
      this.motionTime = 0;
      this.motionStartTime = Date.now();
      
      // 모션 상태 초기화
      this.bounceOffset = 0;
      this.rotationAngle = 0;
      this.scaleFactor = 1;
      
      if (duration > 0) {
        setTimeout(() => {
          this.motionState = 'idle';
          this.motionTime = 0;
          this.bounceOffset = 0;
          this.rotationAngle = 0;
          this.scaleFactor = 1;
          this.motionStartTime = Date.now();
          console.log('모션 상태 자동 복귀:', this.motionState);
        }, duration);
      }
      
    } catch (error) {
      console.error('모션 상태 변경 실패:', error);
    }
  }

  /**
   * 클릭 이벤트 처리
   */
  onClick() {
    try {
      this.setMotionState('click', 200);
      this.showReaction();
      this.emitParticles(10);
      this.addExp(1);
      
    } catch (error) {
      console.error('클릭 이벤트 처리 실패:', error);
    }
  }
  
  /**
   * 반응 표시
   */
  showReaction() {
    try {
      const emojis = ['😊', '🤗', '✨', '💖', '🌟', '😄'];
      const emoji = emojis[Math.floor(Math.random() * emojis.length)];
      const bubble = document.getElementById('speech-bubble');
      const text = document.getElementById('speech-text');

      if (bubble && text) {
        text.textContent = emoji;
        bubble.classList.remove('hidden');

        setTimeout(() => {
          bubble.classList.add('hidden');
        }, 1000);
      }
      
    } catch (error) {
      console.error('반응 표시 실패:', error);
    }
  }
  
  /**
   * 파티클 생성
   */
  emitParticles(count) {
    try {
      for (let i = 0; i < count; i++) {
        this.particles.push(new Particle(this.centerX, this.centerY));
      }
      this.render();
      
    } catch (error) {
      console.error('파티클 생성 실패:', error);
    }
  }
  
  /**
   * 가장 높은 감정 찾기
   */
  getHighestEmotion() {
    try {
      let highest = '기쁨';
      let maxScore = 0;
      
      for (const [emotion, score] of Object.entries(this.emotions)) {
        if (score > maxScore) {
          maxScore = score;
          highest = emotion;
        }
      }
      
      return highest;
      
    } catch (error) {
      console.error('최고 감정 찾기 실패:', error);
      return '기쁨';
    }
  }
  
  /**
   * 진화 체크
   */
  checkEvolution() {
    try {
      const highest = this.getHighestEmotion();
      const score = this.emotions[highest];
      
      if (score >= 90 && this.evolutionStage < 3) {
        this.evolve(3, highest);
        return true;
      } else if (score >= 60 && this.evolutionStage < 2) {
        this.evolve(2, highest);
        return true;
      } else if (score >= 30 && this.evolutionStage < 1) {
        this.evolve(1, highest);
        return true;
      }

      return false;
      
    } catch (error) {
      console.error('진화 체크 실패:', error);
      return false;
    }
  }
  
  /**
   * 진화 처리
   */
  evolve(stage, emotion) {
    try {
      this.evolutionStage = stage;
      
      if (stage === 1) {
        this.firstEmotionColor = this.emotionColors[emotion];
      } else if (stage === 2) {
        const shapeMap = {
          기쁨: 'star',
          슬픔: 'drop',
          분노: 'lightning',
          두려움: 'triangle',
          놀람: 'burst',
          혐오: 'wave'
        };
        this.currentShape = shapeMap[emotion] || 'circle';
      }

      this.showEvolutionAnimation();
      this.saveToFirestore();
      
    } catch (error) {
      console.error('진화 처리 실패:', error);
    }
  }
  
  /**
   * 진화 애니메이션 표시
   */
  showEvolutionAnimation() {
    try {
      // 진화 시 파티클 효과만 사용, 모션은 전혀 사용하지 않음
      this.emitParticles(30);
      
      const bubble = document.getElementById('speech-bubble');
      const text = document.getElementById('speech-text');

      if (bubble && text) {
        text.textContent = '진화했어! 🌟';
        bubble.classList.remove('hidden');

        setTimeout(() => {
          bubble.classList.add('hidden');
        }, 3000);
      }
      
      // 진화 시 모션 상태는 전혀 변경하지 않음
      // 기존 idle 상태 유지
      console.log('진화 완료 - 모션 상태 유지:', this.motionState);
      
    } catch (error) {
      console.error('진화 애니메이션 표시 실패:', error);
    }
  }
  
  /**
   * 감정 업데이트
   */
  async updateEmotions(emotionScores) {
    try {
      // 감정 점수 업데이트
      for (const [emotion, score] of Object.entries(emotionScores)) {
        this.emotions[emotion] = Math.min(100, this.emotions[emotion] + score);
      }
      
      // 가장 높은 감정에 따른 모션 설정
      const highestEmotion = this.getHighestEmotion();
      this.setEmotionMotion(highestEmotion);
      
      // 진화 체크
      this.checkEvolution();

      // Firestore 저장
      await this.saveToFirestore();

      // UI 업데이트 (관리자 계정일 때만)
      if (window.updateEmotionScores && window.currentUser && window.currentUser.isAdmin) {
        window.updateEmotionScores(this.emotions);
      }

      this.render();
      
    } catch (error) {
      console.error('감정 업데이트 실패:', error);
    }
  }
  
  /**
   * 감정별 모션 설정
   */
  setEmotionMotion(emotion) {
    try {
      const motionMap = {
        '기쁨': 'happy',
        '슬픔': 'sad',
        '분노': 'angry',
        '두려움': 'sad',
        '놀람': 'excited',
        '혐오': 'angry'
      };
      
      const motionState = motionMap[emotion] || 'idle';
      this.setMotionState(motionState, 2000); // 2초간 지속
      
    } catch (error) {
      console.error('감정 모션 설정 실패:', error);
    }
  }
  
  /**
   * 경험치 추가
   */
  async addExp(amount) {
    try {
      console.log('경험치 추가 전:', this.exp);
      this.exp += amount;
      console.log('경험치 추가 후:', this.exp);
      
      // 레벨업 체크
      const requiredExp = this.getRequiredExp();
      if (this.exp >= requiredExp) {
        this.levelUp();
      }

      this.updateExpBar();
      await this.saveToFirestore();
      console.log('경험치 저장 완료:', this.exp);
      
    } catch (error) {
      console.error('경험치 추가 실패:', error);
    }
  }
  
  /**
   * 레벨업 처리
   */
  levelUp() {
    try {
      const requiredExp = this.getRequiredExp();
      this.exp -= requiredExp;
      this.level += 1;
      this.showLevelUpAnimation();

      // 레벨업 후에도 경험치가 남아있으면 재귀 체크
      if (this.exp >= this.getRequiredExp()) {
        this.levelUp();
      }
      
    } catch (error) {
      console.error('레벨업 처리 실패:', error);
    }
  }
  
  /**
   * 필요 경험치 계산
   */
  getRequiredExp() {
    return this.level * 50 + 50;
  }
  
  /**
   * 레벨업 애니메이션 표시
   */
  showLevelUpAnimation() {
    try {
      this.emitParticles(50);
      this.setMotionState('happy', 2000); // 2초간 기쁨 모션
      
      const bubble = document.getElementById('speech-bubble');
      const text = document.getElementById('speech-text');

      if (bubble && text) {
        text.textContent = `레벨 업! Lv.${this.level} 🎉`;
        bubble.classList.remove('hidden');

        setTimeout(() => {
          bubble.classList.add('hidden');
        }, 2000);
      }
      
    } catch (error) {
      console.error('레벨업 애니메이션 표시 실패:', error);
    }
  }
  
  /**
   * 경험치 바 업데이트
   */
  updateExpBar() {
    try {
      const requiredExp = this.getRequiredExp();
      const percentage = (this.exp / requiredExp) * 100;
      
      const levelElement = document.getElementById('character-level');
      const expFill = document.getElementById('exp-fill');
      const expText = document.getElementById('exp-text');
      
      if (levelElement) levelElement.textContent = this.level;
      if (expFill) expFill.style.width = `${percentage}%`;
      if (expText) expText.textContent = `${this.exp}/${requiredExp}`;
      
    } catch (error) {
      console.error('경험치 바 업데이트 실패:', error);
    }
  }
  
  /**
   * Firestore에 저장 (데모 모드에서는 로컬 스토리지 사용)
   */
  async saveToFirestore() {
    try {
      const characterData = {
        uid: this.uid,
        level: this.level,
        exp: this.exp,
        evolutionStage: this.evolutionStage,
        firstEmotionColor: this.firstEmotionColor,
        currentShape: this.currentShape,
        emotions: this.emotions
      };
      
      // 데모 모드에서는 로컬 스토리지에 저장
      if (this.uid.startsWith('demo_')) {
        localStorage.setItem('characterData', JSON.stringify(characterData));
        console.log('캐릭터 데이터를 로컬 스토리지에 저장했습니다:', characterData);
        return;
      }
      
      // Firebase 모드 (추후 구현)
      // await updateDoc(doc(db, 'character', this.uid), characterData);
      // await updateDoc(doc(db, 'emotions', this.uid), this.emotions);
      
    } catch (error) {
      console.error('캐릭터 저장 실패:', error);
    }
  }
  
  /**
   * 색상 어둡게 만들기
   */
  darkenColor(color, percent) {
    try {
      const num = parseInt(color.replace('#', ''), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) - amt;
      const G = (num >> 8 & 0x00FF) - amt;
      const B = (num & 0x0000FF) - amt;
      
      return '#' + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255))
        .toString(16).slice(1);
        
    } catch (error) {
      console.error('색상 어둡게 만들기 실패:', error);
      return color;
    }
  }
  
  /**
   * 애니메이션 중지
   */
  stopAnimation() {
    try {
      this.isAnimating = false;
      if (this.animationFrame) {
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = null;
      }
      
    } catch (error) {
      console.error('애니메이션 중지 실패:', error);
    }
  }
  
  /**
   * 캐릭터 정보 가져오기
   */
  getCharacterInfo() {
    try {
      return {
        level: this.level,
        exp: this.exp,
        evolutionStage: this.evolutionStage,
        currentShape: this.currentShape,
        firstEmotionColor: this.firstEmotionColor,
        emotions: { ...this.emotions }
      };
      
    } catch (error) {
      console.error('캐릭터 정보 가져오기 실패:', error);
      return null;
    }
  }
}

export default Character;
