const c1 = require('./c1_hidden_path')

// 문제를 추가할 때는 여기 배열/맵에만 추가하면 됨
const challenges = [c1]

const challengeList = challenges.map((c) => c.meta)

const challengeMap = challenges.reduce((acc, c) => {
  acc[c.meta.id] = c
  return acc
}, {})

function getChallenge(id) {
  return challengeMap[id]
}

function installChallenges(app) {
  challenges.forEach((c) => {
    if (typeof c.install === 'function') c.install(app)
  })
}

module.exports = {
  challengeList,
  getChallenge,
  installChallenges,
}
