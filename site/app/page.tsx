// import pgvector from 'pgvector/utils'
import { Search } from "@/components/Search";
import { PrismaClient } from "@prisma/client";
import classNames from "classnames";
import { Configuration, OpenAIApi } from "openai";

const prisma = new PrismaClient();

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
    SELECT id, embedding::text, meta FROM docs ORDER BY embedding <-> ${embedding}::vector LIMIT 5
  `;
    return neighbors;
};

export interface Neighbour {
    id: number;
    embedding: number[];
    meta: string;
}
