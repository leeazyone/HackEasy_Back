const { verifyFlag, hmac } = require('../utils/flag')

module.exports = {
  id: 'c5',
  title: '서명은 맞는데, 권한이 왜 바뀌지?',
  difficulty: 'hard',
  points: 500,
  tags: ['jwt', 'auth', 'role', 'token', 'web'],

  story: `
관리자는 “우린 JWT를 쓰니까 안전하다”고 말했다.
토큰에는 서명이 있으니 변조가 불가능하고, 서버는 토큰 안의 role만 보고 권한을 판단한다.
그런데… 정말 payload는 절대 못 바꾸는 걸까?

관리자 전용 기능이 존재하며, 그곳에 FLAG가 숨겨져 있다고 한다.
`.trim(),

  objective: `
JWT를 분석해 관리자 권한(admin)으로 승격하고,
관리자 전용 페이지에서 FLAG를 획득해 제출하라.
`.trim(),

  hint: `
JWT는 암호화가 아니다. payload는 누구나 디코딩할 수 있다.
핵심은 서버가 어떤 알고리즘(alg)을 허용하고, 무엇을 신뢰하는지다.
`.trim(),

  check({ flag }) {
    const answerHmacRaw = process.env.C5_ANSWER_HMAC
    if (!answerHmacRaw) {
      return { ok: false, message: 'Answer not configured' }
    }

    const submitted = String(flag || '').trim()
    const answerHmac = String(answerHmacRaw).trim()

    const ok = verifyFlag(submitted, answerHmac)
    if (!ok) return { ok: false, message: 'Wrong!' }

    return { ok: true, message: 'Correct!' }
  },
}

