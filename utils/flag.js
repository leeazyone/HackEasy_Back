const crypto = require('crypto')

function hmac(text) {
  const secret = process.env.FLAG_SECRET
  if (!secret) throw new Error('FLAG_SECRET is missing in .env')
  return crypto.createHmac('sha256', secret).update(String(text), 'utf8').digest('hex')
}

function verifyFlag(submitted, answerHmac) {
  if (!submitted || !answerHmac) return false

  const s = String(submitted).trim()
  const expected = String(answerHmac).trim()

  const computed = hmac(s)

  // 둘 다 hex(64글자)여야 정상
  if (computed.length !== expected.length) return false

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, 'hex'),
      Buffer.from(expected, 'hex')
    )
  } catch {
    return false
  }
}

module.exports = { hmac, verifyFlag }
