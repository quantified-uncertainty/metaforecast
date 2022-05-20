import {
  FullQuestionOption,
  isFullQuestionOption,
} from "../../../common/types";
import { QuestionFragment } from "../../fragments.generated";
import { isQuestionBinary } from "../../utils";
import { formatProbability } from "../utils";

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

const chooseColor = (probability: number) => {
  if (probability < 0.1) {
    return "bg-blue-50 text-blue-500";
  } else if (probability < 0.3) {
    return "bg-blue-100 text-blue-600";
  } else if (probability < 0.7) {
    return "bg-blue-200 text-blue-700";
  } else {
    return "bg-blue-300 text-blue-800";
  }
};

const OptionRow: React.FC<{
  option: FullQuestionOption;
  optionTextSize: string;
}> = ({ option, optionTextSize }) => {
  return (
    <div className="flex items-center">
      <div
        className={`${chooseColor(
          option.probability
        )} w-14 flex-none rounded-md py-0.5 ${
          optionTextSize || "text-sm"
        } text-center`}
      >
        {formatProbability(option.probability)}
      </div>
      <div
        className={`text-gray-700 pl-3 leading-snug ${
          optionTextSize || "text-sm"
        }`}
      >
        {option.name}
      </div>
    </div>
  );
};

export const QuestionOptions: React.FC<{
  question: QuestionFragment;
  maxNumOptions: number;
  optionTextSize: string;
  onlyFirstEstimate: boolean;
}> = ({ question, maxNumOptions, optionTextSize, onlyFirstEstimate }) => {
  const isBinary = isQuestionBinary(question);

  if (isBinary) {
    const yesOption = question.options.find((o) => o.name === "Yes");
    if (!yesOption) {
      return null; // shouldn't happen
    }
    if (!isFullQuestionOption(yesOption)) {
      return null; // missing data
    }
    return (
      <div className="space-x-2">
        <span
          className={`${primaryForecastColor(
            yesOption.probability
          )} text-white w-16 rounded-md px-2 py-1 font-bold ${
            optionTextSize || "text-normal"
          }`}
        >
          {formatProbability(yesOption.probability)}
        </span>
        <span
          className={`${textColor(yesOption.probability)} ${
            optionTextSize || "text-normal"
          } text-gray-500 inline-block`}
        >
          {primaryEstimateAsText(yesOption.probability)}
        </span>
      </div>
    );
  } else if (onlyFirstEstimate) {
    if (question.options.length > 0) {
      const yesOption =
        question.options.length > 0 ? question.options[0] : null;
      if (!yesOption) {
        return null; // shouldn't happen
      }
      if (!isFullQuestionOption(yesOption)) {
        return null; // missing data
      }
      return (
        <div className="space-x-2">
          <span
            className={`${primaryForecastColor(
              yesOption.probability
            )} text-white w-16 rounded-md px-2 py-1 font-bold ${
              optionTextSize || "text-normal"
            }`}
          >
            {formatProbability(yesOption.probability)}
          </span>
          <span
            className={`${textColor(yesOption.probability)} ${
              optionTextSize || "text-normal"
            } text-gray-500 inline-block`}
          >
            {yesOption.name}
          </span>
        </div>
      );
    } else {
      return null;
    }
  } else {
    const optionsSorted = question.options
      .filter(isFullQuestionOption)
      .sort((a, b) => b.probability - a.probability);

    const optionsMaxN = optionsSorted.slice(0, maxNumOptions); // display max 5 options.

    return (
      <div className="space-y-2">
        {optionsMaxN.map((option, i) => (
          <OptionRow option={option} key={i} optionTextSize={optionTextSize} />
        ))}
      </div>
    );
  }
};
