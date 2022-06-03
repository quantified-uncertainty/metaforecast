import axios from "axios";
import { prisma } from "../database/prisma";
import { Platform } from "../platforms";

// type Context = Prisma.JsonObject; // untyped for now, might become a generic in the future

export type RobotJob<Context> = {
  context: Context;
  fetch: () => Promise<unknown>;
  done: () => Promise<void>;
};

export type Robot<Context> = {
  nextJob: () => Promise<RobotJob<Context> | undefined>;
  schedule: (args: { url: string; context?: Context }) => Promise<void>;
};

export const getRobot = <Context>(
  platform: Platform<any, Context>
): Robot<Context> => {
  return {
    async nextJob() {
      const jobData = await prisma.robot.findFirst({
        where: {
          platform: platform.name,
          completed: {
            equals: null,
          },
          scheduled: {
            lte: new Date(),
          },
        },
        orderBy: {
          created: "asc",
        },
      });
      if (!jobData) {
        return;
      }
      await prisma.robot.update({
        where: {
          id: jobData?.id,
        },
        data: {
          tried: jobData.tried + 1,
        },
      });

      const job: RobotJob<Context> = {
        context: jobData.context as Context,
        async fetch() {
          const data = await axios.get(jobData.url);
          return data.data;
        },
        async done() {
          await prisma.robot.update({
            where: {
              id: jobData.id,
            },
            data: {
              completed: new Date(),
            },
          });
        },
      };
      return job;
    },

    async schedule({ url, context = {} }) {
      const now = new Date();
      await prisma.robot.create({
        data: {
          url,
          platform: platform.name,
          created: now,
          scheduled: now,
          context,
        },
      });
    },
  };
};
