// routes/auth.js
// 회원가입, 로그인, 로그아웃, 마이페이지(/me) 라우트

const express = require('express')
const router = express.Router()

const bcrypt = require('bcrypt')
const pool = require('../config/db')
const authRequired = require('../middleware/authRequired')

// 회원가입
router.post('/signup', async (req, res) => {
  try {
    const { user_id, password, nickname } = req.body

    if (!user_id || !password || !nickname) {
      return res.status(400).json({ msg: '아이디, 비밀번호, 닉네임을 모두 입력하세요' })
    }

    // 비밀번호 정규식 검사
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ msg: '비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.' })
    }

    // 아이디 중복 확인
    const [dup] = await pool.query('SELECT id FROM users WHERE user_id=?', [user_id])
    if (dup.length) {
      return res.status(400).json({ msg: '이미 사용중인 아이디 입니다.' })
    }

    // 비밀번호 암호화
    const rounds = parseInt(process.env.BCRYPT_ROUNDS || '10', 10)
    const hash = await bcrypt.hash(password, rounds)

    // DB 저장
    const [result] = await pool.query(
      'INSERT INTO users (user_id, password_hash, nickname) VALUES (?, ?, ?)',
      [user_id, hash, nickname]
    )

    return res.status(201).json({ msg: '회원가입 성공', id: result.insertId })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ msg: '서버 오류' })
  }
})

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { user_id, password } = req.body

    const [rows] = await pool.query(
      'SELECT id, password_hash, nickname FROM users WHERE user_id=?',
      [user_id]
    )

    if (!rows.length) {
      return res.status(401).json({ msg: '존재하지 않는 아이디입니다.' })
    }

    const user = rows[0]
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) {
      return res.status(401).json({ msg: '비밀번호가 일치하지 않습니다.' })
    }

    // 세션 생성
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ msg: '세션 오류' })

      req.session.user = {
        id: user.id,          // ✅ users.id (숫자 PK)
        user_id,              // ✅ 로그인 아이디(문자)
        nickname: user.nickname,
      }

      return res.json({ user: req.session.user })
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ msg: '서버 오류' })
  }
})

// 로그아웃
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ msg: '세션 오류' })
    res.clearCookie('connect.sid')
    return res.json({ ok: true })
  })
})

// 마이페이지 - 내 프로필 + 통계(푼 문제 수 / 총점)
router.get('/me', authRequired, async (req, res) => {
  try {
    const userId = req.session.user?.id
    if (!userId) {
      return res.status(401).json({ msg: '로그인이 필요합니다.' })
    }

    const [rows] = await pool.query(
      'SELECT id, user_id, nickname FROM users WHERE id = ?',
      [userId]
    )

    if (!rows.length) {
      return res.status(404).json({ msg: '사용자를 찾을 수 없습니다.' })
    }

    // ✅ user_solves에서 집계 (문제는 서버 파일에 있어도 OK)
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

    const user = rows[0]
    return res.json({
      user: {
        id: user.id,
        user_id: user.user_id,
        nickname: user.nickname,
      },
      stats,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ msg: '서버 오류' })
  }
})

module.exports = router

