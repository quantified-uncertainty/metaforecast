import { GetServerSideProps, NextPage } from "next";
import NextError from "next/error";
import ReactMarkdown from "react-markdown";

import { Card } from "../../common/Card";
import { CopyParagraph } from "../../common/CopyParagraph";
import { Layout } from "../../common/Layout";
import { LineHeader } from "../../common/LineHeader";
import { Query } from "../../common/Query";
import { QuestionWithHistoryFragment } from "../../fragments.generated";
import { ssrUrql } from "../../urql";
import { getBasePath } from "../../utils";
import { CaptureQuestion } from "../components/CaptureQuestion";
import { IndicatorsTable } from "../components/IndicatorsTable";
import { QuestionChartOrVisualization } from "../components/QuestionChartOrVisualization";
import { QuestionInfoRow } from "../components/QuestionInfoRow";
import { QuestionTitle } from "../components/QuestionTitle";
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
}> = ({ question }) => {
  return (
    <Card highlightOnHover={false} large={true}>
      <QuestionTitle question={question} />

      <div className="mb-5 mt-5">
        <QuestionInfoRow question={question} />
      </div>

      <div className="mb-10">
        <QuestionChartOrVisualization question={question} />
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
        <div className="mt-5">
          <Section title="Indicators">
            <IndicatorsTable question={question} />
          </Section>
        </div>
      </div>
    </Card>
  );
};
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
      <LineHeader>
        <h1>Embed</h1>
      </LineHeader>
      <div className="max-w-md mx-auto">
        <CopyParagraph
          text={`<iframe src="${
            getBasePath() + `/questions/embed/${question.id}`
          }" height="600" width="600" frameborder="0" />`}
          buttonText="Copy HTML"
        />
      </div>
    </div>
  </div>
);

const QuestionPage: NextPage<Props> = ({ id }) => {
  return (
    <Layout page="question">
      <div className="max-w-4xl mx-auto">
        <Query document={QuestionPageDocument} variables={{ id }}>
          {({ data }) =>
            data.result ? (
              <QuestionScreen question={data.result} />
            ) : (
              <NextError statusCode={404} />
            )
          }
        </Query>
      </div>
    </Layout>
  );
};

export default QuestionPage;
