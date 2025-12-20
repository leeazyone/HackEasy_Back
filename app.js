// app.js
require('dotenv').config()

const express = require('express')
const cookieParser = require('cookie-parser')

const authRouter = require('./routes/auth')
const session = require('./config/session')
const challengesRouter = require('./routes/challenges')
const { installChallenges } = require('./challenges')

const app = express()

// ✅ CORS는 Nginx에서만 처리 (중복 헤더 방지)
// ✅ Express에서는 cors 미들웨어 사용하지 않음

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 프록시(Nginx) 뒤에서 세션/쿠키 안정적으로 쓰기
app.set('trust proxy', 1)
app.use(session)

// 라우터
app.use('/auth', authRouter)
app.use('/api/challenges', challengesRouter)

// 문제 메타 설치
installChallenges(app)

app.get('/', (req, res) => {
  res.send('HackEasy server running')
})

const port = parseInt(process.env.PORT || '3000', 10)
app.listen(port, () => console.log(`Server running on ${port}`))

