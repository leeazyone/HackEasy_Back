//회원가입, 로그인, 로그아웃 라우트
const express = require('express')
const router = express.Router()

const bcrypt = require('bcrypt')
const pool = require('../config/db')
const authRequired = require('../middleware/authRequired')

//회원가입
router.post('/signup', async(req, res)=>{
  try{
    // 아이디, 비밀번호, 닉네임 받기
    const {user_id, password, nickname} = req.body
    if (!user_id || !password || !nickname)
      return res.status(400).json({msg:'아이디, 비밀번호, 닉네임을 모두 입력하세요'})
    
    //비밀번호 정규식 검사
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)){
      return res.status(400).json({msg:'비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.'})
    }

    //아이디 중복 확인
    const [dup] = await pool.query('SELECT id FROM users WHERE user_id=?', [user_id])
    if (dup.length) {  //DB의 길이가 0이 아니라면 true
      return res.status(400).json({msg:'이미 사용중인 아이디 입니다.'})
    }

    //비밀번호 암호화
    const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) //라운드 횟수
    const hash = await bcrypt.hash(password, rounds) //비밀번호 암호화

    //DB에 회원정보 저장
    const [result] = await pool.query('INSERT INTO users (user_id, password_hash, nickname) VALUES (?, ?, ?)',[user_id, hash, nickname])
    res.status(201).json({msg: '회원가입 성공', id:result.insertId})

  } catch(err){
    console.error(err)
    res.status(500).json({msg:"서버 오류"})
  }
})

//로그인
router.post('/login', async(req, res)=>{
  try{
    //아이디, 비밀번호 검증
    const {user_id, password} = req.body
    const [rows] = await pool.query('SELECT id, password_hash, nickname FROM users WHERE user_id=?',[user_id])
    
    //아이디 존재 확인
    if (!rows.length)
      return res.status(401).json({msg: "존재하지 않는 아이디입니다."})
    
    //비밀번호 대조
    const user =rows[0] 
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok)
      return res.status(401).json({msg: "비밀번호가 일치하지 않습니다."})

    //세션 생성
    req.session.regenerate(err=>{
      if (err)
        return res.status(500).json({msg:"세션 오류"})
      req.session.user = {id:user.id, user_id, nickname: user.nickname}
      res.json({user:req.session.user})
    })


  }catch(err){
    console.error(err)
    res.status(500).json({msg:"서버 오류"})
  }
})

//로그아웃
router.post('/logout', (req, res)=>{
  req.session.destroy(err=>{
    if(err)return res.status(500).json({msg:"세션 오류"})
    res.clearCookie('connect.sid')
    res.json({ok:true})
  })
})

// 마이페이지 - 내 프로필 조회
router.get('/me', authRequired, async (req, res) => {
  try {
    const userId = req.session.user?.id

    if (!userId) {
      return res.status(401).json({ msg: "로그인이 필요합니다." })
    }

    const [rows] = await pool.query(
      'SELECT id, user_id, nickname FROM users WHERE id = ?',
      [userId]
    )

    if (!rows.length) {
      return res.status(404).json({ msg: "사용자를 찾을 수 없습니다." })
    }

    const user = rows[0]


// 푼 문제/점수 통계: 지금은 DB 테이블이 없을 수 있어서 기본값으로 내려줌
// (나중에 user_solved / challenges 테이블 붙이면 여기만 다시 활성화하면 됨)
const stats = { solvedCount: 0, totalScore: 0 }

/**  🔽🔽🔽   푼 문제/점수 통계(추후)   🔽🔽🔽
>>>>>>> bf993bc (c1 make)

// 푼 문제/점수 통계
const [statRows] = await pool.query(
  `
  SELECT 
    COUNT(us.id) AS solvedCount,
    COALESCE(SUM(c.score), 0) AS totalScore
  FROM user_solved us
  JOIN challenges c ON us.challenge_id = c.id
  WHERE us.user_id = ?
  `,
  [userId]
)

const stats = statRows[0] || { solvedCount: 0, totalScore: 0 }

🔼🔼🔼  여기까지 주석  🔼🔼🔼 **/
    res.json({
      user: {
        id: user.id,
        user_id: user.user_id,
        nickname: user.nickname,
      },
      stats,   // 👈 프론트에서 stats.solvedCount / stats.totalScore 사용
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: "서버 오류" })
  }
})

module.exports = router

