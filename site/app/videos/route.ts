import { NextRequest, NextResponse } from "next/server";
import { getVideoUrls } from "../page";

export async function GET(request: NextRequest) {
  // search by getting embeddings and then the nearest neighbours

  try {
    // get current videos
    console.log("Getting videos...");
    const videos = await getVideoUrls();
    console.log("Videos: ", videos);
    return NextResponse.json({ videos });
  } catch (err) {
    console.log(err);
  }
}
