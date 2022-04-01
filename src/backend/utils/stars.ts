export function getStarSymbols(numstars) {
  let stars = "★★☆☆☆";
  switch (numstars) {
    case 0:
      stars = "☆☆☆☆☆";
      break;
    case 1:
      stars = "★☆☆☆☆";
      break;
    case 2:
      stars = "★★☆☆☆";
      break;
    case 3:
      stars = "★★★☆☆";
      break;
    case 4:
      stars = "★★★★☆";
      break;
    case 5:
      stars = "★★★★★";
      break;
    default:
      stars = "★★☆☆☆";
  }
  return stars;
}

let average = (array) => array.reduce((a, b) => a + b, 0) / array.length;

function calculateStarsAstralCodexTen(data) {
  let nuno = (data) => 3;
  let eli = (data) => null;
  let misha = (data) => null;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsBetfair(data) {
  let nuno = (data) => (data.volume > 10000 ? 4 : data.volume > 1000 ? 3 : 2);
  let eli = (data) => (data.volume > 10000 ? null : null);
  let misha = (data) => null;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  // Substract 1 star if probability is above 90% or below 10%
  if (
    data.option &&
    (data.option.probability < 0.1 || data.option.probability > 0.9)
  ) {
    starsDecimal = starsDecimal - 1;
  }

  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsCoupCast(data) {
  let nuno = (data) => 3;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsCSETForetell(data) {
  let nuno = (data) => (data.numforecasts > 100 ? 3 : 2);
  let eli = (data) => 3;
  let misha = (data) => 2;
  let starsDecimal = average([nuno(data), eli(data), misha(data)]);
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsElicit(data) {
  let nuno = (data) => 1;
  let eli = (data) => null;
  let misha = (data) => null;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsEstimize(data) {
  let nuno = (data) => 2;
  let eli = (data) => null;
  let misha = (data) => null;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsForetold(data) {
  let nuno = (data) => 2;
  let eli = (data) => null;
  let misha = (data) => null;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsGiveWellOpenPhil(data) {
  let nuno = (data) => 2;
  let eli = (data) => null;
  let misha = (data) => null;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsGoodJudgment(data) {
  let nuno = (data) => 4;
  let eli = (data) => 4;
  let misha = (data) => 3.5;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsGoodJudgmentOpen(data) {
  let nuno = (data) => (data.numforecasts > 100 ? 3 : 2);
  let eli = (data) => 3;
  let misha = (data) =>
    data.minProbability > 0.1 || data.maxProbability < 0.9 ? 3.1 : 2.5;
  let starsDecimal = average([nuno(data), eli(data), misha(data)]);
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsHypermind(data) {
  let nuno = (data) => 3;
  let eli = (data) => null;
  let misha = (data) => null;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsInfer(data) {
  let nuno = (data) => 2;
  let eli = (data) => null;
  let misha = (data) => null;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsKalshi(data) {
  let nuno = (data) =>
    data.interest > 500 && data.shares_volume > 10000
      ? 4
      : data.shares_volume > 2000
      ? 3
      : 2;
  // let eli = (data) => data.interest > 10000 ? 5 : 4
  // let misha = (data) => 4
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  // Substract 1 star if probability is above 90% or below 10%
  if (
    data.option &&
    (data.option.probability < 0.1 || data.option.probability > 0.9)
  ) {
    starsDecimal = starsDecimal - 1;
  }

  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsLadbrokes(data) {
  let nuno = (data) => 2;
  let eli = (data) => null;
  let misha = (data) => null;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsManifold(data) {
  let nuno = (data) =>
    data.volume7Days > 250 || (data.pool > 500 && data.volume7Days > 100)
      ? 2
      : 1;
  let eli = (data) => null;
  let misha = (data) => null;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  // console.log(data);
  // console.log(starsInteger);
  return starsInteger;
}

function calculateStarsMetaculus(data) {
  let nuno = (data) =>
    data.numforecasts > 300 ? 4 : data.numforecasts > 100 ? 3 : 2;
  let eli = (data) => 3;
  let misha = (data) => 3;
  let starsDecimal = average([nuno(data), eli(data), misha(data)]);
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsOmen(data) {
  let nuno = (data) => 1;
  let eli = (data) => null;
  let misha = (data) => null;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsPolymarket(data) {
  let nuno = (data) => (data.volume > 10000 ? 4 : data.volume > 1000 ? 3 : 2);
  // let eli = (data) => data.liquidity > 10000 ? 5 : 4
  // let misha = (data) => 4
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  // Substract 1 star if probability is above 90% or below 10%
  if (
    data.option &&
    (data.option.probability < 0.1 || data.option.probability > 0.9)
  ) {
    starsDecimal = starsDecimal - 1;
  }

  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsPredictIt(data) {
  let nuno = (data) => 3;
  let eli = (data) => 3.5;
  let misha = (data) => 2.5;
  let starsDecimal = average([nuno(data), eli(data), misha(data)]);
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsRootclaim(data) {
  let nuno = (data) => 4;
  let eli = (data) => null;
  let misha = (data) => null;
  let starsDecimal = average([nuno(data) /*, eli(data), misha(data)*/]);
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsSmarkets(data) {
  let nuno = (data) => 2;
  let eli = (data) => null;
  let misha = (data) => null;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsWildeford(data) {
  let nuno = (data) => 3;
  let eli = (data) => null;
  let misha = (data) => null;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

function calculateStarsWilliamHill(data) {
  let nuno = (data) => 2;
  let eli = (data) => null;
  let misha = (data) => null;
  let starsDecimal = average([nuno(data)]); //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal);
  return starsInteger;
}

export function calculateStars(platform: string, data) {
  let stars = 2;
  switch (platform) {
    case "betfair":
      stars = calculateStarsBetfair(data);
      break;
    case "infer":
      stars = calculateStarsInfer(data);
      break;
    case "foretold":
      stars = calculateStarsForetold(data);
      break;
    case "givewellopenphil":
      stars = calculateStarsGiveWellOpenPhil(data);
      break;
    case "goodjudgment":
      stars = calculateStarsGoodJudgment(data);
      break;
    case "goodjudgmentopen":
      stars = calculateStarsGoodJudgmentOpen(data);
      break;
    case "kalshi":
      stars = calculateStarsKalshi(data);
      break;
    case "manifold":
      stars = calculateStarsManifold(data);
      break;
    case "metaculus":
      stars = calculateStarsMetaculus(data);
      break;
    case "polymarket":
      stars = calculateStarsPolymarket(data);
      break;
    case "predictit":
      stars = calculateStarsPredictIt(data);
      break;
    case "rootclaim":
      stars = calculateStarsRootclaim(data);
      break;
    case "smarkets":
      stars = calculateStarsSmarkets(data);
      break;
    case "wildeford":
      stars = calculateStarsWildeford(data);
      break;

    // deprecated
    case "AstralCodexTen":
      stars = calculateStarsAstralCodexTen(data);
      break;
    case "CoupCast":
      stars = calculateStarsCoupCast(data);
      break;
    case "CSET-foretell":
      stars = calculateStarsCSETForetell(data);
      break;
    case "Elicit":
      stars = calculateStarsElicit(data);
      break;
    case "Estimize":
      stars = calculateStarsEstimize(data);
      break;
    case "Hypermind":
      stars = calculateStarsHypermind(data);
      break;
    case "Ladbrokes":
      stars = calculateStarsLadbrokes(data);
      break;
    case "Omen":
      stars = calculateStarsOmen(data);
      break;
    case "WilliamHill":
      stars = calculateStarsWilliamHill(data);
      break;
    default:
      stars = 2;
  }
  return stars;
}
