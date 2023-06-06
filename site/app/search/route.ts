import { NextRequest, NextResponse } from "next/server";
import {
  getAdditionalNeighbours,
  getEmbedding,
  getNearestNeighbors,
  getQuerySummary,
} from "../page";
import { SearchQuery } from "@/components/Search";

export async function POST(request: NextRequest) {
  // search by getting embeddings and then the nearest neighbours

  // add SearchParams type to NextRequest
  const { query }: { query: SearchQuery } = await request.json();
  try {
    // get embedding for line
    console.log("Getting embedding...");
    const embedding = (await getEmbedding(query.query)) as number[];
    // get nearest neighbors
    console.log("Getting neighbours...");
    let nearestNeighbors = await getNearestNeighbors(
      embedding,
      query.similarity
    );
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
