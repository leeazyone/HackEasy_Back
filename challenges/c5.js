// challenges/c5.js
const { verifyFlag, hmac } = require('../utils/flag')

module.exports = {
  id: 'c5',
  title: '서명은 맞는데, 권한이 왜 바뀌지?',
  difficulty: 'hard',
  points: 500,
  tags: ['jwt', 'auth', 'role', 'token', 'web'],

  // =========================
  // Story
  // =========================
  story: `
내부 Auth Console에서 JWT 토큰을 발급해 각 API를 테스트할 수 있다.

관리자 전용 엔드포인트는 role=admin만 접근 가능하다고 안내되어 있지만,
어떤 사용자는 “서명은 정상인데 권한이 바뀐다”고 주장한다.

토큰이 어떻게 검증되는지 관찰해,
관리자 권한으로 /admin에 접근하고 FLAG를 획득하라.
`.trim(),

  // =========================
  // Objective
  // =========================
  objective: `
JWT 검증의 허점을 이용해 role을 admin으로 만들고,
관리자 엔드포인트(/c5/admin)에서 FLAG를 획득해 제출하라.
`.trim(),

  // =========================
  // Hint
  // =========================
  hint: `
- JWT는 “암호화”가 아니라 “서명”이다. payload는 누구나 읽고 바꿀 수 있다.
- 중요한 건 서버가 “어떤 알고리즘(alg)”과 “어떤 키”를 믿는가이다.
- 페이지에 Public Key를 보여주는 기능이 있다. 그걸 그냥 보여주기만 할까?
`.trim(),

  // =========================
  // ✅ Explanation (맞히면 잠금 해제)
  // =========================
  explanation: {
    concept: `
이 문제는 JWT의 “알고리즘 혼동(alg confusion)” 유형을 다룬다.

JWT는 header.payload.signature 구조이며,
payload(예: role)는 기본적으로 누구나 디코딩해서 볼 수 있고 수정도 가능하다.
중요한 건 “수정한 뒤에도 서버의 서명 검증을 통과할 수 있느냐”이다.

정상적인 구조에서는:
- RS256: 비대칭키(RSA) 서명 (서버는 개인키로 서명, 공개키로 검증)
- HS256: 대칭키(HMAC) 서명 (서명/검증에 같은 secret 사용)

취약한 구현이 생기는 대표 케이스는:
- 서버가 토큰 검증 시 RS256만 허용해야 하는데 HS256도 함께 허용한다.
- 게다가 검증에 쓰는 키(예: 공개키)를 HS256의 secret처럼 사용해버린다.

그러면 공격자는:
1) header의 alg를 HS256으로 바꾸고
2) payload의 role을 admin으로 바꾼 뒤
3) “서버가 secret으로 쓰는 값”으로 HMAC 서명을 만들어

서명 검증을 통과하면서 role=admin 토큰을 만들 수 있다.
`.trim(),

    solution: `
1) 먼저 Login → Token으로 일반 유저 토큰을 발급받는다.

2) 토큰을 디코딩해서 payload에 role 값이 존재하는지 확인한다.
   (JWT는 payload를 쉽게 확인할 수 있다)

3) Public Key 버튼(/public-key)을 눌러 공개키를 확인한다.
   이 문제의 핵심 재료는 “공개키 문자열”이다.

4) 새 JWT를 만든다:
   - header의 alg를 HS256으로 설정
   - payload의 role을 admin으로 변경
   - 그리고 HS256 서명을 만들 때 secret으로 “공개키 문자열”을 사용한다
     (서버가 같은 값을 secret처럼 취급하는 상황을 노린다)

5) 완성된 토큰을 “토큰 입력”에 넣고 /admin 호출을 시도한다.

6) 성공하면 /c5/admin 응답에 FLAG가 포함되어 나온다. 그 값을 제출한다.
`.trim(),
  },

  // =========================
  // Flag Check (HMAC 방식 유지)
  // =========================
  check({ flag }) {
    const answerHmacRaw = process.env.C5_ANSWER_HMAC
    let answerHmac = answerHmacRaw ? String(answerHmacRaw).trim() : ''

    // C5_ANSWER_HMAC이 없으면 C5_FLAG로 HMAC 생성(개발/데모 편의)
    if (!answerHmac) {
      const realFlag = process.env.C5_FLAG
      if (!realFlag) return { ok: false, message: 'Answer not configured' }
      answerHmac = hmac(String(realFlag).trim())
    }

    const submitted = String(flag || '').trim()
    const ok = verifyFlag(submitted, answerHmac)

    if (!ok) return { ok: false, message: 'Wrong!' }
    return { ok: true, message: 'Correct!' }
  },
}

