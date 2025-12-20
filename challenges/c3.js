// challenges/c3.js
const { verifyFlag, hmac } = require('../utils/flag')

module.exports = {
  id: 'c3',
  title: '남의 프로필',
  difficulty: 'medium',
  points: 200,
  tags: ['api', 'access-control', 'idor'],

  story: `
워크스페이스 계정의 기본 프로필 정보를 조회하는 서비스가 있다.

로그인만 하면 “내 프로필”은 볼 수 있어야 한다.
그런데 누군가가 내 계정이 아닌 다른 사람의 프로필까지 조회하고 있다는 제보가 들어왔다.

프로필 조회 요청을 분석해, 권한 없이 조회되는 정보 속에서 FLAG를 찾아라.
`.trim(),

  objective: `
프로필 조회 API의 접근제어 결함(IDOR)을 이용해 다른 사용자의 프로필을 조회하고,
특정 사용자 정보에 숨겨진 FLAG를 획득해 제출하라.
`.trim(),

  hint: `
- 로그인은 필요하지만, “내 것인지” 확인이 빠져있을 수 있다.
- 버튼을 눌렀을 때 나가는 요청을 Network에서 확인해봐.
- userId 같은 숫자 파라미터가 보이면 바꿔보자.
`.trim(),

  explanation: {
    concept: `
이 문제는 IDOR(Insecure Direct Object Reference) 기반 접근제어 취약점이다.

IDOR는 “내가 봐도 되는 데이터”만 보여줘야 하는데,
요청에 들어가는 식별자(예: userId)만 바꾸면 다른 사람 데이터가 그대로 나오는 상황을 말한다.

중요 포인트:
- 로그인(인증)은 했어도, “이 데이터에 접근할 권한(인가)”이 별도로 검증되어야 한다.
- 하지만 취약한 서비스는 “로그인했으니 OK”로 생각하고,
  요청 파라미터에 적힌 대상(userId 등)을 그대로 믿어버린다.

그래서 공격자는:
- 프로필을 불러오는 요청을 찾고
- 그 요청의 userId 값을 다른 값으로 바꿔
- 다른 사람의 프로필(특히 특별한 계정)을 열람해 FLAG를 얻는다.
`.trim(),

    solution: `
1) 먼저 로그인해서 “프로필 조회” 기능을 사용할 수 있는 상태로 만든다.

2) “내 프로필 보기” 같은 버튼을 눌러서,
   브라우저 개발자도구(Network 탭)에서 어떤 요청이 나가는지 확인한다.
   보통 /api/profile 같은 API와 함께 userId 파라미터가 붙는다.

3) 그 요청을 다시 보내되, userId 값을 다른 숫자로 바꿔본다.
   (이 문제에서는 특정 userId에 FLAG가 숨겨져 있다)

4) userId=999로 조회했을 때, 프로필 응답에 note 같은 추가 항목으로 FLAG가 포함되어 나온다.

5) 응답에서 FLAG를 찾아 제출한다.
`.trim(),
  },

  check({ flag }) {
    const answerHmacRaw = process.env.C3_ANSWER_HMAC
    let answerHmac = answerHmacRaw ? String(answerHmacRaw).trim() : ''

    if (!answerHmac) {
      const realFlag = process.env.C3_FLAG
      if (!realFlag) return { ok: false, message: 'Answer not configured' }
      answerHmac = hmac(String(realFlag).trim())
    }

    const submitted = String(flag || '').trim()
    const ok = verifyFlag(submitted, answerHmac)

    if (!ok) return { ok: false, message: 'Wrong!' }
    return { ok: true, message: 'Correct!' }
  },
}

