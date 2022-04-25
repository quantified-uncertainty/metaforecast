import React from "react";
import { TypedDocumentNode, useQuery } from "urql";

import { Spinner } from "./Spinner";

type Props<Variables extends object, Data> = {
  document: TypedDocumentNode<Data, Variables>;
  variables?: Variables;
  children: ({ data }: { data: Data }) => React.ReactElement | null;
};

export function Query<Variables extends Object, Data>({
  document,
  variables,
  children,
}: Props<Variables, Data>): React.ReactElement | null {
  const [result] = useQuery({
    query: document,
    variables,
  });

  const { data, fetching, error } = result;

  if (fetching) {
    return (
      <p>
        <Spinner />
      </p>
    );
  }

  if (error) {
    return (
      <p>
        <b>Internal error:</b> {error.message}
      </p>
    );
  }

  if (!data) {
    return (
      <p>
        <b>Internal error</b>
      </p>
    );
  }

  return children({ data });
}
