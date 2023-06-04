// import pgvector from 'pgvector/utils'
import { PrismaClient } from "@prisma/client";
import { Configuration, OpenAIApi } from "openai";

export default async function Home() {
  const embedding = await getEmbedding("What is the RTX 4060ti review about?") as number[];
  const prisma = new PrismaClient();

  const getNearestNeighbors = async (
    embedding: number[]
  ): Promise<Neighbour[]> => {
    const neighbors: Neighbour[] = await prisma.$queryRaw`
      SELECT id, embedding::text, meta FROM docs ORDER BY embedding <-> ${embedding}::vector LIMIT 5
    `;
    return neighbors;
  };
  const neighbors = await getNearestNeighbors(embedding);

  return (
    <main>
      <h1>Hello world</h1>
    </main>
  );
}

const getEmbedding = async (line: string) => {
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

export interface Neighbour {
  id: number;
  embedding: number[];
  meta: string;
}
