import { GetServerSideProps, NextPage } from "next";
import NextError from "next/error";

import { Query } from "../../common/Query";
import { ssrUrql } from "../../urql";
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

const EmbedQuestionPage: NextPage<Props> = ({ id }) => {
  return (
    <div className="bg-white min-h-screen">
      <Query document={QuestionPageDocument} variables={{ id }}>
        {({ data: { result: question } }) =>
          question ? (
            <div className="flex flex-col p-4 ">
              <QuestionTitle question={question} linkToMetaforecast={true} />

              <div className="mb-5 mt-5">
                <QuestionInfoRow question={question} />
              </div>

              <div className="mb-10">
                <QuestionChartOrVisualization question={question} />
              </div>
            </div>
          ) : (
            <NextError statusCode={404} />
          )
        }
      </Query>
    </div>
  );
};

export default EmbedQuestionPage;
