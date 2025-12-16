const express = require('express')
const router = express.Router()

const authRequired = require('../middleware/authRequired')
const { verifyFlag } = require('../utils/flag')

// 문제 메타(플랫폼 표시용)
// 여기서는 “플래그 원문” 절대 안 둠
const CHALLENGES = [
  {
    id: 'c1',
    title: '감춰진 안내서',
    difficulty: 'easy',
    points: 100,
    tags: ['web-basic', 'info-leak'],
    story: '훈련용 웹 서버의 설정을 점검하던 중...',
    // 타겟 링크(외부 풀이 사이트)
    targetUrl: 'https://targets.hackeasy.store/c1',
  },
]

// 정답 HMAC 매핑 (플랫폼은 해시만 앎)
const ANSWER_HMAC = {
  c1: process.env.C1_ANSWER_HMAC,
}

// 문제 리스트
router.get('/', (req, res) => {
  const isLoggedIn = !!req.session?.user

  res.json({
    challenges: CHALLENGES.map((ch) => ({
      ...ch,
      accessible: isLoggedIn, // 로그인한 경우만 "제출/상세" 허용 등 UI 판단용
    })),
  })
})

// 플래그 제출 (로그인 필요)
router.post('/:id/submit', authRequired, (req, res) => {
  try {
    const { id } = req.params
    const { flag } = req.body

    const meta = CHALLENGES.find((c) => c.id === id)
    if (!meta) return res.status(404).json({ ok: false, message: 'No such challenge' })

    const answerHmac = ANSWER_HMAC[id]
    if (!answerHmac) {
      return res.status(500).json({ ok: false, message: 'Answer not configured' })
    }

    const ok = verifyFlag(flag, answerHmac)
    if (!ok) return res.json({ ok: false, message: 'Wrong flag' })

    return res.json({ ok: true, message: 'Correct!' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error' })
  }
})

module.exports = router
