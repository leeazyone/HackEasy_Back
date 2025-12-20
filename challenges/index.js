const c1 = require('./c1')
const c2 = require('./c2')
const c3 = require('./c3')
const c4 = require('./c4')
const c5 = require('./c5')
const c6 = require('./c6')

const challengeList = [c1, c2, c3, c4, c5, c6]

function getChallenge(id) {
  return challengeList.find((ch) => {
    const meta = ch.meta || ch
    return meta.id === id
  })
}

/**
 * ✅ 목록용 (해설 없음)
 */
function installChallenges(app) {
  app.locals.challengeList = challengeList.map((ch) => {
    const meta = ch.meta || ch

    return {
      id: meta.id,
      title: meta.title,
      difficulty: meta.difficulty,
      points: meta.points,
      tags: meta.tags,
      story: meta.story,
      objective: meta.objective,
      hint: meta.hint,
      targetUrl: `https://targets.hackeasy.store/${meta.id}`,
    }
  })
}

/**
 * ✅ 단일 문제 상세 (solved면 explanation 포함)
 */
function getChallengeForUser(id, solved = false) {
  const ch = getChallenge(id)
  if (!ch) return null

  const meta = ch.meta || ch

  return {
    id: meta.id,
    title: meta.title,
    difficulty: meta.difficulty,
    points: meta.points,
    tags: meta.tags,
    story: meta.story,
    objective: meta.objective,
    hint: meta.hint,
    targetUrl: `https://targets.hackeasy.store/${meta.id}`,

    // ✅ 맞힌 사람만 해설 받음
    ...(solved && meta.explanation
      ? { explanation: meta.explanation }
      : {}),
  }
}

module.exports = {
  challengeList,
  getChallenge,
  installChallenges,
  getChallengeForUser, // ⭐ 추가
}

