# Introduction
A web UI to search the LTT Wan show archive. Type in a topic that you think was mentioned, and specify a date range, you will get links to the occurrences where they were mentioned.

![CleanShot 2024-01-15 at 16 13 58](https://github.com/rkaahean/ask-ltt-wan/assets/16059999/a30d29ae-0298-477c-9ecb-239f33a41623)

See https://ask-ltt-wan.vercel.app to try it out!

# How it works

There were 3 main steps here

- Parsing podcast data: I used `whisper` to transcribe audio -> text, and then generated embeddings for them. I used `pgvector` as the embedding DB.
- Querying: When querying, I simply generate the embeddings of the query, and then get the K closest neighbours. `pgvector` has some helpful methods for this.
- Displaying: I used `NextJS` as my frontend / backend framework. Each query also returns links to the particular section in the youtube clip where the content was found, so the user can continue from there.
