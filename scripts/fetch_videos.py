import youtube_dl
import json


def get_playlist_videos(playlist_url):
    ydl_opts = {
        "ignoreerrors": True,
        "extract_flat": "in_playlist",
    }

    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        info_dict = ydl.extract_info(playlist_url, download=False)
        videos = []
        for entry in info_dict["entries"]:
            # print(info_dict)
            video_title = entry["title"]
            # lower case video title should contain wan show
            if "wan show" not in video_title.lower():
                continue
            
            video_url = "https://www.youtube.com/watch?v=" + entry["url"]
            videos.append({"title": video_title, "url": video_url})

        return videos[:10]


if __name__ == "__main__":
    playlist_url = (
        "https://www.youtube.com/playlist?list=PL8mG-RkN2uTw7PhlnAr4pZZz2QubIbujH"
    )
    videos = get_playlist_videos(playlist_url)
    # save videos to json file

    with open("data/videos.json", "w") as f:
        json.dump(videos, f)
