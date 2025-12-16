const express = require('express')
const router = express.Router()

const authRequired = require('../middleware/authRequired')
const { challengeList, getChallenge } = require('../challenges')

// 문제 목록
router.get('/', (req, res) => {
  const isLoggedIn = !!req.session?.user

  res.json({
    challenges: challengeList.map((ch) => ({
      ...ch,
      accessible: isLoggedIn,
    })),
  })
})

// 플래그 제출
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
