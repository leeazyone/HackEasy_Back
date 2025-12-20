// challenges/c2.js
const { verifyFlag, hmac } = require('../utils/flag')

module.exports = {
  id: 'c2',
  title: '유령 관리자 계정',
  difficulty: 'easy',
  points: 120,
  tags: ['web-basic', 'auth', 'logic-bug'],

  story: `
사내 교육용으로 만든 “임시 로그인 테스트 페이지”가 아직 운영 서버에 남아있다.

개발자는 “비밀번호 검증은 나중에 붙이면 된다”고 말하며, 특정 조건에서는 그냥 통과하도록 급히 코드를 짰다.
점검 중 이 시스템이 이상하게도 관리자 메뉴로 들어가는 사람이 있다는 보고가 들어왔다.

정상 로그인 없이 관리자 페이지에 들어갈 수 있는지 확인하고, 그 안에 남아 있는 FLAG를 찾아라.
`.trim(),

  objective: `
약한 로그인 로직을 이용해 관리자 권한으로 관리자 페이지에 접근하고 FLAG를 획득하라.
`.trim(),

  hint: `
- 이건 DB 문제가 아니다.
- “로그인 성공”을 결정하는 조건이 완전한 검증인지 의심해봐.
- 입력값 중 어떤 요소가 인증 분기에 영향을 주는지 관찰해봐.
`.trim(),

  explanation: {
    concept: `
이 문제는 “논리 취약점(Broken Authentication Logic)”이다.

정상적인 로그인은 보통 “아이디 + 비밀번호가 모두 정확”해야만 성공한다.
하지만 현실에서는 개발 중 임시 로직/예외처리 때문에,
특정 입력(예: 특정 단어 포함)만으로 로그인이 성공해버리는 경우가 생긴다.

이런 취약점의 특징은:
- SQL Injection 같은 DB 공격이 없어도 인증이 우회된다.
- 비밀번호를 몰라도 “로그인 성공 조건”을 만족시키면 관리자 화면에 들어갈 수 있다.

즉, 핵심은 “비밀번호를 맞추는 것”이 아니라
“로그인 성공으로 처리되는 입력 조건”을 찾아내는 것이다.
`.trim(),

    solution: `
1) 로그인 폼을 그대로 시도하면서, 어떤 입력에서 성공/실패가 갈리는지 관찰한다.
   (특히 Username 값이 인증 분기에 영향을 주는지 확인)

2) Username에 'admin'이 포함되도록 입력해본다.
   예: admin, Admin, testadmin123, ghost_admin (대소문자도 시도)

3) Password는 아무 값으로 넣고 로그인 시도한다.

4) 로그인 성공 메시지/리다이렉트가 발생하면 관리자 페이지로 진입한다.

5) 관리자 페이지에 표시된 FLAG를 복사해 제출한다.
`.trim(),
  },

  check({ flag }) {
    const answerHmacRaw = process.env.C2_ANSWER_HMAC
    let answerHmac = answerHmacRaw ? String(answerHmacRaw).trim() : ''

    if (!answerHmac) {
      const realFlag = process.env.C2_FLAG
      if (!realFlag) return { ok: false, message: 'Answer not configured' }
      answerHmac = hmac(String(realFlag).trim())
    }

    const submitted = String(flag || '').trim()
    const ok = verifyFlag(submitted, answerHmac)

    if (!ok) return { ok: false, message: 'Wrong!' }
    return { ok: true, message: 'Correct!' }
  },
}

