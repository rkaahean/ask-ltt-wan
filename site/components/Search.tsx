"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";

interface SearchResults {
  summary?: string;
  references?: {
    id: string;
    line: string;
    timestamp: number;
    video_url: string;
  }[];
}

export interface SearchQuery {
  query: string;
  similarity: number;
  explainability: number;
}

export const Search = () => {
  const [searchParams, setSearchParams] = useState<SearchQuery>({
    query: "",
    similarity: 2,
    explainability: 1,
  });
  const [results, setResults] = useState<SearchResults>({});

  const handleSearchQuery = async () => {
    // create a query to the API route
    const response = await fetch("/search", {
      method: "POST",
      body: JSON.stringify({ query: searchParams }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
    setResults(response);
  };

  return (
    <div className="flex flex-col w-1/2 items-center justify-center gap-3">
      <div className="flex flex-row w-full items-center justify-center gap-3">
        <Input
          className="w-full"
          value={searchParams.query}
          onChange={(e) =>
            setSearchParams({ ...searchParams, query: e.target.value })
          }
        />
        <Button onClick={handleSearchQuery}>Submit</Button>
      </div>
      <Label htmlFor="similarity">{searchParams.similarity}</Label>
      <Slider
        id="similarity"
        defaultValue={[1]}
        max={5}
        step={1}
        className="w-1/2"
        onValueChange={(e) =>
          setSearchParams({
            ...searchParams,
            similarity: e.at(0) as number,
          })
        }
      />
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
