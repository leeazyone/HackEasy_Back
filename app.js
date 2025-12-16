//서버 진입점
require('dotenv').config()
const express = require('express')
const cors =require('cors')
const authRouter = require('./routes/auth')
const session = require('./config/session') //세션 설정파일
const cookieParser = require('cookie-parser')
const challengesRouter = require('./routes/challenges')
const { installChallenges } = require('./challenges')

const app = express()

//CORS 설정
const allowedOrigins = [
  'http://localhost:5173',                 // 로컬 개발용
  'https://hack-easy-front.vercel.app',    // Vercel 프론트
  'http://hackeasy.store',
  'https://hackeasy.store',
  'https://www.hackeasy.store',
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(cookieParser())
app.use(express.json()) //json 바디 파서
app.use(express.urlencoded({ extended: true }));//폼 파서
app.set('trust proxy', 1);
app.use(session) // 세션 미들웨어, session.js 설정을 서버에 적용

//인증 라우터
app.use('/auth', authRouter)

// CTF 문제 목록/제출 API
app.use('/api/challenges', challengesRouter)

installChallenges(app)


app.get('/',(req,res)=>{
  res.send('HackEasy server running')
})

const port = parseInt(process.env.PORT || '3000', 10)
app.listen(port,()=> console.log(`Server running on ${port}`))