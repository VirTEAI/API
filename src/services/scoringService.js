const test10Config = {
  positive: new Set([1, 5, 7, 10]),
  negative: new Set([2, 3, 4, 6, 8, 9]),
};

const test50Config = {
  agree: new Set([2, 4, 5, 6, 7, 9, 12, 13, 16, 18, 19, 20, 21, 22, 23, 26, 33, 35, 39, 41, 42, 43, 45, 46]),
  disagree: new Set([1, 3, 8, 10, 11, 14, 15, 17, 24, 25, 27, 28, 29, 30, 31, 32, 34, 36, 37, 38, 40, 44, 47, 48, 49, 50]),
};

function scoreTest10(answers) {

  let score = 0;

  for (const [q, answer] of Object.entries(answers)) {

    const question = Number(q);

    if (test10Config.positive.has(question)) {

      if (answer === "strongly_agree" || answer === "agree") score++;
    }

    if (test10Config.negative.has(question)) {

      if (answer === "strongly_disagree" || answer === "disagree") score++;
    }
  }

  return score;
}

function scoreTest50(answers) {

  let score = 0;

  for (const [q, answer] of Object.entries(answers)) {

    const question = Number(q);

    if (test50Config.agree.has(question)) {

      if (answer === "strongly_agree" || answer === "agree") score++;
    }

    if (test50Config.disagree.has(question)) {
        
      if (answer === "strongly_disagree" || answer === "disagree") score++;
    }
  }

  return score;
}

module.exports = {
  scoreTest10,
  scoreTest50,
};