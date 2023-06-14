// import pgvector from 'pgvector/utils'
import { Search, SearchQuery } from "@/components/Search";
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
  title: string;
  video_url: string;
  created_at: Date;
}

export default async function Home() {
  return (
    <main
      className={classNames(
        "flex flex-col items-center justify-start min-h-screen w-screen gap-4",
        "mx-4 sm:mx-0"
      )}
    >
      <div className="text-4xl text-orange-500 font-bold tracking-widest">
        ask-wan
      </div>
      <div className="italic text-stone-500 mb-3 sm:mb-10">
        Ask questions regarding conversations in the WAN show.
        <br />
        You can find the full list of trasnscribed videos{" "}
        <a
          href="https://github.com/rkaahean/ask-ltt-wan/tree/main/data/transcribed"
          target="_blank"
          className="text-orange-500 hover:text-orange-600 font-bold"
        >
          here.
        </a>
      </div>
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
  params: SearchQuery
): Promise<Neighbour[]> => {
  const neighbors: Neighbour[] = await prisma.$queryRaw`
    SELECT 
      docs.id, 
      embedding::text, 
      meta, 
      line, 
      video_url,
      videos.title as title,
      timestamp, 
      docs.created_at 
    FROM 
      docs 
      left join videos
        on docs.video_url = videos.url
    WHERE 
      videos.video_uploaded_at >= TO_DATE(${params.date.from}, 'YYYY-MM-DD')
      AND videos.video_uploaded_at <= TO_DATE(${params.date.to}, 'YYYY-MM-DD')
    ORDER BY 1 - (embedding <=> ${embedding}::vector) DESC LIMIT ${params.similarity}
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
  const distinctVideoUrls = await prisma.videos.findMany({
    select: {
      title: true,
      url: true,
    },
    distinct: ["url"],
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
