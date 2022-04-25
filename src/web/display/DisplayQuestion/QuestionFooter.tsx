import { QuestionFragment } from "../../search/queries.generated";

type QualityIndicator = QuestionFragment["qualityIndicators"];
type IndicatorName = keyof QualityIndicator;

const formatQualityIndicator = (indicator: IndicatorName) => {
  let result: string | null = null;
  switch (indicator) {
    case "numForecasts":
      result = null;
      break;

    case "stars":
      result = null;
      break;

    case "volume":
      result = "Volume";
      break;

    case "numForecasters":
      result = "Forecasters";
      break;

    // case "yesBid":
    //   result = null; // "Yes bid"
    //   break;

    // case "yesAsk":
    //   result = null; // "Yes ask"
    //   break;

    case "spread":
      result = "Spread";
      break;
    case "sharesVolume":
      result = "Shares vol.";
      break;

    case "openInterest":
      result = "Interest";
      break;

    // case "resolution_data":
    //   result = null;
    //   break;

    case "liquidity":
      result = "Liquidity";
      break;

    case "tradeVolume":
      result = "Volume";
      break;
  }
  return result;
};

const formatNumber = (num) => {
  if (Number(num) < 1000) {
    return Number(num).toFixed(0);
  } else if (num < 10000) {
    return (Number(num) / 1000).toFixed(1) + "k";
  } else {
    return (Number(num) / 1000).toFixed(0) + "k";
  }
};

const formatQualityIndicators = (qualityIndicators: QualityIndicator) => {
  let newQualityIndicators: { [k: string]: string | number } = {};
  for (const key of Object.keys(qualityIndicators)) {
    const newKey = formatQualityIndicator(key as IndicatorName);
    if (newKey && qualityIndicators[key] !== null) {
      newQualityIndicators[newKey] = qualityIndicators[key];
    }
  }
  return newQualityIndicators;
};

/* Display functions*/

const getPercentageSymbolIfNeeded = ({
  indicator,
  platform,
}: {
  indicator: string;
  platform: string;
}) => {
  let indicatorsWhichNeedPercentageSymbol = ["Spread"];
  if (indicatorsWhichNeedPercentageSymbol.includes(indicator)) {
    return "%";
  } else {
    return "";
  }
};

const getCurrencySymbolIfNeeded = ({
  indicator,
  platform,
}: {
  indicator: string;
  platform: string;
}) => {
  let indicatorsWhichNeedCurrencySymbol = ["Volume", "Interest", "Liquidity"];
  let dollarPlatforms = ["predictit", "kalshi", "polymarket"];
  if (indicatorsWhichNeedCurrencySymbol.includes(indicator)) {
    if (dollarPlatforms.includes(platform)) {
      return "$";
    } else {
      return "£";
    }
  } else {
    return "";
  }
};

const showFirstQualityIndicator: React.FC<{
  question: QuestionFragment;
  showTimeStamp: boolean;
}> = ({ question, showTimeStamp }) => {
  const lastUpdated = new Date(question.timestamp * 1000);
  if (!!question.qualityIndicators.numForecasts) {
    return (
      <div className="flex col-span-1 row-span-1">
        {/*<span>{` ${numforecasts == 1 ? "Forecast" : "Forecasts:"}`}</span>&nbsp;*/}
        <span>Forecasts:</span>&nbsp;
        <span className="font-bold">
          {Number(question.qualityIndicators.numForecasts).toFixed(0)}
        </span>
      </div>
    );
  } else if (showTimeStamp) {
    return (
      <span className="hidden sm:flex items-center justify-center text-gray-600 mt-2">
        <svg className="ml-4 mr-1 mt-1" height="10" width="16">
          <circle cx="4" cy="4" r="4" fill="rgb(29, 78, 216)" />
        </svg>
        {`Last updated: ${
          lastUpdated ? lastUpdated.toISOString().slice(0, 10) : "unknown"
        }`}
      </span>
    );
  } else {
    return null;
  }
};

const displayQualityIndicators: React.FC<{
  question: QuestionFragment;
  showTimeStamp: boolean;
}> = ({ question, showTimeStamp }) => {
  const { qualityIndicators } = question;
  return (
    <div className="text-sm">
      {showFirstQualityIndicator({
        question,
        showTimeStamp,
      })}
      {Object.entries(formatQualityIndicators(question.qualityIndicators)).map(
        (entry, i) => {
          return (
            <div className="col-span-1 row-span-1">
              <span>${entry[0]}:</span>&nbsp;
              <span className="font-bold">
                {`${getCurrencySymbolIfNeeded({
                  indicator: entry[0],
                  platform: question.platform.id,
                })}${formatNumber(entry[1])}${getPercentageSymbolIfNeeded({
                  indicator: entry[0],
                  platform: question.platform.id,
                })}`}
              </span>
            </div>
          );
        }
      )}
    </div>
  );
};

// Database-like functions
export function getstars(numstars: number) {
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

function getStarsColor(numstars: number) {
  let color = "text-yellow-400";
  switch (numstars) {
    case 0:
      color = "text-red-400";
      break;
    case 1:
      color = "text-red-400";
      break;
    case 2:
      color = "text-orange-400";
      break;
    case 3:
      color = "text-yellow-400";
      break;
    case 4:
      color = "text-green-400";
      break;
    case 5:
      color = "text-blue-400";
      break;
    default:
      color = "text-yellow-400";
  }
  return color;
}

interface Props {
  question: QuestionFragment;
  showTimeStamp: boolean;
  expandFooterToFullWidth: boolean;
}

export const QuestionFooter: React.FC<Props> = ({
  question,
  showTimeStamp,
  expandFooterToFullWidth,
}) => {
  let debuggingWithBackground = false;
  return (
    <div
      className={`grid grid-cols-3 ${
        expandFooterToFullWidth ? "justify-between" : ""
      } text-gray-500 mb-2 mt-1`}
    >
      <div
        className={`self-center col-span-1 ${getStarsColor(
          question.qualityIndicators.stars
        )} ${debuggingWithBackground ? "bg-red-200" : ""}`}
      >
        {getstars(question.qualityIndicators.stars)}
      </div>
      <div
        className={`${
          expandFooterToFullWidth ? "place-self-center" : "self-center"
        }  col-span-1 font-bold ${debuggingWithBackground ? "bg-red-100" : ""}`}
      >
        {question.platform.label
          .replace("Good Judgment Open", "GJOpen")
          .replace(/ /g, "\u00a0")}
      </div>
      <div
        className={`${
          expandFooterToFullWidth
            ? "justify-self-end mr-4"
            : "justify-self-center"
        } col-span-1 ${debuggingWithBackground ? "bg-red-100" : ""}`}
      >
        {displayQualityIndicators({
          question,
          showTimeStamp,
        })}
      </div>
    </div>
  );
};
