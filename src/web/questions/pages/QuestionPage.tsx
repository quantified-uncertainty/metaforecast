import { GetServerSideProps, NextPage } from "next";
import { FaExternalLinkAlt } from "react-icons/fa";
import ReactMarkdown from "react-markdown";

import { Card } from "../../common/Card";
import { Layout } from "../../common/Layout";
import { LineHeader } from "../../common/LineHeader";
import { Query } from "../../common/Query";
import { QuestionWithHistoryFragment } from "../../fragments.generated";
import { ssrUrql } from "../../urql";
import { CaptureQuestion } from "../components/CaptureQuestion";
import { HistoryChart } from "../components/HistoryChart";
import { IndicatorsTable } from "../components/IndicatorsTable";
import { Stars } from "../components/Stars";
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
  <div className="space-y-2 flex flex-col items-start">
    <h2 className="text-xl text-gray-900">{title}</h2>
    <div>{children}</div>
  </div>
);

const LargeQuestionCard: React.FC<{
  question: QuestionWithHistoryFragment;
}> = ({ question }) => (
  <Card highlightOnHover={false} large={true}>
    <h1 className="sm:text-3xl text-xl">
      <a
        className="text-black no-underline hover:text-gray-700"
        href={question.url}
        target="_blank"
      >
        {question.title}{" "}
        <FaExternalLinkAlt className="text-gray-400 inline sm:text-3xl text-xl mb-1" />
      </a>
    </h1>

    <div className="flex gap-2 mb-2">
      <a
        className="text-black no-underline bg-red-300 rounded p-1 px-2 text-xs hover:text-gray-600"
        href={question.url}
        target="_blank"
      >
        {question.platform.label}
      </a>
      <Stars num={question.qualityIndicators.stars} />
    </div>

    <div className="mb-8">
      {question.platform.id === "guesstimate" && question.visualization ? (
        <a className="no-underline" href={question.url} target="_blank">
          <img
            className="rounded-sm"
            src={question.visualization}
            alt="Guesstimate Screenshot"
          />
        </a>
      ) : (
        <HistoryChart question={question} />
      )}
    </div>

    <div className="mx-auto max-w-prose">
      <Section title="Question description">
        <ReactMarkdown
          linkTarget="_blank"
          className="font-normal text-gray-900"
        >
          {question.description.replaceAll("---", "")}
        </ReactMarkdown>
      </Section>
      <Section title="Indicators">
        <IndicatorsTable question={question} />
      </Section>
    </div>
  </Card>
);

const QuestionScreen: React.FC<{ question: QuestionWithHistoryFragment }> = ({
  question,
}) => (
  <div className="space-y-8">
    <LargeQuestionCard question={question} />
    <div className="space-y-4">
      <LineHeader>
        <h1>Capture</h1>
      </LineHeader>
      <CaptureQuestion question={question} />
    </div>
  </div>
);

const QuestionPage: NextPage<Props> = ({ id }) => {
  return (
    <Layout page="question">
      <div className="max-w-4xl mx-auto">
        <Query document={QuestionPageDocument} variables={{ id }}>
          {({ data }) => <QuestionScreen question={data.result} />}
        </Query>
      </div>
    </Layout>
  );
};

export default QuestionPage;
