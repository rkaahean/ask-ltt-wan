import { NextResponse } from "next/server";
import { getEmbedding, getNearestNeighbors } from "../page";

export async function POST(request: Request) {
    // search by getting embeddings and then the nearest neighbours

    const { query } = await request.json();
    try {
        // get embedding for line
        console.log("Getting embedding...");
        const embedding = (await getEmbedding(query)) as number[];
        // get nearest neighbors
        const nearestNeighbors = await getNearestNeighbors(embedding);
        return NextResponse.json(nearestNeighbors);
    } catch (err) {
        console.log(err);
    }
}
