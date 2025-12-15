const { hmac, verifyFlag } = require('../utils/flag')

// 1번 문제: robots.txt에 여러 경로가 노출되어 있고,
// 그중 실제로 존재하는 경로에서 flag를 발견하는 문제
// - stateless 구조라 여러 명이 동시에 접속해도 안전함

const meta = {
  id: 'c1',
  title: '감춰진 안내서',
  points: 100,
  tags: ['web-basic', 'info-leak'],
  difficulty: 'easy',
  description: `
[Story]
훈련용 웹 서버의 설정을 점검하던 중, 외부에는 보이지 않아야 할 안내 문서가 존재한다는 제보가 들어왔다.
관리자는 “일반 사용자는 절대 접근할 수 없다”고 말했지만, 서버가 스스로 남긴 흔적이 어딘가에 남아 있는 것 같다.

[Objective]
서버에 숨겨진 경로를 찾아 접근하고, 그 안에 있는 FLAG를 획득해 제출하라.

[Hint]
웹 서버가 “접근하지 말라고 알려주는 파일”이 무엇인지 떠올려봐.
`.trim(),
}


function getAnswerHmac() {
  const flag = process.env.C1_FLAG
  if (!flag) throw new Error('C1_FLAG is missing in .env')
  return hmac(flag)
}

// 실제 플래그가 존재하는 경로
const hiddenPath = process.env.C1_HIDDEN_PATH || '/dev-note'

function install(app) {
  // robots.txt: 여러 개의 의심스러운 경로 제공
  app.get('/robots.txt', (req, res) => {
    res.type('text/plain').send(
`User-agent: *
Disallow: /admin
Disallow: /internal
Disallow: /dev-note
Disallow: /backup
# TODO: clean up before deployment
`
    )
  })

  // 실제로 존재하는 숨겨진 페이지 (플래그 노출)
  app.get(hiddenPath, (req, res) => {
    const flag = process.env.C1_FLAG
    res
      .type('text/plain')
      .send(`You found it!\nflag: ${flag}\n`)
  })
}

async function check({ flag }) {
  const ok = verifyFlag(flag, getAnswerHmac())

  if (ok) {
    return {
      ok: true,
      message: 'Correct!',
      award: meta.points,
    }
  }

  return {
    ok: false,
    message: 'Wrong flag.',
  }
}

module.exports = {
  meta,
  install,
  check,
}
