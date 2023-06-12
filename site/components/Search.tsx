"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Separator } from "./ui/separator";
import { Slider } from "./ui/slider";
import useSWR from "swr";

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
    similarity: 3,
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
    <div className="flex flex-col w-1/2 items-start">
      <SearchInput
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        handleSearchQuery={handleSearchQuery}
      />
      <Separator className="bg-stone-800" />
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
  const fetcher = (url: string) => fetch(url).then((res) => res.json());

  const { data, isLoading } = useSWR("/videos", fetcher);

  return (
    <div className="flex flex-col w-full mb-10 gap-10 text-stone-200">
      <div className="flex flex-row w-full items-center justify-center space-x-5">
        <Input
          className="bg-stone-900 w-full focus-visible:ring-1 focus-visible:ring-blue-400"
          value={searchParams.query}
          onChange={(e) =>
            setSearchParams({ ...searchParams, query: e.target.value })
          }
        />
        <Button onClick={handleSearchQuery}>Submit</Button>
      </div>
      {/* layout row */}
      <div className="flex flex-row w-full h-full">
        {/* split in 2:3 ratio */}
        <div className="w-1/3 mr-2 h-full">
          {/* layout the labels for slider + slider itself */}
          <div className="flex flex-col w-full justify-between gap-3">
            {/* layout the labels */}
            <div className="flex flex-row w-full justify-between">
              <Label htmlFor="similarity">Number of References</Label>
              <div className="text-muted-foreground">
                {searchParams.similarity}
              </div>
            </div>
            <Slider
              id="similarity"
              name="Reference"
              defaultValue={[3]}
              max={5}
              step={1}
              className="mr-2"
              aria-aria-label="Reference count"
              onValueChange={(e) =>
                setSearchParams({
                  ...searchParams,
                  similarity: e.at(0) as number,
                })
              }
            />
          </div>
        </div>
        {/* video selector */}
        <div className="w-2/3 ml-2">
          <Select>
            <SelectTrigger className="border-0 bg-stone-900">
              <SelectValue placeholder="Youtube Video?" />
            </SelectTrigger>
            <SelectContent>
              {!isLoading &&
                data.videos.map((video: any) => (
                  <SelectItem value={video.url} key={video.url}>
                    {video.title}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
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
    <div className="flex flex-col w-full my-5 space-y-5 text-stone-400">
      <div>
        <div className="text-2xl text-blue-300 font-semibold">Summary</div>
        {summaryLines?.map((line) => (
          <div className="italic">{line}</div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="text-2xl text-blue-300 font-semibold">References</div>
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
    <Card key={id} className="bg-stone-900 border-0 ring-0">
      <CardHeader>
        <CardTitle className="text-blue-200">Context</CardTitle>
        <CardDescription>References to the youtube video...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-stone-400">
        <div className="italic">{line}</div>
        <Button className="bg-orange-700 hover:bg-orange-800">
          <a href={getVideoUrl(video_url, timestamp)}>Youtube Link</a>
        </Button>
      </CardContent>
    </Card>
  );
};
