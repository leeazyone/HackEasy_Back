//express-session 설정
const session = require('express-session')
const MySQLStore = require('express-mysql-session')(session)

const store= new MySQLStore({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
})

module.exports = session({
    secret: process.env.SESS_SECRET,
    resave: false,
    saveUninitialized: false,
    store,
})

