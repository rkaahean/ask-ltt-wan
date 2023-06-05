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
        const nearestNeighbors = await getNearestNeighbors(embedding);
        // feed the input to open AI for summarization
        const summary = await getQuerySummary(nearestNeighbors);
        const references = nearestNeighbors.map((neighbor) => {
            return {
                "id": neighbor.id,
                "line": neighbor.meta.line,
                "timestamp": neighbor.meta.start_time,
            }
        })
        return NextResponse.json({summary, references});
    } catch (err) {
        console.log(err);
    }
}
