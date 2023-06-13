import json
import subprocess
import os

# Load the JSON file
with open("data/videos.json") as json_file:
    videos = json.load(json_file)

# already downloaded folder
downloaded = os.listdir("data/original")
for video in videos:
    url = video["url"]
    title = video["title"]
    if title + ".wav" in downloaded:
        print("Skipping " + title)
        continue
    command = [
        "yt-dlp",
        "-x",
        "--audio-quality",
        "5",
        "--audio-format",
        "wav",
        "--output",
        "data/original/%(title)s.%(ext)s",
        url,
    ]
    subprocess.run(command)
