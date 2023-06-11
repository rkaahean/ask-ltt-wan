"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Separator } from "./ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface SearchResults {
  summary?: string;
  references?: SearchReference[];
}

export interface SearchReference {
  id: string;
  line: string;
  timestamp: number;
  video_url: string;
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

  const getYoutubeVideos = async () => {
    // create a query to the API route
    const response = await fetch("/videos", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
    return response;
  };

  let videos;
  useEffect(() => {
    videos = getYoutubeVideos();
  });

  console.log("Videos client", videos);

  return (
    <div className="flex flex-col w-1/2 items-start">
      <SearchInput
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        handleSearchQuery={handleSearchQuery}
      />
      <Separator className="" />
      <SearchResults results={results} />
    </div>
  );
};

export const SearchInput = ({
  searchParams,
  setSearchParams,
  handleSearchQuery,
}: {
  searchParams: SearchQuery;
  setSearchParams: any;
  handleSearchQuery: any;
}) => {
  return (
    <div className="flex flex-col w-full mb-10 space-y-5">
      <div className="flex flex-row w-full items-center justify-center space-x-5">
        <Input
          className="w-full"
          value={searchParams.query}
          onChange={(e) =>
            setSearchParams({ ...searchParams, query: e.target.value })
          }
        />
        <Button onClick={handleSearchQuery}>Submit</Button>
      </div>
      <div className="flex flex-row w-1/2 justify-between">
        <Label htmlFor="similarity">Number of References</Label>
        <span className="text-muted-foreground">{searchParams.similarity}</span>
      </div>
      <div className="flex flex-row w-full">
        <Slider
          id="similarity"
          name="Reference"
          defaultValue={[3]}
          max={5}
          step={1}
          className="w-1/2 mr-2"
          aria-aria-label="Reference count"
          onValueChange={(e) =>
            setSearchParams({
              ...searchParams,
              similarity: e.at(0) as number,
            })
          }
        />
        <Select>
          <SelectTrigger className="w-1/2 ml-2">
            <SelectValue placeholder="Youtube Video?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

const SearchResults = ({ results }: { results: SearchResults }) => {
  const summaryLines = results.summary?.split("$SEP");
  const references = results.references;

  if (!summaryLines || !references) {
    return <div></div>;
  }
  return (
    <div className="flex flex-col w-full my-5 space-y-5">
      <div>
        <div className="text-2xl">Summary</div>
        {summaryLines?.map((line) => (
          <div className="italic">{line}</div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="text-2xl">References</div>
        {references?.map((ref) => (
          <ReferenceCard {...ref} />
        ))}
      </div>
    </div>
  );
};

const getVideoUrl = (url: string, timestamp: number) => {
  const roundedTimestamp = Math.floor(timestamp);
  return `${url}&t=${roundedTimestamp}`;
};

export const ReferenceCard = ({
  line,
  video_url,
  id,
  timestamp,
}: SearchReference) => {
  return (
    <Card key={id}>
      <CardHeader>
        <CardTitle>Context</CardTitle>
        <CardDescription>References to the youtube video...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="italic">{line}</div>
        <Button>
          <a href={getVideoUrl(video_url, timestamp)}>Youtube Link</a>
        </Button>
      </CardContent>
    </Card>
  );
};
