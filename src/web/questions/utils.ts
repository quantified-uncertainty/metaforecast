export const formatProbability = (probability: number) => {
  let percentage = probability * 100;
  let percentageCapped =
    percentage < 1
      ? "< 1%"
      : percentage > 99
      ? "> 99%"
      : percentage.toFixed(0) + "%";
  return percentageCapped;
};

import { QuestionFragment } from "../fragments.generated";

export type QuestionOption = QuestionFragment["options"][0];
export type FullQuestionOption = Exclude<
  QuestionOption,
  "name" | "probability"
> & {
  name: NonNullable<QuestionOption["name"]>;
  probability: NonNullable<QuestionOption["probability"]>;
};

export const isFullQuestionOption = (
  option: QuestionOption
): option is FullQuestionOption => {
  return option.name != null && option.probability != null;
};
