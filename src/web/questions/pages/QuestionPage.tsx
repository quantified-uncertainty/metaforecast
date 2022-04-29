import { GetServerSideProps, NextPage } from "next";
import { FaExternalLinkAlt } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

import { Query } from "../../common/Query";
import { Card } from "../../display/Card";
import { DisplayOneQuestionForCapture } from "../../display/DisplayOneQuestionForCapture";
import {
    formatIndicatorValue, getStarsElement, qualityIndicatorLabels, UsedIndicatorName
} from "../../display/DisplayQuestion/QuestionFooter";
import { Layout } from "../../display/Layout";
import { LineHeader } from "../../display/LineHeader";
import { QuestionWithHistoryFragment } from "../../fragments.generated";
import { ssrUrql } from "../../urql";
import { HistoryChart } from "../components/HistoryChart";
import { QuestionPageDocument } from "../queries.generated";

interface Props {
  id: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const [ssrCache, client] = ssrUrql();
  const id = context.query.id as string;

  const question =
    (await client.query(QuestionPageDocument, { id }).toPromise()).data
      ?.result || null;

  if (!question) {
    context.res.statusCode = 404;
  }

  return {
    props: {
      urqlState: ssrCache.extractData(),
      id,
    },
  };
};

const QuestionCardContents: React.FC<{
  question: QuestionWithHistoryFragment;
}> = ({ question }) => (
  <div className="grid grid-cols-1 space-y-4 place-items-center mb-5">
    <h1 className="text-4xl place-self-center w-full text-center mt-10 pl-5 pr-5">
      <a
        className="text-black no-underline hover:text-gray-600"
        href={question.url}
        target="_blank"
      >
        {question.title}{" "}
        <FaExternalLinkAlt className="text-gray-400 inline" size="24" />
      </a>
    </h1>
    <HistoryChart question={question} />
    {/*
        <div className="flex justify-center items-center w-full">
      <div className="w-6/12">
        <QuestionFooter question={question} expandFooterToFullWidth={true} />
      </div>
    </div>
    <QuestionOptions options={question.options} />

    */}

    <h2 className="pt-10 text-xl place-self-center w-full text-center text-gray-900">
      {"Question description"}
    </h2>
    <ReactMarkdown
      linkTarget="_blank"
      className="font-normal text-gray-900 w-9/12"
    >
      {question.description.replaceAll("---", "")}
    </ReactMarkdown>

    <h2 className="pt-2  text-xl place-self-center w-full text-center text-gray-900">
      {"Indicators"}
    </h2>
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          <tr>
            <th scope="col" className="px-6 py-3">
              Indicator
            </th>
            <th scope="col" className="px-6 py-3">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <th
              scope="row"
              className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
            >
              {"Stars"}
            </th>
            <td className="px-6 py-4">
              {getStarsElement(question.qualityIndicators["stars"])}
            </td>
          </tr>
          <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
            <th
              scope="row"
              className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
            >
              {"Platform"}
            </th>
            <td className="px-6 py-4">{question.platform.label}</td>
          </tr>
          {!!question.qualityIndicators["numForecasts"] ? (
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
              <th
                scope="row"
                className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
              >
                {"Number of forecasts"}
              </th>
              <td className="px-6 py-4">
                {question.qualityIndicators["numForecasts"]}
              </td>
            </tr>
          ) : (
            ""
          )}
          {Object.keys(question.qualityIndicators)
            .filter(
              (indicator) =>
                question.qualityIndicators[indicator] != null &&
                !!qualityIndicatorLabels[indicator]
            )
            .map((indicator: UsedIndicatorName) => {
              return (
                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                  <th
                    scope="row"
                    className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap"
                  >
                    {qualityIndicatorLabels[indicator]}
                  </th>
                  <td className="px-6 py-4">
                    {formatIndicatorValue(
                      question.qualityIndicators[indicator],
                      indicator,
                      question.platform.id
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  </div>
);

const QuestionPage: NextPage<Props> = ({ id }) => {
  return (
    <Layout page="question">
      <div className="max-w-4xl mx-auto mb-5">
        <Query document={QuestionPageDocument} variables={{ id }}>
          {({ data }) => (
            <div className="space-y-8">
              <Card highlightOnHover={false}>
                <QuestionCardContents question={data.result} />
              </Card>
              <div className="space-y-4">
                <LineHeader>
                  <h1>Capture</h1>
                </LineHeader>
                <DisplayOneQuestionForCapture result={data.result} />
              </div>
            </div>
          )}
        </Query>
      </div>
    </Layout>
  );
};

export default QuestionPage;
