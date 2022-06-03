import Ajv, { JTDDataType, ValidateFunction } from "ajv/dist/jtd";
import axios from "axios";
import { sleep } from "../../utils/sleep";

// Type examples:
// - group: https://www.metaculus.com/api2/questions/9866/
// - claim: https://www.metaculus.com/api2/questions/9668/
// - subquestion forecast: https://www.metaculus.com/api2/questions/10069/
// - basic forecast: https://www.metaculus.com/api2/questions/11005/

const RETRY_SLEEP_TIME = 5000;

const commonProps = {
  id: {
    type: "uint32",
  },
  title: {
    type: "string",
  },
} as const;

const predictableProps = {
  publish_time: {
    type: "string",
  },
  close_time: {
    type: "string",
  },
  resolve_time: {
    type: "string",
  },
  resolution: {
    type: "float64",
    nullable: true,
  },
  possibilities: {
    properties: {
      type: {
        // Enum["binary", "continuous"], via https://github.com/quantified-uncertainty/metaforecast/pull/84#discussion_r878240875
        // but metaculus might add new values in the future and we don't want the fetcher to break
        type: "string",
      },
    },
    additionalProperties: true,
  },
  number_of_predictions: {
    type: "uint32",
  },
  community_prediction: {
    properties: {
      full: {
        properties: {
          q1: {
            type: "float64",
          },
          q2: {
            type: "float64",
          },
          q3: {
            type: "float64",
          },
        },
        additionalProperties: true,
      },
    },
    additionalProperties: true,
  },
} as const;

const pageProps = {
  page_url: {
    type: "string",
  },
  group: {
    type: "uint32",
    nullable: true,
  },
} as const;

// these are missing in /api2/questions/ requests, and building two schemas is too much pain
const optionalPageProps = {
  description: {
    type: "string",
  },
  description_html: {
    type: "string",
  },
} as const;

const apiQuestionSchema = {
  discriminator: "type",
  mapping: {
    forecast: {
      properties: {
        ...commonProps,
        ...pageProps,
        ...predictableProps,
      },
      optionalProperties: {
        ...optionalPageProps,
      },
      additionalProperties: true,
    },
    group: {
      properties: {
        ...commonProps,
        ...pageProps,
        sub_questions: {
          elements: {
            properties: {
              ...commonProps,
              ...predictableProps,
            },
            additionalProperties: true,
          },
        },
      },
      optionalProperties: {
        ...optionalPageProps,
      },
      additionalProperties: true,
    },
    // we're not interested in claims currently (but we should be?)
    claim: {
      properties: {
        ...commonProps,
        ...pageProps,
      },
      optionalProperties: {
        ...optionalPageProps,
      },
      additionalProperties: true,
    },
    discussion: {
      optionalProperties: {
        ...optionalPageProps,
      },
      additionalProperties: true,
    },
  },
} as const;

const apiMultipleQuestionsSchema = {
  properties: {
    results: {
      elements: apiQuestionSchema,
    },
    next: {
      type: "string",
      nullable: true,
    },
  },
  additionalProperties: true,
} as const;

export type ApiCommon = JTDDataType<{
  properties: typeof commonProps;
}>;
export type ApiPredictable = JTDDataType<{
  properties: typeof predictableProps;
}>;
export type ApiQuestion = JTDDataType<typeof apiQuestionSchema>;
export type ApiMultipleQuestions = JTDDataType<
  typeof apiMultipleQuestionsSchema
>;

const validateApiQuestion = new Ajv().compile<ApiQuestion>(apiQuestionSchema);
const validateApiMultipleQuestions = new Ajv().compile<ApiMultipleQuestions>(
  apiMultipleQuestionsSchema
);

async function fetchWithRetries<T = unknown>(url: string): Promise<T> {
  try {
    const response = await axios.get<T>(url);
    return response.data;
  } catch (error) {
    console.log(`Error while fetching ${url}`);
    console.log(error);
    if (axios.isAxiosError(error)) {
      if (error.response?.headers["retry-after"]) {
        const timeout = error.response.headers["retry-after"];
        console.log(`Timeout: ${timeout}`);
        await sleep(Number(timeout) * 1000 + 1000);
      } else {
        await sleep(RETRY_SLEEP_TIME);
      }
    }
  }
  const response = await axios.get<T>(url);
  return response.data;
}

const fetchAndValidate = async <T = unknown>(
  url: string,
  validator: ValidateFunction<T>
): Promise<T> => {
  console.log(url);
  const data = await fetchWithRetries<object>(url);
  if (validator(data)) {
    return data;
  }
  throw new Error(
    `Response validation for url ${url} failed: ` +
      JSON.stringify(validator.errors)
  );
};

export async function fetchApiQuestions(
  next: string
): Promise<ApiMultipleQuestions> {
  return await fetchAndValidate(next, validateApiMultipleQuestions);
}

export async function fetchSingleApiQuestion(id: number): Promise<ApiQuestion> {
  return await fetchAndValidate(
    `https://www.metaculus.com/api2/questions/${id}/`,
    validateApiQuestion
  );
}
