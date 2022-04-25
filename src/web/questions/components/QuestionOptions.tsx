import { formatProbability } from "../utils";

const OptionRow: React.FC<{ option: any }> = ({ option }) => {
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

  return (
    <div className="flex items-center">
      <div
        className={`${chooseColor(
          option.probability
        )} w-14 flex-none rounded-md py-0.5 text-sm text-center`}
      >
        {formatProbability(option.probability)}
      </div>
      <div className="text-gray-700 pl-3 leading-snug text-sm">
        {option.name}
      </div>
    </div>
  );
};

export const QuestionOptions: React.FC<{ options: any[] }> = ({ options }) => {
  const optionsSorted = options.sort((a, b) => b.probability - a.probability);
  const optionsMax5 = !!optionsSorted.slice ? optionsSorted.slice(0, 5) : []; // display max 5 options.
  return (
    <div className="space-y-2">
      {optionsMax5.map((option, i) => (
        <OptionRow option={option} key={i} />
      ))}
    </div>
  );
};
