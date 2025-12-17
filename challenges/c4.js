const { verifyFlag } = require('../utils/flag')

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
사내 테스트용으로 만든 메모(방명록) 페이지가 아직 운영 서버에 남아 있다.

사용자가 남긴 메모는 저장된 뒤, 다음 방문자에게 그대로 표시되는 단순한 구조다.
개발자는 “스크립트는 입력 안 하겠지”라고 생각했고,
출력 시 별도의 처리를 하지 않았다.

최근 이 메모 페이지에서 의도치 않은 동작이 발생한다는 보고가 들어왔다.
페이지 어딘가에는 FLAG가 숨겨져 있다고 한다.
`.trim(),

  // =========================
  // Objective
  // =========================
  objective: `
메모 기능에 스크립트가 실행되는 입력을 저장하고,
페이지가 다시 렌더링될 때 발생하는 동작을 이용해
숨겨진 FLAG를 획득하라.
`.trim(),

  // =========================
  // Hint
  // =========================
  hint: `
입력값은 저장된 뒤 다시 렌더링된다.
XSS는 서버가 아니라 브라우저에서 발생한다.
출력 시 HTML이 그대로 실행되는지 관찰해봐.
`.trim(),

  // =========================
  // Flag Check (HMAC)
  // =========================
  check({ flag }) {
    const answerHmacRaw = process.env.C4_ANSWER_HMAC
    if (!answerHmacRaw) {
      return { ok: false, message: 'Answer not configured' }
    }

    const submitted = String(flag || '').trim()
    const answerHmac = String(answerHmacRaw).trim()

    const ok = verifyFlag(submitted, answerHmac)

    if (!ok) {
      return { ok: false, message: 'Wrong!' }
    }

    return { ok: true, message: 'Correct!' }
  },
}

