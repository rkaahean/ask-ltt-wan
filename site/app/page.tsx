// import pgvector from 'pgvector/utils'
import { PrismaClient } from '@prisma/client'

export default async function Home() {

  const embedding = getEmbedding("hello world");
  const prisma = new PrismaClient()

  const getNearestNeighbors = async (embedding: number[]) => {
    const neighbors = await prisma.$queryRaw`
      SELECT id, embedding::text, meta FROM docs ORDER BY embedding <-> ${embedding}::vector LIMIT 5
    `
    return neighbors;
  }
  const neighbors = await getNearestNeighbors(embedding);
  console.log(neighbors[0].meta);

  return (
    <main>
      <h1>Hello world</h1>
    </main>
  )
}


const getEmbedding = (line: string)=> {
  // get embedding from OpenAI

  // create a random array of 1536 numbers between -1 and 1  
  const embedding = Array.from({length: 1536}, () => Math.random() * 2 - 1);
  return embedding;
}