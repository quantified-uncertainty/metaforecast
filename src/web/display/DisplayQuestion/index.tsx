import Link from "next/link";
import { FaExpand } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

import { CopyText } from "../../common/CopyText";
import { QuestionOptions } from "../../questions/components/QuestionOptions";
import { formatProbability } from "../../questions/utils";
import { QuestionFragment } from "../../search/queries.generated";
import { Card } from "../Card";
import { QuestionFooter } from "./QuestionFooter";

const truncateText = (length: number, text: string): string => {
  if (!text) {
    return "";
  }
  if (!!text && text.length <= length) {
    return text;
  }
  const breakpoints = " .!?";
  let lastLetter = null;
  let lastIndex = null;
  for (let index = length; index > 0; index--) {
    let letter = text[index];
    if (breakpoints.includes(letter)) {
      lastLetter = letter;
      lastIndex = index;
      break;
    }
  }
  let truncatedText = !!text.slice
    ? text.slice(0, lastIndex) + (lastLetter != "." ? "..." : "..")
    : "";
  return truncatedText;
};

// replaceAll polyfill
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function replaceAll(
  originalString: string,
  pattern: string | RegExp,
  substitute
) {
  return originalString.replace(
    new RegExp(escapeRegExp(pattern), "g"),
    substitute
  );
}

if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (
    pattern: string | RegExp,
    substitute
  ) {
    let originalString = this;

    // If a regex pattern
    if (
      Object.prototype.toString.call(pattern).toLowerCase() ===
      "[object regexp]"
    ) {
      return originalString.replace(pattern, substitute);
    }

    // If a string
    return replaceAll(originalString, pattern, substitute);
  };
}

const cleanText = (text: string): string => {
  // Note: should no longer be necessary
  let textString = !!text ? text : "";
  textString = textString
    .replaceAll("] (", "](")
    .replaceAll(") )", "))")
    .replaceAll("( [", "([")
    .replaceAll(") ,", "),")
    .replaceAll("==", "") // Denotes a title in markdown
    .replaceAll("Background\n", "")
    .replaceAll("Context\n", "")
    .replaceAll("--- \n", "- ")
    .replaceAll(/\[(.*?)\]\(.*?\)/g, "$1");
  textString = textString.slice(0, 1) == "=" ? textString.slice(1) : textString;
  //console.log(textString)
  return textString;
};

const primaryForecastColor = (probability: number) => {
  if (probability < 0.03) {
    return "bg-red-600";
  } else if (probability < 0.1) {
    return "bg-red-600 opacity-80";
  } else if (probability < 0.2) {
    return "bg-red-600 opacity-70";
  } else if (probability < 0.3) {
    return "bg-red-600 opacity-60";
  } else if (probability < 0.4) {
    return "bg-red-600 opacity-50";
  } else if (probability < 0.5) {
    return "bg-gray-500";
  } else if (probability < 0.6) {
    return "bg-gray-500";
  } else if (probability < 0.7) {
    return "bg-green-600 opacity-50";
  } else if (probability < 0.8) {
    return "bg-green-600 opacity-60";
  } else if (probability < 0.9) {
    return "bg-green-600 opacity-70";
  } else if (probability < 0.97) {
    return "bg-green-600 opacity-80";
  } else {
    return "bg-green-600";
  }
};

const textColor = (probability: number) => {
  if (probability < 0.03) {
    return "text-red-600";
  } else if (probability < 0.1) {
    return "text-red-600 opacity-80";
  } else if (probability < 0.2) {
    return "text-red-600 opacity-80";
  } else if (probability < 0.3) {
    return "text-red-600 opacity-70";
  } else if (probability < 0.4) {
    return "text-red-600 opacity-70";
  } else if (probability < 0.5) {
    return "text-gray-500";
  } else if (probability < 0.6) {
    return "text-gray-500";
  } else if (probability < 0.7) {
    return "text-green-600 opacity-70";
  } else if (probability < 0.8) {
    return "text-green-600 opacity-70";
  } else if (probability < 0.9) {
    return "text-green-600 opacity-80";
  } else if (probability < 0.97) {
    return "text-green-600 opacity-80";
  } else {
    return "text-green-600";
  }
};

const primaryEstimateAsText = (probability: number) => {
  if (probability < 0.03) {
    return "Exceptionally unlikely";
  } else if (probability < 0.1) {
    return "Very unlikely";
  } else if (probability < 0.4) {
    return "Unlikely";
  } else if (probability < 0.6) {
    return "About Even";
  } else if (probability < 0.9) {
    return "Likely";
  } else if (probability < 0.97) {
    return "Very likely";
  } else {
    return "Virtually certain";
  }
};

// Logical checks

const checkIfDisplayTimeStampAtBottom = (qualityIndicators: {
  [k: string]: any;
}) => {
  let indicators = Object.keys(qualityIndicators);
  if (indicators.length == 1 && indicators[0] == "stars") {
    return true;
  } else {
    return false;
  }
};

// Auxiliary components

const DisplayMarkdown: React.FC<{ description: string }> = ({
  description,
}) => {
  let formatted = truncateText(250, cleanText(description));
  // overflow-hidden overflow-ellipsis h-24
  return formatted === "" ? null : (
    <div className="overflow-clip">
      <ReactMarkdown linkTarget="_blank" className="font-normal">
        {formatted}
      </ReactMarkdown>
    </div>
  );
};

const LastUpdated: React.FC<{ timestamp: Date }> = ({ timestamp }) => (
  <div className="flex items-center">
    <svg className="mt-1" height="10" width="16">
      <circle cx="4" cy="4" r="4" fill="rgb(29, 78, 216)" />
    </svg>
    <span className="text-gray-600">
      Last updated:{" "}
      {timestamp ? timestamp.toISOString().slice(0, 10) : "unknown"}
    </span>
  </div>
);

// Main component

interface Props {
  question: QuestionFragment;
  showTimeStamp: boolean;
  expandFooterToFullWidth: boolean;
  showIdToggle?: boolean;
}

export const DisplayQuestion: React.FC<Props> = ({
  question,
  showTimeStamp,
  expandFooterToFullWidth,
  showIdToggle,
}) => {
  const {
    platform,
    description,
    options,
    qualityIndicators,
    timestamp,
    visualization,
  } = question;
  const lastUpdated = new Date(timestamp * 1000);
  const displayTimestampAtBottom =
    checkIfDisplayTimeStampAtBottom(qualityIndicators);

  const yesNoOptions =
    options.length === 2 &&
    (options[0].name === "Yes" || options[0].name === "No");

  return (
    <Card>
      <div className="h-full flex flex-col space-y-4">
        <div className="flex-grow space-y-4">
          {showIdToggle ? (
            <div className="mx-10">
              <CopyText text={question.id} displayText={`[${question.id}]`} />
            </div>
          ) : null}
          <div>
            <Link href={`/questions/${question.id}`}>
              <a className="float-right block ml-2 mt-1.5">
                <FaExpand
                  size="18"
                  className="text-gray-400 hover:text-gray-700"
                />
              </a>
            </Link>
            <Card.Title>
              <a
                className="text-black no-underline"
                href={question.url}
                target="_blank"
              >
                {question.title}
              </a>
            </Card.Title>
          </div>
          {yesNoOptions && (
            <div className="flex justify-between">
              <div className="space-x-2">
                <span
                  className={`${primaryForecastColor(
                    options[0].probability
                  )} text-white w-16 rounded-md px-1.5 py-0.5 font-bold`}
                >
                  {formatProbability(options[0].probability)}
                </span>
                <span
                  className={`${textColor(
                    options[0].probability
                  )} text-gray-500 inline-block`}
                >
                  {primaryEstimateAsText(options[0].probability)}
                </span>
              </div>
              <div
                className={`hidden ${
                  showTimeStamp && !displayTimestampAtBottom ? "sm:block" : ""
                }`}
              >
                <LastUpdated timestamp={lastUpdated} />
              </div>
            </div>
          )}
          {!yesNoOptions && (
            <div className="space-y-2">
              <QuestionOptions options={options} />
              <div
                className={`hidden ${
                  showTimeStamp && !displayTimestampAtBottom ? "sm:block" : ""
                } ml-6`}
              >
                <LastUpdated timestamp={lastUpdated} />
              </div>
            </div>
          )}

          {question.platform.id !== "guesstimate" && options.length < 3 && (
            <div className="text-gray-500">
              <DisplayMarkdown description={description} />
            </div>
          )}

          {question.platform.id === "guesstimate" && (
            <img
              className="rounded-sm"
              src={visualization}
              alt="Guesstimate Screenshot"
            />
          )}
        </div>
        <div
          className={`sm:hidden ${!showTimeStamp ? "hidden" : ""} self-center`}
        >
          {/* This one is exclusively for mobile*/}
          <LastUpdated timestamp={lastUpdated} />
        </div>
        <div className="w-full">
          <QuestionFooter
            question={question}
            showTimeStamp={showTimeStamp && displayTimestampAtBottom}
            expandFooterToFullWidth={expandFooterToFullWidth}
          />
        </div>
      </div>
    </Card>
  );
};
