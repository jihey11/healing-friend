#!/usr/bin/env node

/**
 * Netlify 배포를 위한 빌드 스크립트
 * 환경 변수를 index.html에 주입합니다.
 */

const fs = require('fs');
const path = require('path');

// public/index.html 파일 읽기
const indexPath = path.join(__dirname, 'public', 'index.html');
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Netlify 환경 변수 가져오기
let apiUrl = process.env.API_URL || process.env.REACT_APP_API_URL || 'http://localhost:3000';

// https:// 프로토콜 자동 추가 (도메인만 입력한 경우)
if (apiUrl && apiUrl !== 'http://localhost:3000' && !apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
  apiUrl = `https://${apiUrl}`;
  console.warn('⚠️ API_URL에 프로토콜이 없어서 https://를 추가했습니다:', apiUrl);
}

// API_URL이 없을 때 경고
if (!process.env.API_URL && !process.env.REACT_APP_API_URL) {
  console.warn('⚠️ 경고: API_URL 환경 변수가 설정되지 않았습니다!');
  console.warn('⚠️ Netlify 대시보드 > Site settings > Environment variables에서 API_URL을 설정하세요.');
}

// 환경 변수 객체 생성
const envVars = {
  API_URL: apiUrl,
  FIREBASE_API_KEY: process.env.FIREBASE_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN || process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || process.env.REACT_APP_FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET || process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: process.env.FIREBASE_APP_ID || process.env.REACT_APP_FIREBASE_APP_ID || ''
  // 주의: OPENAI_API_KEY는 절대 프론트엔드에 포함하지 않습니다!
  // 모든 AI API 호출은 백엔드 서버(API_URL)를 통해 이루어집니다.
};

// window.ENV 객체를 환경 변수로 대체
// 기존 window.ENV = { ... } 블록 전체를 찾아서 교체
const envBlockPattern = /window\.ENV\s*=\s*\{[\s\S]*?\};/;
// JSON을 안전하게 문자열로 변환 (들여쓰기 2칸으로 간소화)
const newEnvBlock = `window.ENV = ${JSON.stringify(envVars, null, 2)};`;

if (envBlockPattern.test(htmlContent)) {
  htmlContent = htmlContent.replace(envBlockPattern, newEnvBlock);
  console.log('✅ 환경 변수 주입 완료');
} else {
  console.warn('⚠️ window.ENV 블록을 찾을 수 없습니다. HTML 구조를 확인해주세요.');
}

// 수정된 내용을 파일에 쓰기
fs.writeFileSync(indexPath, htmlContent, 'utf8');

console.log('✅ Netlify 빌드 완료');
console.log('📝 주입된 환경 변수:');
console.log(`   API_URL: ${apiUrl}`);

