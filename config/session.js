// express-session 설정
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)

const store = new MySQLStore({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
})

const isProd = process.env.NODE_ENV === 'production'

module.exports = session({
  secret: process.env.SESS_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,                     // JS에서 쿠키 접근 차단
    maxAge: 1000 * 60 * 60 * 24,        // 1일
    secure: isProd,                     // production(HTTPS)에서만 true
    sameSite: isProd ? 'none' : 'lax',  // 프론트/백 분리 시 필수
  },
})