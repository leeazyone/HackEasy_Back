const { verifyFlag, hmac } = require('../utils/flag')

module.exports = {
  id: 'c1',
  title: '감춰진 안내서',
  difficulty: 'easy',
  points: 100,
  tags: ['web-basic', 'info-leak'],

  // =========================
  // Story
  // =========================
  story: `
훈련용 웹 서버의 설정을 점검하던 중, 외부에는 보이지 않아야 할 안내 문서가 존재한다는 제보가 들어왔다.

관리자는 “일반 사용자는 절대 접근할 수 없다”고 말했지만,
서버가 스스로 남긴 흔적이 어딘가에 남아 있는 것 같다.
`.trim(),

  // =========================
  // Objective
  // =========================
  objective: `
서버에 숨겨진 경로를 찾아 접근하고,
그 안에 있는 FLAG를 획득해 제출하라.
`.trim(),

  // =========================
  // Hint
  // =========================
  hint: `
웹 서버가 “접근하지 말라고 알려주는 파일”이 무엇인지 떠올려봐.
`.trim(),

  // =========================
  // ✅ Explanation (맞히면 잠금 해제)
  // =========================
  explanation: {
    concept: `
robots.txt는 검색엔진 크롤러에게
“이 경로는 크롤링하지 말라”고 알려주기 위한 안내 파일이다.

하지만 robots.txt는 접근을 차단하는 보안 기능이 아니며,
오히려 숨기고 싶은 경로를 그대로 노출하는
정보 노출(Information Leakage)의 원인이 될 수 있다.

즉, robots.txt에 적힌 경로는
“접근 금지”가 아니라 “힌트”가 된다.
`.trim(),

    solution: `
1) 웹 서버의 robots.txt 파일에 접근한다.
   (예: /robots.txt 또는 /c1/robots.txt)

2) Disallow 항목에서 숨겨진 경로를 확인한다.

3) 해당 경로로 직접 접속한다.

4) 페이지에 표시된 FLAG를 복사해
   문제 제출란에 입력한다.
`.trim(),
  },

  // =========================
  // Flag Check (HMAC 방식 유지)
  // =========================
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

