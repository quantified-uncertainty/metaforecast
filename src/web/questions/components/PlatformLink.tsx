import { FaExternalLinkAlt } from "react-icons/fa";

import { QuestionFragment } from "../../fragments.generated";

export const PlatformLink: React.FC<{ question: QuestionFragment }> = ({
  question,
}) => (
  <a
    className="px-2 py-1 border-2 border-gray-400 rounded-lg text-black no-underline text-normal hover:bg-gray-100 flex flex-nowrap space-x-1 items-center"
    href={question.url}
    target="_blank"
  >
    <span>{question.platform.label}</span>
    <FaExternalLinkAlt className="text-gray-400 inline sm:text-md text-md" />
  </a>
);
