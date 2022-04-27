import Link from "next/link";
import { FaExpand } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

import { CopyText } from "../../common/CopyText";
import { QuestionFragment } from "../../fragments.generated";
import { QuestionOptions } from "../../questions/components/QuestionOptions";
import { cleanText } from "../../utils";
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

// Auxiliary components

const DisplayMarkdown: React.FC<{ description: string }> = ({
  description,
}) => {
  const formatted = truncateText(250, cleanText(description));
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
  const { options } = question;
  const lastUpdated = new Date(question.timestamp * 1000);

  const isBinary =
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
            <Link href={`/questions/${question.id}`} passHref>
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
          {isBinary ? (
            <div className="flex justify-between">
              <QuestionOptions options={options} />
              <div className={`hidden ${showTimeStamp ? "sm:block" : ""}`}>
                <LastUpdated timestamp={lastUpdated} />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <QuestionOptions options={options} />
              <div className={`hidden ${showTimeStamp ? "sm:block" : ""} ml-6`}>
                <LastUpdated timestamp={lastUpdated} />
              </div>
            </div>
          )}

          {question.platform.id !== "guesstimate" && options.length < 3 && (
            <div className="text-gray-500">
              <DisplayMarkdown description={question.description} />
            </div>
          )}

          {question.platform.id === "guesstimate" && (
            <img
              className="rounded-sm"
              src={question.visualization}
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
            expandFooterToFullWidth={expandFooterToFullWidth}
          />
        </div>
      </div>
    </Card>
  );
};
