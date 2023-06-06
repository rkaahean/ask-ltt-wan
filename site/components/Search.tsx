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
  console.log("Summary lines", summaryLines);
  return (
    <div className="flex flex-col w-full gap-3">
      {summaryLines?.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  );
};
