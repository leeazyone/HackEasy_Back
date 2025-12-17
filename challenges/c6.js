const { verifyFlag, hmac } = require('../utils/flag')

module.exports = {
  id: 'c6',
  title: '파일은 죄가 없다',
  difficulty: 'hard',
  points: 550,
  tags: ['web', 'path-traversal', 'filesystem'],

  story: `
훈련용으로 만든 파일 읽기 API가 운영 환경에 남아 있다.
개발자는 “훈련용 디렉토리만 읽을 수 있다”고 말하지만,
입력값으로 파일 경로를 구성하는 방식이 수상하다.
`.trim(),

  objective: `
파일 경로를 조작해 보호된 파일에서 FLAG를 획득하고 제출하라.
(실제 시스템 파일 접근은 금지 — 훈련용 디렉토리 범위 내에서만)
`.trim(),

  hint: `
서버는 사용자 입력을 그대로 경로에 붙인다.
../ 같은 패턴을 “어떻게” 막고 있는지, 그리고 우회가 가능한지 생각해봐.
`.trim(),

  check({ flag }) {
    const answerHmacRaw = process.env.C6_ANSWER_HMAC
    if (!answerHmacRaw) return { ok: false, message: 'Answer not configured' }

    const submitted = String(flag || '').trim()
    const answerHmac = String(answerHmacRaw).trim()

    const ok = verifyFlag(submitted, answerHmac)
    if (!ok) return { ok: false, message: 'Wrong!' }
    return { ok: true, message: 'Correct!' }
  },
}

