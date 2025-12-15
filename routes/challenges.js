const express = require('express')
const router = express.Router()

const authRequired = require('../middleware/authRequired')
const { challengeList, getChallenge } = require('../challenges')

// 문제 리스트 불러오기
router.get('/', (req, res) => {
  const isLoggedIn = !!req.session?.user

  res.json({
    challenges: challengeList.map((ch) => ({
      ...ch,
      accessible: isLoggedIn, // 로그인한 경우만 문제 접근 가능
    })),
  })
})

// flag 제출 (로그인 필요)
router.post('/:id/submit', authRequired, async (req, res) => {
  try {
    const { id } = req.params
    const { flag } = req.body

    const ch = getChallenge(id)
    if (!ch) return res.status(404).json({ ok: false, message: 'No such challenge' })

    const result = await ch.check({ req, flag })
    return res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, message: 'Server error' })
  }
})

module.exports = router
