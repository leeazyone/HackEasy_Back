// challenges/c6.js
const { verifyFlag, hmac } = require('../utils/flag')

module.exports = {
  id: 'c6',
  title: '파일은 죄가 없다',
  difficulty: 'hard',
  points: 550,
  tags: ['web', 'path-traversal', 'filesystem'],

  // =========================
  // Story
  // =========================
  story: `
내부 문서를 읽기 위한 “훈련용 파일 뷰어”가 배포되어 있다.

운영팀은 “훈련용 디렉토리 안의 파일만 읽을 수 있다”고 말하지만,
사용자 입력으로 파일 경로를 받는 방식이 불안해 보인다.

이 파일 뷰어를 분석해 숨겨진 FLAG 파일을 찾아라.
`.trim(),

  // =========================
  // Objective
  // =========================
  objective: `
파일 읽기 API에서 경로 처리 결함을 이용해
훈련용 디렉토리 내부의 숨겨진 flag 파일을 찾아 읽고,
FLAG를 획득해 제출하라.
`.trim(),

  // =========================
  // Hint
  // =========================
  hint: `
- 파일명만 받는다고 해도, 사실상 “경로”를 받는 것과 같다.
- 단순 차단(특정 문자열 제거)은 변형/우회에 약하다.
- 성공 조건은 “훈련용 디렉토리 내부의 다른 파일”을 찾아 읽는 것이다.
`.trim(),

  // =========================
  // ✅ Explanation (맞히면 잠금 해제)
  // =========================
  explanation: {
    concept: `
이 문제는 Path Traversal(경로 조작) 유형을 다룬다.

서버가 “file=...” 같은 입력을 받아 파일을 읽어줄 때,
사용자는 단순 파일명뿐 아니라 하위 폴더 경로까지 시도할 수 있다.
예를 들어 docs/readme.txt 같은 형태가 가능해지면,
입력은 사실상 “경로(Path)”가 된다.

여기서 흔한 실수는,
특정 패턴(예: ../)만 대충 막아놓고 “안전해졌다”고 생각하는 것이다.
하지만 경로는 여러 방식으로 표현될 수 있고,
브라우저/서버/라이브러리의 디코딩/정규화 과정에 따라
같은 의미를 다른 문자열로 만들 수 있다.

이 문제는 “시스템 파일로 탈출”이 목표가 아니라,
훈련용 디렉토리(샌드박스) 안에서
숨겨진 파일(flag.txt)을 찾아 읽는 것이 목표다.
`.trim(),

    solution: `
1) 페이지에서 제공하는 API 형식을 확인한다.
   예: GET /c6/api/read?file=...

2) 먼저 public.txt, note.txt, docs/readme.txt처럼
   정상적으로 읽히는 입력을 통해 “파일 경로가 어떻게 동작하는지” 감을 잡는다.
   (출력되는 file/content를 보면 힌트가 생긴다)

3) 목표는 샌드박스 내부의 flag 파일을 읽는 것이다.
   따라서 file 파라미터에 flag.txt(또는 비슷한 파일명)를 시도한다.

4) 단순히 막히면, 경로를 표현하는 방식을 바꿔가며 시도한다.
   - 슬래시/중복 슬래시
   - 점(.)을 섞은 경로 표현
   - URL 인코딩된 형태로 전달되는지 여부(브라우저가 자동 인코딩하는지 포함)
   핵심은 “같은 의미의 경로”를 다른 문자열로 만들어,
   서버의 단순 필터를 피하는 것이다.

5) 응답 content에 FLAG가 포함된 파일을 찾으면,
   그 내용을 복사해 제출한다.
`.trim(),
  },

  // =========================
  // Flag Check (HMAC 방식 유지)
  // =========================
  check({ flag }) {
    const answerHmacRaw = process.env.C6_ANSWER_HMAC
    let answerHmac = answerHmacRaw ? String(answerHmacRaw).trim() : ''

    // C6_ANSWER_HMAC이 없으면 C6_FLAG로 HMAC 생성(개발/데모 편의)
    if (!answerHmac) {
      const realFlag = process.env.C6_FLAG
      if (!realFlag) return { ok: false, message: 'Answer not configured' }
      answerHmac = hmac(String(realFlag).trim())
    }

    const submitted = String(flag || '').trim()
    const ok = verifyFlag(submitted, answerHmac)

    if (!ok) return { ok: false, message: 'Wrong!' }
    return { ok: true, message: 'Correct!' }
  },
}

