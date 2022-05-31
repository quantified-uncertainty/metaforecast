import { GetServerSideProps, NextPage } from "next";
import NextError from "next/error";
import ReactMarkdown from "react-markdown";
import { BoxedLink } from "../../common/BoxedLink";
import { Card } from "../../common/Card";
import { CopyParagraph } from "../../common/CopyParagraph";
import { Layout } from "../../common/Layout";
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
  <div className="space-y-4 flex flex-col items-start">
    <div className="border-b-2 border-gray-200 w-full">
      <h2 className="text-xl leading-3 text-gray-900">{title}</h2>
    </div>
    <div>{children}</div>
  </div>
);

const EmbedSection: React.FC<{ question: QuestionWithHistoryFragment }> = ({
  question,
}) => {
  const url = getBasePath() + `/questions/embed/${question.id}`;
  return (
    <Section title="Embed">
      <div className="mb-2">
        <BoxedLink url={url} size="small">
          Preview
        </BoxedLink>
      </div>
      <CopyParagraph
        text={`<iframe src="${url}" height="600" width="600" frameborder="0" />`}
        buttonText="Copy HTML"
      />
    </Section>
  );
};

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

      <div className="mx-auto max-w-prose space-y-8">
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
        <Section title="Capture">
          <CaptureQuestion question={question} />
        </Section>
        <EmbedSection question={question} />
      </div>
    </Card>
  );
};

const QuestionPage: NextPage<Props> = ({ id }) => {
  return (
    <Layout page="question">
      <div className="max-w-4xl mx-auto">
        <Query document={QuestionPageDocument} variables={{ id }}>
          {({ data }) =>
            data.result ? (
              <LargeQuestionCard question={data.result} />
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
