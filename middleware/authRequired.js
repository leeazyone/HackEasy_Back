//authRequired.js
// 로그인 여부 확인 미들웨어
function authRequired(req, res, next) {
  // 세션에 user가 없으면 401
  if (!req.session?.user) {
    return res.status(401).json({ msg: "승인되지 않은 접근" })
  }

  // 통과 시 다음 미들웨어/라우터로 진행
  next()
}

module.exports = authRequired