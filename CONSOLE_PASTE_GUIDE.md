# 브라우저 콘솔 코드 붙여넣기 가이드

브라우저 개발자 도구 콘솔에서 코드를 붙여넣을 때 보안 경고가 나타나는 경우 해결 방법입니다.

## 문제 상황

콘솔에 코드를 붙여넣으려고 하면 다음과 같은 경고가 나타납니다:

```
Warning: Don't paste code into the DevTools Console that you don't understand 
or haven't reviewed yourself. This could allow attackers to steal your identity 
or take control of your computer. Please type 'allow pasting' below and hit 
Enter to allow pasting.
```

## 해결 방법

### 방법 1: 'allow pasting' 입력 (권장)

1. 콘솔에 경고 메시지가 나타나면
2. 콘솔 입력창에 다음을 입력하고 Enter:
   ```
   allow pasting
   ```
3. 이제 코드를 붙여넣을 수 있습니다.

### 방법 2: 직접 타이핑

경고를 우회하려면 코드를 직접 타이핑할 수도 있습니다 (긴 코드의 경우 비효율적).

### 방법 3: 코드를 여러 줄로 나누기

긴 코드를 여러 줄로 나누어 한 줄씩 붙여넣을 수도 있습니다.

## 보안 경고가 나타나는 이유

브라우저는 악성 코드가 콘솔에 붙여넣어지는 것을 방지하기 위해 이 경고를 표시합니다. 
이는 정상적인 보안 기능입니다.

## 안전한 코드 실행

- 신뢰할 수 있는 출처의 코드만 실행하세요
- 코드를 실행하기 전에 내용을 검토하세요
- 공개 저장소나 공식 문서에서 제공하는 코드는 일반적으로 안전합니다

## 참고

이 가이드의 스크립트들은 모두 GitHub 저장소에서 제공되는 공식 스크립트입니다.

