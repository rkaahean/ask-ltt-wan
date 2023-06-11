// import pgvector from 'pgvector/utils'
import { Search } from "@/components/Search";
import { Prisma, PrismaClient } from "@prisma/client";
import classNames from "classnames";
import { Configuration, OpenAIApi } from "openai";

const prisma = new PrismaClient();

export interface Neighbour {
  id: number;
  embedding: number[];
  meta: {
    line: string;
    start_time: number;
  };
  timestamp: number;
  line: string;
  video_url: string;
  created_at: Date;
}

export default async function Home() {
  return (
    <main
      className={classNames(
        "flex flex-col items-center justify-start h-screen w-screen gap-4",
        "my-5"
      )}
    >
      <div className="text-4xl mb-10">ask-wan</div>
      <Search />
    </main>
  );
}

export const getEmbedding = async (line: string) => {
  try {
    const config = new Configuration({
      apiKey: process.env.OPENAI_KEY as string,
    });

    const openai = new OpenAIApi(config);
    // ask chat gpt about query
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: line,
    });
    // get the answer back
    const embedding = response.data.data[0].embedding;

    return embedding;
  } catch (err) {
    console.log(err);
  }
};

export const getNearestNeighbors = async (
  embedding: number[],
  similarity: number
): Promise<Neighbour[]> => {
  const neighbors: Neighbour[] = await prisma.$queryRaw`
    SELECT 
      id, 
      embedding::text, 
      meta, 
      line, 
      video_url,
      timestamp, 
      created_at 
    FROM 
      docs 
    ORDER BY 1 - (embedding <=> ${embedding}::vector) DESC LIMIT ${similarity}
  `;
  return neighbors;
};

export const getAdditionalNeighbours = async (
  neighbours: Neighbour[]
): Promise<Neighbour[]> => {
  /**
   * For every neighbour, get the line immediately before and after it
   */
  const additionalNeighbours: Neighbour[] = [];
  // iterate through neighbours for more context
  console.log("Number of neighbours: ", neighbours.length);
  for (const neighbour of neighbours) {
    console.log("Fetching info for neighbour...", neighbour.id);
    const contextNeighbours: Neighbour[] = await prisma.$queryRaw(
      Prisma.sql`
          SELECT
            id,
            embedding::text,
            meta,
            line,
            timestamp,
            video_url,
            created_at
          FROM
            docs
          WHERE
            id = ${neighbour.id - 1}
          `
    );
    additionalNeighbours.push(...contextNeighbours);
  }
  additionalNeighbours.push(...neighbours);
  return additionalNeighbours;
};

export const getVideoUrls = async () => {
  const distinctVideoUrls = await prisma.docs.findMany({
    select: {
      video_url: true,
    },
    distinct: ["video_url"],
  });
  return distinctVideoUrls;
};

export const getQuerySummary = async (neighbors: Neighbour[]) => {
  // concat all the lines in neighbours
  const lines = neighbors.map((n) => n.line).join("\n");
  try {
    const config = new Configuration({
      apiKey: process.env.OPENAI_KEY as string,
    });
    console.log("Summarizing...", lines);
    const openai = new OpenAIApi(config);
    // ask chat gpt about query
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a bot that provides information regarding the WAN show from the Linus Tech Tips channel on YouTube.",
        },
        {
          role: "user",
          content: "Provide a summary the conversation below.",
        },
        { role: "user", content: lines },
      ],
    });
    // get the answer back
    const summary = response.data.choices[0].message?.content;
    return summary;
  } catch (err) {
    console.log(err);
  }
};
