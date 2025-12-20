// routes/challenges.js
const express = require('express')
const router = express.Router()

const authRequired = require('../middleware/authRequired')
const pool = require('../config/db')
const { getChallenge } = require('../challenges')

// ✅ 공통: 목록에서 해설 제거
function sanitizeChallengeForList(ch, extra = {}) {
  const { explanation, ...rest } = ch
  return { ...rest, ...extra }
}

// ✅ 공통: 특정 유저가 이 문제를 풀었는지
async function isSolved(userId, challengeKey) {
  if (!userId) return false
  const [rows] = await pool.query(
    'SELECT 1 FROM user_solves WHERE user_id = ? AND challenge_key = ? LIMIT 1',
    [userId, challengeKey]
  )
  return rows.length > 0
}

// ✅ 목록: solved 표시만 내려줌 (해설 X)
router.get('/', async (req, res) => {
  try {
    const userId = req.session?.user?.id || null
    const list = req.app.locals.challengeList || []

    // 로그인 유저면 solved 목록을 한번에 가져오기
    let solvedSet = new Set()
    if (userId) {
      const [solvedRows] = await pool.query(
        'SELECT challenge_key FROM user_solves WHERE user_id = ?',
        [userId]
      )
      solvedSet = new Set(solvedRows.map((r) => String(r.challenge_key)))
    }

    const challenges = list.map((ch) => {
      const solved = userId ? solvedSet.has(String(ch.id)) : false
      return sanitizeChallengeForList(ch, {
        accessible: !!userId,
        solved,
      })
    })

    return res.json({ challenges })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error' })
  }
})

// ✅ 상세: 푼 사람만 explanation 포함
router.get('/:id', authRequired, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.session.user.id

    const ch = getChallenge(id)
    if (!ch) return res.status(404).json({ ok: false, message: 'No such challenge' })

    const solved = await isSolved(userId, id)

    if (!solved) {
      // 아직 안 풀었으면 해설 제거
      const { explanation, ...rest } = ch
      return res.json({ challenge: { ...rest, solved } })
    }

    // 풀었으면 해설 포함
    return res.json({ challenge: { ...ch, solved } })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error' })
  }
})

// ✅ 제출: 정답이면 DB 기록 + 해설/solved 반환
router.post('/:id/submit', authRequired, async (req, res) => {
  const { id } = req.params
  const { flag } = req.body

  const ch = getChallenge(id)
  if (!ch) return res.status(404).json({ ok: false, message: 'No such challenge' })

  const result = ch.check({ flag })
  if (!result?.ok) return res.json(result)

  const userId = req.session.user.id
  const points = Number(ch.points ?? 0)

  try {
    const [ins] = await pool.query(
      'INSERT IGNORE INTO user_solves (user_id, challenge_key, points_awarded) VALUES (?, ?, ?)',
      [userId, id, points]
    )

    const alreadySolved = ins.affectedRows === 0

    // stats도 같이 내려주면 프론트 즉시 갱신 가능
    const [statRows] = await pool.query(
      `
      SELECT
        COUNT(*) AS solvedCount,
        COALESCE(SUM(points_awarded), 0) AS totalScore
      FROM user_solves
      WHERE user_id = ?
      `,
      [userId]
    )

    const stats = {
      solvedCount: Number(statRows[0]?.solvedCount || 0),
      totalScore: Number(statRows[0]?.totalScore || 0),
    }

    return res.json({
      ...result,
      alreadySolved,
      pointsAwarded: alreadySolved ? 0 : points,
      solved: true,
      stats,
      explanation: ch.explanation || null, // ✅ 정답이면 여기서 바로 해설 줌
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ ok: false, message: 'Server error' })
  }
})

module.exports = router

