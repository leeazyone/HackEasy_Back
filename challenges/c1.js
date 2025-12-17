const { verifyFlag, hmac } = require('../utils/flag')

module.exports = {
  id: 'c1',
  title: '감춰진 안내서',
  difficulty: 'easy',
  points: 100,
  tags: ['web-basic', 'info-leak'],

  // ✅ 문제 설명 메타데이터
  story: `
훈련용 웹 서버의 설정을 점검하던 중, 외부에는 보이지 않아야 할 안내 문서가 존재한다는 제보가 들어왔다.

관리자는 “일반 사용자는 절대 접근할 수 없다”고 말했지만, 서버가 스스로 남긴 흔적이 어딘가에 남아 있는 것 같다.
`.trim(),

  objective: `
서버에 숨겨진 경로를 찾아 접근하고,
그 안에 있는 FLAG를 획득해 제출하라.
`.trim(),

  hint: `
웹 서버가 “접근하지 말라고 알려주는 파일”이 무엇인지 떠올려봐.
`.trim(),

  // ✅ 플래그 검증 로직 (HMAC)
  check({ flag }) {
    const answerHmacRaw = process.env.C1_ANSWER_HMAC
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

