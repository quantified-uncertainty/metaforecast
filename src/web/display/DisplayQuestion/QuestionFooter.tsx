import { QuestionFragment } from "../../fragments.generated";

type QualityIndicator = QuestionFragment["qualityIndicators"];
type IndicatorName = keyof QualityIndicator;

// this duplication can probably be simplified with typescript magic, but this is good enough for now
export type UsedIndicatorName =
  // | "numForecasts"
  // | "stars"
  | "volume"
  | "numForecasters"
  | "spread"
  | "sharesVolume"
  | "liquidity"
  | "tradeVolume"
  | "openInterest";

export const qualityIndicatorLabels: { [k in UsedIndicatorName]: string } = {
  // numForecasts: "Number of forecasts",
  // stars: "Stars",
  // yesBid: "Yes bid",
  // yesAsk: "Yes ask",
  volume: "Volume",
  numForecasters: "Forecasters",
  spread: "Spread",
  sharesVolume: "Shares vol.",
  liquidity: "Liquidity",
  tradeVolume: "Volume",
  openInterest: "Interest",
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

/* Display functions*/

const getPercentageSymbolIfNeeded = ({
  indicator,
  platform,
}: {
  indicator: UsedIndicatorName;
  platform: string;
}) => {
  let indicatorsWhichNeedPercentageSymbol: IndicatorName[] = ["spread"];
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
  indicator: UsedIndicatorName;
  platform: string;
}) => {
  const indicatorsWhichNeedCurrencySymbol: IndicatorName[] = [
    "volume",
    "tradeVolume",
    "openInterest",
    "liquidity",
  ];
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

const FirstQualityIndicator: React.FC<{
  question: QuestionFragment;
}> = ({ question }) => {
  if (question.qualityIndicators.numForecasts) {
    return (
      <div className="flex">
        <span>Forecasts:</span>&nbsp;
        <span className="font-bold">
          {Number(question.qualityIndicators.numForecasts).toFixed(0)}
        </span>
      </div>
    );
  } else {
    return null;
  }
};

export const formatIndicatorValue = (
  value: any,
  indicator: UsedIndicatorName,
  platform: string
): string => {
  return `${getCurrencySymbolIfNeeded({
    indicator,
    platform: platform,
  })}${formatNumber(value)}${getPercentageSymbolIfNeeded({
    indicator,
    platform: platform,
  })}`;
};

const QualityIndicatorsList: React.FC<{
  question: QuestionFragment;
}> = ({ question }) => {
  return (
    <div className="text-sm">
      <FirstQualityIndicator question={question} />
      {Object.entries(question.qualityIndicators).map((entry, i) => {
        const indicatorLabel = qualityIndicatorLabels[entry[0]];
        if (!indicatorLabel || entry[1] === null) return;
        const indicator = entry[0] as UsedIndicatorName; // guaranteed by the previous line
        const value = entry[1];

        return (
          <div key={indicator}>
            <span>{indicatorLabel}:</span>&nbsp;
            <span className="font-bold">
              {formatIndicatorValue(value, indicator, question.platform.id)}
            </span>
          </div>
        );
      })}
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

export function getStarsElement(numStars) {
  return (
    <div className={`self-center col-span-1 ${getStarsColor(numStars)}`}>
      {getstars(numStars)}
    </div>
  );
}

interface Props {
  question: QuestionFragment;
  expandFooterToFullWidth: boolean;
}

export const QuestionFooter: React.FC<Props> = ({
  question,
  expandFooterToFullWidth,
}) => {
  return (
    <div
      className={`grid grid-cols-3 ${
        expandFooterToFullWidth ? "justify-between" : ""
      } text-gray-500 mb-2 mt-1`}
    >
      {getStarsElement(question.qualityIndicators.stars)}
      <div
        className={`${
          expandFooterToFullWidth ? "place-self-center" : "self-center"
        }  col-span-1 font-bold`}
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
        } col-span-1`}
      >
        <QualityIndicatorsList question={question} />
      </div>
    </div>
  );
};
