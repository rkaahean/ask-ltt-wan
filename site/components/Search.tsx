"use client";

import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "path";
import { useState } from "react";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Separator } from "./ui/separator";
import { Slider } from "./ui/slider";

interface SearchResults {
  summary?: string;
  references?: SearchReference[];
}

export interface SearchReference {
  id: string;
  line: string;
  timestamp: number;
  title: string;
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
    <div className="flex flex-col w-full sm:w-1/2 items-start">
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
  const [date, setDate] = useState<Date>();

  return (
    <div className="flex flex-col w-full mb-10 gap-10 text-stone-200">
      <div className="flex flex-row w-full items-center justify-center space-x-5">
        <Input
          className="bg-stone-900 w-full focus-visible:ring-1 focus-visible:ring-blue-400 text-xs sm:text-base"
          value={searchParams.query}
          onChange={(e) =>
            setSearchParams({ ...searchParams, query: e.target.value })
          }
          placeholder="What is the RTX4060ti review about?"
        />
        <Button
          className="bg-orange-700 hover:bg-orange-800"
          onClick={handleSearchQuery}
        >
          Submit
        </Button>
      </div>
      {/* layout row */}
      <div className="flex flex-row w-full h-full justify-between">
        {/* split in 2:3 ratio */}
        <div className="w-1/3 mr-2 h-full">
          {/* layout the labels for slider + slider itself */}
          <div className="flex flex-col w-full justify-between gap-3">
            {/* layout the labels */}
            <div className="flex flex-row w-full justify-between text-xs sm:text-base">
              <Label htmlFor="similarity" className="text-xs sm:text-sm">
                Number of References
              </Label>
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
        <div className="w-1/3 ml-2 text-xs sm:text-base text-stone-200 bg-stone-800">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal text-stone-200",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-stone-200" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
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
        <div className="text-2xl text-stone-300 font-semibold">Summary</div>
        {summaryLines?.map((line) => (
          <div className="italic text-sm sm:text-base">{line}</div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="text-2xl font-semibold text-stone-300">References</div>
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
  title,
  timestamp,
}: SearchReference) => {
  return (
    <Card key={id} className="bg-stone-900 border-0 ring-0">
      <CardHeader>
        <CardTitle className="text-stone-300">Context</CardTitle>
        <CardDescription className="text-orange-600">{title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-stone-400 text-sm sm:text-base">
        <div className="italic">{line}</div>
        <Button className="bg-orange-700 hover:bg-orange-800">
          <a href={getVideoUrl(video_url, timestamp)} target="_blank">
            Youtube Link
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};
