const { verifyFlag, hmac } = require('../utils/flag')

module.exports = {
  id: 'c3',
  title: '남의 프로필',
  difficulty: 'medium',
  points: 200,
  tags: ['api', 'access-control', 'idor'],

  story: `
로그인한 사용자에게만 제공되는 프로필 API가 있다.
하지만 이 API는 요청한 리소스의 “소유자 검증”을 하지 않는다는 제보가 들어왔다.

누군가 userId 값만 바꿔 다른 사람의 프로필을 조회하고 있으며,
특정 계정에는 민감한 정보가 포함되어 있다고 한다.
`.trim(),

  objective: `
로그인 후 프로필 API 요청에서 userId 값을 변경해
허용되지 않은 사용자 리소스에 접근하라.

특정 userId에 포함된 FLAG를 획득해 제출하라.
`.trim(),

  hint: `
인증(Authentication)과 권한(Authorization)은 다르다.
로그인되어 있어도 “내 데이터”만 접근 가능해야 한다.
요청 파라미터의 식별자(userId)를 관찰해봐.
`.trim(),

  check({ flag }) {
    const answerHmacRaw = process.env.C3_ANSWER_HMAC
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

