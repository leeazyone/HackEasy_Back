//회원가입, 로그인, 로그아웃 라우트
const express = require('express')
const router = express.Router()

const bcrypt = require('bcrypt')
const pool = require('../config/db')


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

module.exports = router

