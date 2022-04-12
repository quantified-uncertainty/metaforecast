import { PlatformConfig, Question } from "../backend/platforms";

export type FrontendQuestion = Question & {
  platformLabel: string;
  visualization?: any;
};

// ok on client side
export const addLabelsToQuestions = (
  questions: Question[],
  platformsConfig: PlatformConfig[]
): FrontendQuestion[] => {
  const platformNameToLabel = Object.fromEntries(
    platformsConfig.map((platform) => [platform.name, platform.label])
  );

  return questions.map((result) => ({
    ...result,
    platformLabel: platformNameToLabel[result.platform] || result.platform,
  }));
};
