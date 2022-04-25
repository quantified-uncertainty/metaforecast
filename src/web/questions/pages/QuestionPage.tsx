import { GetServerSideProps, NextPage } from "next";
import ReactMarkdown from "react-markdown";

import { Query } from "../../common/Query";
import { Card } from "../../display/Card";
import { QuestionFooter } from "../../display/DisplayQuestion/QuestionFooter";
import { Layout } from "../../display/Layout";
import { QuestionFragment } from "../../search/queries.generated";
import { ssrUrql } from "../../urql";
import { QuestionOptions } from "../components/QuestionOptions";
import { QuestionByIdDocument } from "../queries.generated";

interface Props {
  id: string;
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const [ssrCache, client] = ssrUrql();
  const id = context.query.id as string;

  const question =
    (await client.query(QuestionByIdDocument, { id }).toPromise()).data
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

const QuestionCardContents: React.FC<{ question: QuestionFragment }> = ({
  question,
}) => (
  <div className="space-y-4">
    <h1>
      <a
        className="text-black no-underline"
        href={question.url}
        target="_blank"
      >
        {question.title}
      </a>
    </h1>
    <QuestionFooter question={question} expandFooterToFullWidth={true} />
    <QuestionOptions options={question.options} />

    <ReactMarkdown linkTarget="_blank" className="font-normal">
      {question.description}
    </ReactMarkdown>
  </div>
);

const QuestionPage: NextPage<Props> = ({ id }) => {
  return (
    <Layout page="question">
      <div className="max-w-2xl mx-auto">
        <Card highlightOnHover={false}>
          <Query document={QuestionByIdDocument} variables={{ id }}>
            {({ data }) => <QuestionCardContents question={data.result} />}
          </Query>
        </Card>
      </div>
    </Layout>
  );
};

export default QuestionPage;
