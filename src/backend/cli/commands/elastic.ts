import { Command } from "@commander-js/extra-typings";

import { rebuildElasticDatabase } from "@/backend/utils/elastic";

export function addElasticCommand(program: Command) {
  program
    .command("elastic")
    .description("Rebuild Elasticsearch database")
    .action(async () => {
      await rebuildElasticDatabase();
    });
}
