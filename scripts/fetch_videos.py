import youtube_dl
import json
from datetime import datetime


def get_playlist_videos(playlist_url):
    ydl_opts = {
        "ignoreerrors": True,
        "extract_flat": "in_playlist",
    }

    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(playlist_url, download=False)
        videos = []
        for entry in info_dict["entries"]:
            video_title = entry["title"]
            # lower case video title should contain wan show
            if "wan show" not in video_title.lower():
                continue
            # upload date
            date_string = video_title.replace("WAN Show", "").split("-")[-1].strip()
            formats = ["%b %d, %Y", "%B %d, %Y"]  # List of possible format strings
            for format_str in formats:
                try:
                    upload_date = datetime.strptime(
                        date_string, format_str
                    )  # Attempt to convert the date string
                    break
                except ValueError:
                    continue

            video_url = "https://www.youtube.com/watch?v=" + entry["url"]
            videos.append(
                {
                    "title": video_title,
                    "url": video_url,
                    "upload_date": upload_date.strftime("%Y-%m-%d"),
                }
            )

        return videos[:10]


if __name__ == "__main__":
    playlist_url = (
        "https://www.youtube.com/playlist?list=PL8mG-RkN2uTw7PhlnAr4pZZz2QubIbujH"
    )
    videos = get_playlist_videos(playlist_url)
    # save videos to json file
    with open("data/videos.json", "w") as f:
        json.dump(videos, f)
