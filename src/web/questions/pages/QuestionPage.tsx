import { GetServerSideProps, NextPage } from "next";
import { FaExternalLinkAlt } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

import { Query } from "../../common/Query";
import { Card } from "../../display/Card";
import { DisplayOneQuestionForCapture } from "../../display/DisplayOneQuestionForCapture";
import { Layout } from "../../display/Layout";
import { LineHeader } from "../../display/LineHeader";
import { QuestionWithHistoryFragment } from "../../fragments.generated";
import { ssrUrql } from "../../urql";
import { HistoryChart } from "../components/HistoryChart";
import { IndicatorsTable } from "../components/IndicatorsTable";
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

const Section: React.FC<{ title: string }> = ({ title, children }) => (
  <div className="space-y-4 flex flex-col items-center">
    <h2 className="text-xl text-gray-900">{title}</h2>
    <div>{children}</div>
  </div>
);

const QuestionCardContents: React.FC<{
  question: QuestionWithHistoryFragment;
}> = ({ question }) => (
  <div className="flex flex-col space-y-8 items-center pt-5">
    <h1 className="sm:text-4xl text-2xl text-center">
      <a
        className="text-black no-underline hover:text-gray-600"
        href={question.url}
        target="_blank"
      >
        {question.title}{" "}
        <FaExternalLinkAlt className="text-gray-400 inline" size="24" />
      </a>
    </h1>
    <div className="max-w-3xl">
      <HistoryChart question={question} />
    </div>

    <Section title="Question description">
      <ReactMarkdown
        linkTarget="_blank"
        className="font-normal text-gray-900 max-w-prose"
      >
        {question.description.replaceAll("---", "")}
      </ReactMarkdown>
    </Section>

    <Section title="Indicators">
      <IndicatorsTable question={question} />
    </Section>
  </div>
);

const QuestionPage: NextPage<Props> = ({ id }) => {
  return (
    <Layout page="question">
      <div className="max-w-4xl mx-auto">
        <Query document={QuestionPageDocument} variables={{ id }}>
          {({ data }) => (
            <div className="space-y-8">
              <Card highlightOnHover={false} large={true}>
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
