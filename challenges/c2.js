const { verifyFlag, hmac } = require('../utils/flag')

module.exports = {
  id: 'c2',
  title: '유령 관리자 계정',
  difficulty: 'easy',
  points: 120,
  tags: ['web-basic', 'auth', 'logic-bug'],

  // ✅ 문제 설명 메타데이터 (플랫폼 설명 페이지에만 표시)
  story: `
사내 교육용으로 만든 “임시 로그인 테스트 페이지”가 운영 서버에 그대로 남아있다.

개발자는 “비밀번호 검증은 나중에 붙이면 된다”고 말하며,
특정 조건에서는 그냥 통과하도록 급히 코드를 짰다.

점검 중 이 시스템이 이상하게도 관리자 메뉴로 들어가는 사람이 있다는 보고가 들어왔다.
정상 로그인 없이 관리자 페이지에 들어갈 수 있는지 확인하라.
`.trim(),

  objective: `
약한 로그인 로직을 이용해 관리자 권한으로 관리자 페이지에 접근하고,
그 안에 있는 FLAG를 획득해 제출하라.
`.trim(),

  hint: `
이건 DB 문제가 아니다.
“로그인 성공”을 결정하는 조건이 완전한 검증인지 의심해봐.
입력값 중 어떤 요소가 인증 분기에 영향을 주는지 관찰해봐.
`.trim(),

  // ✅ 플래그 검증 로직 (HMAC)
  check({ flag }) {
    const answerHmacRaw = process.env.C2_ANSWER_HMAC
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
