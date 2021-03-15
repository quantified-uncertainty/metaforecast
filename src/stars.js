export function getStarSymbols(numstars) {
  let stars = "★★☆☆☆"
  switch (numstars) {
    case 0:
      stars = "☆☆☆☆☆"
      break;
    case 1:
      stars = "★☆☆☆☆"
      break;
    case 2:
      stars = "★★☆☆☆"
      break;
    case 3:
      stars = "★★★☆☆"
      break;
    case 4:
      stars = "★★★★☆"
      break;
    case 5:
      stars = "★★★★★"
      break;
    default:
      stars = "★★☆☆☆"
  }
  return (stars)
}

let average = array => array.reduce((a, b) => a + b, 0) / (array.length)

function calculateStarsCSETForetell(data) {
  let nuno = (data) => data.numforecasts > 100 ? 3 : 2
  let eli = (data) => 3
  let misha = (data) => 2
  let starsDecimal = average([nuno(data), eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal)
  return starsInteger
}

function calculateStarsElicit(data) {
  let nuno = data => 1
  let eli = (data) => null
  let misha = (data) => null
  let starsDecimal = average([nuno(data)]) //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal)
  return starsInteger
}

function calculateStarsForetold(data) {
  let nuno = data => 2
  let eli = (data) => null
  let misha = (data) => null
  let starsDecimal = average([nuno(data)]) //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal)
  return starsInteger
}

function calculateStarsGiveWellOpenPhil(data) {
  let nuno = data => 2
  let eli = (data) => null
  let misha = (data) => null
  let starsDecimal = average([nuno(data)]) //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal)
  return starsInteger
}

function calculateStarsGoodJudment(data) {
  let nuno = data => 4
  let eli = (data) => 4
  let misha = (data) => 3.5
  let starsDecimal = average([nuno(data)]) //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal)
  return starsInteger
}

function calculateStarsGoodJudmentOpen(data) {
  let nuno = data => data.numforecasts > 100 ? 3 : 2
  let eli = (data) => 3
  let misha = (data) => (data.minProbability > 0.1 || data.maxProbability < 0.9) ? 3.1 : 2.5
  let starsDecimal = average([nuno(data), eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal)
  return starsInteger
}

function calculateStarsHypermind(data) {
  let nuno = data => 3
  let eli = (data) => null
  let misha = (data) => null
  let starsDecimal = average([nuno(data)]) //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal)
  return starsInteger
}

function calculateStarsLadbrokes(data) {
  let nuno = data => 2
  let eli = (data) => null
  let misha = (data) => null
  let starsDecimal = average([nuno(data)]) //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal)
  return starsInteger
}

function calculateStarsMetaculus(data) {
  let nuno = data => data.numforecasts > 300 ? 4 : (data.numforecasts > 100 ? 3 : 2)
  let eli = (data) => 3
  let misha = (data) => 3
  let starsDecimal = average([nuno(data), eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal)
  return starsInteger
}

function calculateStarsOmen(data) {
  let nuno = data => 1
  let eli = (data) => null
  let misha = (data) => null
  let starsDecimal = average([nuno(data)]) //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal)
  return starsInteger
}

function calculateStarsPolymarket(data) {
  let nuno = data => data.liquidity > 1000 ? 3 : 2
  let eli = (data) => data.liquidity > 10000 ? 5 : 4
  let misha = (data) => 4
  let starsDecimal = average([nuno(data), eli(data), misha(data)])
  // Substract 1 star if probability is above 90% or below 10%
  if(data.option &&
    (data.option.probability < 0.1 || data.option.probability > 0.9)
  ){
    starsDecimal = starsDecimal - 1
  }
  
  let starsInteger = Math.round(starsDecimal)
  return starsInteger
}

function calculateStarsPredictIt(data) {
  let nuno = data => 2
  let eli = (data) => 3.5
  let misha = (data) => 2.5
  let starsDecimal = average([nuno(data), eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal)
  return starsInteger
}

function calculateStarsSmarkets(data) {
  let nuno = data => 2
  let eli = (data) => null
  let misha = (data) => null
  let starsDecimal = average([nuno(data)]) //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal)
  return starsInteger
}

function calculateStarsWilliamHill(data) {
  let nuno = data => 2
  let eli = (data) => null
  let misha = (data) => null
  let starsDecimal = average([nuno(data)]) //, eli(data), misha(data)])
  let starsInteger = Math.round(starsDecimal)
  return starsInteger
}

export function calculateStars(platform, data) {
  let stars = 2;
  switch (platform) {
    case "CSET-foretell":
      stars = calculateStarsCSETForetell(data)
      break;
    case "Elicit":
      stars = calculateStarsElicit(data)
      break;
    case "Foretold":
      stars = calculateStarsForetold(data)
      break;
    case "GiveWell/OpenPhilanthropy":
      stars = calculateStarsGiveWellOpenPhil(data)
      break;
    case "Good Judgment":
      stars = calculateStarsGoodJudment(data)
      break;
    case "Good Judgment Open":
      stars = calculateStarsGoodJudmentOpen(data)
      break;
    case "Hypermind":
      stars = calculateStarsHypermind(data)
      break;
    case "Hypermind":
      stars = calculateStarsLadbrokes(data)
      break;
    case "Metaculus":
      stars = calculateStarsMetaculus(data)
      break;
    case "Omen":
      stars = calculateStarsOmen(data)
      break;
    case "Polymarket":
      stars = calculateStarsPolymarket(data)
      break;
    case "PredictIt":
      stars = calculateStarsPredictIt(data)
      break;
    case "Smarkets":
      stars = calculateStarsSmarkets(data)
      break;
    case "WilliamHill":
      calculateStarsWilliamHill(data)
      break;
    default:
      stars = 2
  }
  return stars
}
