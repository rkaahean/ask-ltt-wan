import os
import subprocess

# load files in data/transcoded
files = os.listdir("data/transcoded")
for file in files[:2]:
    print("Whispering " + file)
    command = [
        "./../whisper.cpp/main",
        "-m",
        "../whisper.cpp/models/ggml-base.en.bin",
        "-f",
        "data/transcoded/" + file,
        "--output-csv",
    ]
    subprocess.run(command)
