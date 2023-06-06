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
        "flex flex-col items-center justify-center h-screen w-screen gap-4"
      )}
    >
      <div className="text-4xl">Ask LTT WAN</div>
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
  embedding: number[]
): Promise<Neighbour[]> => {
  const neighbors: Neighbour[] = await prisma.$queryRaw`
    SELECT 
      id, 
      embedding::text, 
      meta, 
      line, 
      timestamp, 
      created_at 
    FROM 
      docs 
    ORDER BY 1 - (embedding <=> ${embedding}::vector) DESC LIMIT 2
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
            created_at
          FROM
            docs
          WHERE
            id = ${neighbour.id + 1}
            OR id = ${neighbour.id - 1}
          `
    );
    additionalNeighbours.push(...contextNeighbours);
  }
  additionalNeighbours.push(...neighbours);
  return additionalNeighbours;
};

export const getQuerySummary = async (neighbors: Neighbour[]) => {
  // concat all the lines in neighbours
  const lines = neighbors.map((n) => n.meta.line).join("\n");
  try {
    const config = new Configuration({
      apiKey: process.env.OPENAI_KEY as string,
    });

    const openai = new OpenAIApi(config);
    // ask chat gpt about query
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a bot that provides a detailed summary of the conversation from the WAN Show podcast with snippets of the conversation provided as context.",
        },
        { role: "user", content: lines },
        {
          role: "user",
          content: "Delimit each topic with $SEP. THIS IS VERY IMPORTANT.",
        },
      ],
    });
    // get the answer back
    const summary = response.data.choices[0].message?.content;
    return summary;
  } catch (err) {
    console.log(err);
  }
};
