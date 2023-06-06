"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SearchResults {
  summary?: string;
  references?: {
    id: string;
    line: string;
    timestamp: number;
    video_url: string;
  }[];
}

export const Search = () => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<SearchResults>({});

  const handleSearchQuery = async () => {
    // create a query to the API route
    const response = await fetch("/search", {
      method: "POST",
      body: JSON.stringify({ query }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
    setResults(response);
  };

  return (
    <div className="flex flex-col w-1/2 items-center justify-center">
      <div className="flex flex-row w-full items-center justify-center gap-3">
        <Input
          className="w-full"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button onClick={handleSearchQuery}>Submit</Button>
      </div>
      <SearchResults results={results} />
    </div>
  );
};

const SearchResults = ({ results }: { results: SearchResults }) => {
  const summaryLines = results.summary?.split("$SEP");
  const references = results.references;
  return (
    <div className="flex flex-col w-full gap-3">
      {summaryLines?.map((line) => (
        <div>{line}</div>
      ))}
      {references?.map((ref) => (
        <div key={ref.id}>
          <div>{ref.line}</div>
          <a href={getVideoUrl(ref.video_url, ref.timestamp)}>Youtube Link</a>
        </div>
      ))}
    </div>
  );
};

const getVideoUrl = (url: string, timestamp: number) => {
  const roundedTimestamp = Math.floor(timestamp);
  return `${url}&t=${roundedTimestamp}`;
};
