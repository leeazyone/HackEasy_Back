const express = require('express')
const router = express.Router()
const authRequired = require('../middleware/authRequired')

// ⭐ app.locals에서 메타데이터 가져오기
router.get('/', (req, res) => {
  const isLoggedIn = !!req.session?.user
  const list = req.app.locals.challengeList || []

  res.json({
    challenges: list.map((ch) => ({
      ...ch,
      accessible: isLoggedIn,
    })),
  })
})

// 플래그 제출은 기존 로직 그대로
const { getChallenge } = require('../challenges')

router.post('/:id/submit', authRequired, (req, res) => {
  const { id } = req.params
  const { flag } = req.body

  const ch = getChallenge(id)
  if (!ch) {
    return res.status(404).json({ ok: false, message: 'No such challenge' })
  }

  const result = ch.check({ flag })
  return res.json(result)
})

module.exports = router
