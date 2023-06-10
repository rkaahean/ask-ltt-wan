import json
import subprocess

# Load the JSON file
with open("scripts/videos.json") as json_file:
    videos = json.load(json_file)

for video in videos:
    url = video["url"]
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
