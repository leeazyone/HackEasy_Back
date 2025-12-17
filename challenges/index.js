const c1 = require('./c1')
const c2 = require('./c2')
const c3 = require('./c3')
const c4 = require('./c4')
const c5 = require('./c5')
const c6 = require('./c6')

const challengeList = [c1, c2, c3, c4, c5, c6]

/**
 * ✅ id로 문제 하나 찾기
 * - meta로 감싸진 구조 / 아닌 구조 모두 대응
 */
function getChallenge(id) {
  return challengeList.find((ch) => {
    const meta = ch.meta || ch
    return meta.id === id
  })
}

/**
 * ✅ 프론트에 내려줄 문제 목록 설치
 * - 기존 프론트 구조 그대로 유지
 * - undefined 방지
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

module.exports = {
  challengeList,
  getChallenge,
  installChallenges,
}

