import { NextResponse } from "next/server";
import { getEmbedding, getNearestNeighbors, getQuerySummary } from "../page";

export async function POST(request: Request) {
  // search by getting embeddings and then the nearest neighbours

  const { query } = await request.json();
  try {
    // get embedding for line
    console.log("Getting embedding...");
    const embedding = (await getEmbedding(query)) as number[];
    // get nearest neighbors
    console.log("Getting neighbours...");
    let nearestNeighbors = await getNearestNeighbors(embedding);
    // get more context around the lines just recevied
    console.log("Getting additional neighbours...");
    // nearestNeighbors = await getAdditionalNeighbours(nearestNeighbors);
    // feed the input to open AI for summarization
    console.log("Getting summary...");
    const summary = await getQuerySummary(nearestNeighbors);
    const references = nearestNeighbors.map((neighbor) => {
      return {
        id: neighbor.id,
        line: neighbor.line,
        timestamp: neighbor.timestamp,
        video_url: neighbor.video_url,
      };
    });
    return NextResponse.json({ summary, references });
  } catch (err) {
    console.log(err);
  }
}
