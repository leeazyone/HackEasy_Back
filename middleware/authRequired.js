//로그인 여부 확인 미들웨어
function authRequired(req,res,next){
    if (!req.session?.user)
    return res.status(401).json({msg:"승인되지 않은 접근"})
}

module.exports = authRequired