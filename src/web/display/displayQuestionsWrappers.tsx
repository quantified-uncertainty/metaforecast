import { DisplayOneQuestionForCapture } from "./DisplayOneQuestionForCapture";
import { DisplayQuestions } from "./DisplayQuestions";

export function displayQuestionsWrapperForSearch({
  results,
  numDisplay,
  showIdToggle,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <DisplayQuestions
        results={results || []}
        numDisplay={numDisplay}
        showIdToggle={showIdToggle}
      />
    </div>
  );
}

export function displayQuestionsWrapperForCapture({
  results,
  whichResultToDisplayAndCapture,
}) {
  return (
    <div className="grid grid-cols-1 w-full justify-center">
      <DisplayOneQuestionForCapture
        result={results[whichResultToDisplayAndCapture]}
      />
    </div>
  );
}
