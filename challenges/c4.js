// challenges/c4.js
const { verifyFlag, hmac } = require('../utils/flag')

module.exports = {
  id: 'c4',
  title: '지워지지 않는 메모',
  difficulty: 'medium',
  points: 250,
  tags: ['xss', 'stored-xss', 'frontend'],

  // =========================
  // Story
  // =========================
  story: `
팀 내부 공유용 메모 페이지가 운영 서버에 그대로 남아있다.

누군가가 남긴 메모를 열어보는 순간,
페이지가 이상하게 동작한다는 제보가 들어왔다.

메모 기능을 이용해 페이지 안에 숨겨진 FLAG를 찾아라.
`.trim(),

  // =========================
  // Objective
  // =========================
  objective: `
메모 기능의 Stored XSS를 이용해
페이지 내부에 숨겨진 FLAG를 화면에 드러내고 제출하라.
`.trim(),

  // =========================
  // Hint
  // =========================
  hint: `
- 메모는 저장되고, 목록에서 다시 그대로 렌더링된다.
- “저장형(Stored)”이면 한 번 심은 입력이 계속 실행될 수 있다.
- 페이지 안에 숨겨진 요소가 있을 수 있다. (개발자도구 Elements 확인)
`.trim(),

  // =========================
  // ✅ Explanation (맞히면 잠금 해제)
  // =========================
  explanation: {
    concept: `
이 문제는 Stored XSS(저장형 XSS) 취약점이다.

저장형 XSS는 사용자가 입력한 내용이 서버에 “저장”되고,
다른 사람이(혹은 자기 자신이) 페이지를 다시 열 때
그 입력이 HTML로 그대로 출력되면서 스크립트가 실행되는 취약점이다.

이 페이지는 “메모 내용”이 필터링/이스케이프 없이 그대로 표시된다.
그래서 메모에 브라우저가 실행할 수 있는 HTML/스크립트가 포함되면,
메모 목록을 보는 순간 그 코드가 실행될 수 있다.

문제의 목표는 이 실행을 이용해,
페이지 안에 숨겨져 있는 FLAG 값을 읽어
화면(예: alert/페이지 출력)에 표시되게 만드는 것이다.
`.trim(),

    solution: `
1) /c4/ 페이지를 열고, 브라우저 개발자도구(Elements)를 확인한다.
   숨겨진 형태의 FLAG 요소(예: display:none / hidden 클래스)가 존재한다.

2) “메모 저장”을 이용해, 메모가 목록에서 렌더링될 때 실행될 수 있는 입력을 남긴다.
   (저장형 XSS이므로, 저장 후 새로고침/리다이렉트로 목록에 다시 나타나며 실행된다)

3) 실행된 스크립트에서 페이지의 숨겨진 FLAG 요소를 찾아
   그 안의 텍스트 값을 읽어온다.

4) 읽어온 값을 화면에 표시한다.
   (예: 알림창으로 띄우거나, 페이지 어딘가에 출력)

5) 화면에 나온 FLAG를 복사해 제출한다.
`.trim(),
  },

  // =========================
  // Flag Check (HMAC 방식 유지)
  // =========================
  check({ flag }) {
    const answerHmacRaw = process.env.C4_ANSWER_HMAC
    let answerHmac = answerHmacRaw ? String(answerHmacRaw).trim() : ''

    // C4_ANSWER_HMAC이 없으면 C4_FLAG로 HMAC 생성(개발/데모 편의)
    if (!answerHmac) {
      const realFlag = process.env.C4_FLAG
      if (!realFlag) return { ok: false, message: 'Answer not configured' }
      answerHmac = hmac(String(realFlag).trim())
    }

    const submitted = String(flag || '').trim()
    const ok = verifyFlag(submitted, answerHmac)

    if (!ok) return { ok: false, message: 'Wrong!' }
    return { ok: true, message: 'Correct!' }
  },
}

