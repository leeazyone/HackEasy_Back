const crypto = require('crypto')

function hmac(text) {
  const secret = process.env.FLAG_SECRET
  if (!secret) throw new Error('FLAG_SECRET is missing in .env')
  return crypto.createHmac('sha256', secret).update(String(text)).digest('hex')
}

function verifyFlag(submitted, answerHmac) {
  if (!submitted || !answerHmac) return false
  const s = String(submitted).trim()
  const computed = hmac(s)
  try {
    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(answerHmac))
  } catch {
    return false
  }
}

module.exports = { hmac, verifyFlag }
