/**
 * ==========================================
 * 캐릭터 렌더러
 * ==========================================
 * Character 클래스의 렌더링 로직만 분리
 * - 진화 단계별 그리기
 * - 도형 그리기
 * - 표정 그리기
 * - 효과 그리기
 */

import { EMOTIONS } from './constants.js';

// ==================== 기본 도형 그리기 유틸리티 ====================

//AI 사용
/**
 * 베지어 곡선으로 부드러운 원형 (찹쌀떡 모양) 그리기
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {number} cx - 중심 X
 * @param {number} cy - 중심 Y
 * @param {number} rx - X축 반지름
 * @param {number} ry - Y축 반지름
 * @param {string|CanvasGradient} fillStyle - 채우기 스타일
 * @param {string} strokeStyle - 외곽선 스타일
 */
export function drawMochiBody(ctx, cx, cy, rx, ry, fillStyle, strokeStyle) {
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
 * 눈 그리기
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {number} cx - 중심 X
 * @param {number} cy - 중심 Y
 * @param {number} baseRadius - 기본 반지름
 */
export function drawEyes(ctx, cx, cy, baseRadius) {
  const eyeOffsetX = baseRadius * 0.28;
  const eyeOffsetY = baseRadius * -0.12;
  const eyeRadius = Math.max(4, baseRadius * 0.06);
  
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx - eyeOffsetX, cy + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
  ctx.arc(cx + eyeOffsetX, cy + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 볼터치 그리기
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {number} cx - 중심 X
 * @param {number} cy - 중심 Y
 * @param {number} baseRadius - 기본 반지름
 */
export function drawBlush(ctx, cx, cy, baseRadius) {
  const blushOffsetX = baseRadius * 0.35;
  const blushOffsetY = baseRadius * 0.05;
  const blushR = Math.max(6, baseRadius * 0.12);
  
  ctx.globalAlpha = 0.25;
  ctx.fillStyle = '#FF9BB3';
  ctx.beginPath();
  ctx.arc(cx - blushOffsetX, cy + blushOffsetY, blushR, 0, Math.PI * 2);
  ctx.arc(cx + blushOffsetX, cy + blushOffsetY, blushR, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

// ==================== 감정별 표정 그리기 ====================

/**
 * 감정별 표정 그리기
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {number} cx - 중심 X
 * @param {number} cy - 중심 Y
 * @param {number} baseRadius - 기본 반지름
 * @param {string} emotion - 감정 ('기쁨', '슬픔', '분노', '두려움', '놀람', '혐오')
 */
export function drawExpression(ctx, cx, cy, baseRadius, emotion) {
  const eyeOffsetX = baseRadius * 0.28;
  const eyeOffsetY = baseRadius * -0.12;
  const eyeRadius = Math.max(4, baseRadius * 0.06);

  // 입 기본 위치/크기
  const mouthY = cy + baseRadius * 0.048 - 5;
  const mouthW = baseRadius * 0.38 - 3;
  const mouthH = baseRadius * 0.18 - 3;

  ctx.lineWidth = Math.max(2, baseRadius * 0.035);
  ctx.strokeStyle = '#3A3A3A';
  ctx.fillStyle = '#3A3A3A';

  switch (emotion) {
    case '기쁨':
      drawHappyExpression(ctx, cx, cy, eyeOffsetX, eyeOffsetY, eyeRadius, mouthY, mouthW, baseRadius);
      break;
    case '슬픔':
      drawSadExpression(ctx, cx, cy, eyeOffsetX, eyeOffsetY, eyeRadius, mouthY, mouthW, mouthH);
      break;
    case '분노':
      drawAngryExpression(ctx, cx, cy, eyeOffsetX, eyeOffsetY, eyeRadius, mouthY, mouthW, mouthH);
      break;
    case '두려움':
      drawFearfulExpression(ctx, cx, cy, eyeOffsetX, eyeOffsetY, eyeRadius, mouthY, mouthW);
      break;
    case '놀람':
      drawSurprisedExpression(ctx, cx, cy, mouthY, mouthW, baseRadius);
      break;
    case '혐오':
      drawDisgustedExpression(ctx, cx, cy, mouthY, mouthW, mouthH);
      break;
    default:
      // 기본 표정 (눈과 입)
      drawEyes(ctx, cx, cy, baseRadius);
      ctx.beginPath();
      ctx.arc(cx, mouthY, mouthW * 0.35, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
  }
}

// 개별 표정 그리기 함수들
function drawHappyExpression(ctx, cx, cy, eyeOffsetX, eyeOffsetY, eyeRadius, mouthY, mouthW, baseRadius) {
  // 웃는 눈
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
  
  drawBlush(ctx, cx, cy, baseRadius);
}

function drawSadExpression(ctx, cx, cy, eyeOffsetX, eyeOffsetY, eyeRadius, mouthY, mouthW, mouthH) {
  // 아래로 처진 눈썹
  ctx.strokeStyle = '#000000';
  ctx.lineCap = 'round';
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
}

function drawAngryExpression(ctx, cx, cy, eyeOffsetX, eyeOffsetY, eyeRadius, mouthY, mouthW, mouthH) {
  // 사선 눈썹
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
}

function drawFearfulExpression(ctx, cx, cy, eyeOffsetX, eyeOffsetY, eyeRadius, mouthY, mouthW) {
  // 커진 눈
  const bigEye = eyeRadius * 1.3;
  ctx.fillStyle = '#000000';
  ctx.beginPath();
  ctx.arc(cx - eyeOffsetX, cy + eyeOffsetY, bigEye, 0, Math.PI * 2);
  ctx.arc(cx + eyeOffsetX, cy + eyeOffsetY, bigEye, 0, Math.PI * 2);
  ctx.fill();
  
  // 작고 납작한 입
  ctx.strokeStyle = '#3A3A3A';
  ctx.beginPath();
  ctx.moveTo(cx - mouthW * 0.18, mouthY);
  ctx.lineTo(cx + mouthW * 0.18, mouthY);
  ctx.stroke();
}

function drawSurprisedExpression(ctx, cx, cy, mouthY, mouthW, baseRadius) {
  // 동그란 눈 (기본 눈으로 충분)
  drawEyes(ctx, cx, cy, baseRadius);
  
  // 동그란 입 "O"
  ctx.strokeStyle = '#3A3A3A';
  ctx.lineWidth = Math.max(2, baseRadius * 0.04);
  ctx.beginPath();
  ctx.arc(cx, mouthY, mouthW * 0.22, 0, Math.PI * 2);
  ctx.stroke();
}

function drawDisgustedExpression(ctx, cx, cy, mouthY, mouthW, mouthH) {
  // 지그재그 입
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
}

// ==================== 특수 도형 그리기 ====================

/**
 * 별 그리기
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {number} cx - 중심 X
 * @param {number} cy - 중심 Y
 * @param {number} spikes - 가시 개수
 * @param {number} outerRadius - 외부 반지름
 * @param {number} innerRadius - 내부 반지름
 */
export function drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
  let rot = Math.PI / 2 * 3;
  const step = Math.PI / spikes;
  
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rot) * outerRadius;
    let y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }

  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
}

/**
 * 삼각형 그리기
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {number} cx - 중심 X
 * @param {number} cy - 중심 Y
 * @param {number} radius - 반지름
 */
export function drawTriangle(ctx, cx, cy, radius) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - radius);
  ctx.lineTo(cx - radius * 0.866, cy + radius * 0.5);
  ctx.lineTo(cx + radius * 0.866, cy + radius * 0.5);
  ctx.closePath();
}

/**
 * 방울 그리기
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {number} cx - 중심 X
 * @param {number} cy - 중심 Y
 * @param {number} radius - 반지름
 */
export function drawDrop(ctx, cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.7, 0, Math.PI, true);
  ctx.quadraticCurveTo(cx, cy + radius, cx, cy + radius);
  ctx.quadraticCurveTo(cx, cy + radius, cx + radius * 0.7 * Math.cos(0), cy + radius * 0.7 * Math.sin(0));
  ctx.closePath();
}

/**
 * 번개 그리기
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {number} cx - 중심 X
 * @param {number} cy - 중심 Y
 * @param {number} radius - 반지름
 */
export function drawLightning(ctx, cx, cy, radius) {
  const width = radius * 0.6;
  const height = radius * 1.5;
  
  ctx.beginPath();
  ctx.moveTo(cx, cy - height/2);
  ctx.lineTo(cx - width/4, cy);
  ctx.lineTo(cx + width/4, cy);
  ctx.lineTo(cx, cy + height/2);
  ctx.lineTo(cx + width/2, cy - height/4);
  ctx.lineTo(cx, cy - height/4);
  ctx.closePath();
}

/**
 * 폭발 그리기
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {number} cx - 중심 X
 * @param {number} cy - 중심 Y
 * @param {number} radius - 반지름
 */
export function drawBurst(ctx, cx, cy, radius) {
  const spikes = 8;
  const outerRadius = radius;
  const innerRadius = radius * 0.4;
  const rotation = -Math.PI / 2;
  
  ctx.beginPath();
  
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i * Math.PI) / spikes + rotation;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  
  ctx.closePath();
}

/**
 * 파도 그리기
 * @param {CanvasRenderingContext2D} ctx - Canvas 컨텍스트
 * @param {number} cx - 중심 X
 * @param {number} cy - 중심 Y
 * @param {number} radius - 반지름
 */
export function drawWave(ctx, cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.closePath();
  
  // 울퉁불퉁 효과
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI * 2 / 6) * i;
    const x = cx + Math.cos(angle) * radius * 1.1;
    const y = cy + Math.sin(angle) * radius * 1.1;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ==================== 유틸리티 함수 ====================

/**
 * 색상 어둡게 만들기
 * @param {string} color - 색상 (hex)
 * @param {number} percent - 어둡게 할 퍼센트
 * @returns {string} 어두워진 색상
 */
export function darkenColor(color, percent) {
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

export default {
  drawMochiBody,
  drawEyes,
  drawBlush,
  drawExpression,
  drawStar,
  drawTriangle,
  drawDrop,
  drawLightning,
  drawBurst,
  drawWave,
  darkenColor
};


