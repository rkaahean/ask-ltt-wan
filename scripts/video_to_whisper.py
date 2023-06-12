import os
import subprocess

# load files in data/transcoded
files = os.listdir("data/transcoded")
# files already transcribed
transcribed = os.listdir("data/transcribed")
for file in files:
    if file + ".csv" in transcribed:
        print("Skipping " + file)
        continue
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
