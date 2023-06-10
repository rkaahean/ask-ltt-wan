import os
import subprocess

# load files in data/original
files = os.listdir("data/original")

# loop through files
for file in files:
    print(file)
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
