//express-session 설정
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)

const store= new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
})

<<<<<<< HEAD
const isProd = process.env.NODE_ENV === 'production'

module.exports = session({
  secret: process.env.SESS_SECRET,
  resave: false,
  saveUninitialized: false,
  store,
  cookie: {
    httpOnly: true,                     // JS에서 쿠키 직접 못 건드리게
    maxAge: 1000 * 60 * 60 * 24,        // 1일 (원하면 조절)
    secure: isProd,                     // 배포(HTTPS)에서만 true
    sameSite: isProd ? 'none' : 'lax',  // 배포에서 cross-site 허용
  },
})
=======
module.exports = session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
})

>>>>>>> bf993bc (c1 make)
