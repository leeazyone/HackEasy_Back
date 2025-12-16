const c1 = require('./c1')

const challengeList = [c1]

function getChallenge(id) {
  return challengeList.find((ch) => ch.id === id)
}

function installChallenges(app) {
  app.locals.challengeList = challengeList.map((ch) => ({
    id: ch.id,
    title: ch.title,
    difficulty: ch.difficulty,
    points: ch.points,
    tags: ch.tags,
    story: ch.story,
    objective: ch.objective,
    hint: ch.hint,
    targetUrl: `https://targets.hackeasy.store/${ch.id}`,
  }))
}

module.exports = {
  challengeList,
  getChallenge,
  installChallenges,
}
