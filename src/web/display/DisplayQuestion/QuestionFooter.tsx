const formatQualityIndicator = (indicator) => {
  let result;
  switch (indicator) {
    case "numforecasts":
      result = null;
      break;

    case "stars":
      result = null;
      break;

    case "volume":
      result = "Volume";
      break;

    case "numforecasters":
      result = "Forecasters";
      break;

    case "yes_bid":
      result = null; // "Yes bid"
      break;

    case "yes_ask":
      result = null; // "Yes ask"
      break;

    case "spread":
      result = "Spread";
      break;
    case "shares_volume":
      result = "Shares vol.";
      break;

    case "open_interest":
      result = "Interest";
      break;

    case "resolution_data":
      result = null;
      break;

    case "liquidity":
      result = "Liquidity";
      break;

    case "tradevolume":
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

const formatQualityIndicators = (qualityIndicators: any) => {
  let newQualityIndicators = {};
  for (let key in qualityIndicators) {
    let newKey = formatQualityIndicator(key);
    if (newKey) {
      newQualityIndicators[newKey] = qualityIndicators[key];
    }
  }
  return newQualityIndicators;
};

/* Display functions*/

const getPercentageSymbolIfNeeded = ({ indicator, platform }) => {
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
  indicator: any;
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

const showFirstQualityIndicator = ({
  numforecasts,
  lastUpdated,
  showTimeStamp,
  qualityindicators,
}) => {
  if (!!numforecasts) {
    return (
      <div className="flex col-span-1 row-span-1">
        {/*<span>{` ${numforecasts == 1 ? "Forecast" : "Forecasts:"}`}</span>&nbsp;*/}
        <span>{"Forecasts:"}</span>&nbsp;
        <span className="font-bold">{Number(numforecasts).toFixed(0)}</span>
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
  numforecasts: number;
  lastUpdated: Date;
  showTimeStamp: boolean;
  qualityindicators: any;
  platform: string; // id string - e.g. "goodjudgment", not "Good Judgment"
}> = ({
  numforecasts,
  lastUpdated,
  showTimeStamp,
  qualityindicators,
  platform,
}) => {
  // grid grid-cols-1
  return (
    <div className="text-sm">
      {showFirstQualityIndicator({
        numforecasts,
        lastUpdated,
        showTimeStamp,
        qualityindicators,
      })}
      {Object.entries(formatQualityIndicators(qualityindicators)).map(
        (entry, i) => {
          return (
            <div className="col-span-1 row-span-1">
              <span>{`${entry[0]}:`}</span>&nbsp;
              <span className="font-bold">
                {`${getCurrencySymbolIfNeeded({
                  indicator: entry[0],
                  platform,
                })}${formatNumber(entry[1])}${getPercentageSymbolIfNeeded({
                  indicator: entry[0],
                  platform,
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
  stars: any;
  platform: string;
  platformLabel: string;
  numforecasts: any;
  qualityindicators: any;
  lastUpdated: Date;
  showTimeStamp: boolean;
  expandFooterToFullWidth: boolean;
}

export const QuestionFooter: React.FC<Props> = ({
  stars,
  platform,
  platformLabel,
  numforecasts,
  qualityindicators,
  lastUpdated,
  showTimeStamp,
  expandFooterToFullWidth,
}) => {
  // I experimented with justify-evenly, justify-around, etc., here: https://tailwindcss.com/docs/justify-content
  // I came to the conclusion that as long as the description isn't justified too, aligning the footer symmetrically doesn't make sense
  // because the contrast is jarring.
  let debuggingWithBackground = false;
  return (
    <div
      className={`grid grid-cols-3 ${
        expandFooterToFullWidth ? "justify-between" : ""
      } text-gray-500 mb-2 mt-1`}
    >
      <div
        className={`self-center col-span-1 ${getStarsColor(stars)} ${
          debuggingWithBackground ? "bg-red-200" : ""
        }`}
      >
        {getstars(stars)}
      </div>
      <div
        className={`${
          expandFooterToFullWidth ? "place-self-center" : "self-center"
        }  col-span-1 font-bold ${debuggingWithBackground ? "bg-red-100" : ""}`}
      >
        {platformLabel
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
          numforecasts,
          lastUpdated,
          showTimeStamp,
          qualityindicators,
          platform,
        })}
      </div>
    </div>
  );
};
