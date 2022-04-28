import { GetServerSideProps, NextPage } from "next";
import ReactMarkdown from "react-markdown";

import { Query } from "../../common/Query";
import { Card } from "../../display/Card";
import { QuestionFooter } from "../../display/DisplayQuestion/QuestionFooter";
import { Layout } from "../../display/Layout";
import { QuestionWithHistoryFragment } from "../../fragments.generated";
import { ssrUrql } from "../../urql";
import { HistoryChart } from "../components/HistoryChart";
import { QuestionOptions } from "../components/QuestionOptions";
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
  <div className="grid grid-cols-1 space-y-4 place-items-center">
    <h1 className="text-4xl place-self-center w-full text-center mt-10">
      <a
        className="text-black no-underline"
        href={question.url}
        target="_blank"
      >
        {question.title}
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

    <h1 className="pt-10 text-xl place-self-center w-full text-center ">
      {"Question description"}
    </h1>

    <ReactMarkdown linkTarget="_blank" className="font-normal w-9/12">
      {question.description}
    </ReactMarkdown>
  </div>
);

const QuestionPage: NextPage<Props> = ({ id }) => {
  return (
    <Layout page="question">
      <div className="max-w-4xl mx-auto">
        <Card highlightOnHover={false}>
          <Query document={QuestionPageDocument} variables={{ id }}>
            {({ data }) => <QuestionCardContents question={data.result} />}
          </Query>
        </Card>
      </div>
    </Layout>
  );
};

export default QuestionPage;
