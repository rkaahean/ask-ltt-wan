import os
import subprocess

# load files in data/original
files = os.listdir("data/original")
# load files in data/transcoded
transcoded = os.listdir("data/transcoded")

# loop through files
for file in files:
    # if file is already transcoded, skip
    if file in transcoded:
        print("Skipping " + file)
        continue
    command = [
        "ffmpeg",
        "-i",
        f"data/original/{file}",
        "-ar",
        "16000",
        "-ac",
        "1",
        "-c:a",
        "pcm_s16le",
        f"data/transcoded/{file}",
    ]
    subprocess.run(command)
