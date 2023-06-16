"use client";

import { cn } from "@/lib/utils";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

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
  date: {
    from: Date;
    to: Date;
  };
  isLoading: boolean;
}

export const Search = () => {
  const [searchParams, setSearchParams] = useState<SearchQuery>({
    query: "",
    similarity: 3,
    explainability: 1,
    date: {
      from: addDays(new Date(), -90),
      to: new Date(),
    },
    isLoading: false,
  });
  const [results, setResults] = useState<SearchResults>({});

  const handleSearchQuery = async () => {
    // create a query to the API route
    setSearchParams({ ...searchParams, isLoading: true });
    const response = await fetch("/search", {
      method: "POST",
      body: JSON.stringify({ query: searchParams }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((res) => res.json());
    setSearchParams({ ...searchParams, isLoading: false });
    setResults(response);
  };

  return (
    <div className="flex flex-col w-full sm:w-1/2 items-start px-2">
      <SearchInput
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        setResults={setResults}
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
  setResults,
  handleSearchQuery,
}: {
  searchParams: SearchQuery;
  setSearchParams: any;
  setResults: any;
  handleSearchQuery: any;
}) => {
  return (
    <div className="flex flex-col w-full mb-10 gap-10 text-stone-200 items-center">
      <div className="flex flex-row w-full items-center justify-between space-x-5">
        <Button
          className="bg-red-900 hover:bg-red-950 text-xs sm:text-base"
          onClick={() => setSearchParams({ ...searchParams, query: "" })}
        >
          Clear
        </Button>
        <Input
          className={cn(
            "bg-stone-900 w-full focus-visible:ring-1 focus-visible:ring-orange-900 text-xs sm:text-base",
            "text-orange-500"
          )}
          value={searchParams.query}
          onChange={(e) => {
            setResults({});
            setSearchParams({ ...searchParams, query: e.target.value });
          }}
          placeholder="What is the RTX4060ti review about?"
        />
        <Button
          className="bg-orange-700 hover:bg-orange-800"
          onClick={handleSearchQuery}
          disabled={searchParams.query.length === 0}
        >
          {searchParams.isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          Submit
        </Button>
      </div>
      <div className="w-1/2 h-full">
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
            aria-label="Reference count"
            onValueChange={(e) =>
              setSearchParams({
                ...searchParams,
                similarity: e.at(0) as number,
              })
            }
          />
        </div>
      </div>
      <div
        className={cn(
          "flex flex-col items-center gap-3 w-full",
          "text-xs sm:text-base"
        )}
      >
        <div className="text-stone-600 italic text-xs sm:text-sm">
          Date range to search for?
        </div>
        <Tabs
          defaultValue="last-3m"
          className="rounded-lg"
          onValueChange={(e) => {
            let lookback: number;
            switch (e) {
              case "last-m":
                lookback = 30;
                break;
              case "last-3m":
                lookback = 90;
                break;
              case "last-year":
                lookback = 365;
                break;
              case "all-time":
                lookback = 365 * 20;
                break;
              default:
                lookback = 30;
            }
            setSearchParams({
              ...searchParams,
              date: {
                from: addDays(new Date(), -lookback),
                to: new Date(),
              },
            });
          }}
        >
          <TabsList className="bg-black text-orange-500">
            <TabsTrigger value="last-m">Last Month</TabsTrigger>
            <TabsTrigger value="last-3m">Last 3 Months</TabsTrigger>
            <TabsTrigger value="last-year">Last Year</TabsTrigger>
            <TabsTrigger value="all-time">All time</TabsTrigger>
          </TabsList>
        </Tabs>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                "text-xs sm:text-base",
                "w-1/2",
                !searchParams.date && "text-muted-foreground",
                "bg-stone-800 hover:bg-stone-900 border-none hover:text-stone-200"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {searchParams?.date.from ? (
                searchParams.date.to ? (
                  <>
                    {format(searchParams.date.from, "LLL dd, y")} -{" "}
                    {format(searchParams.date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(searchParams.date.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={searchParams?.date.from}
              selected={searchParams.date}
              onSelect={(date) => {
                console.log("Setting date...", date);
                setSearchParams({
                  ...searchParams,
                  date: {
                    from: date?.from,
                    to: date?.to,
                  },
                });
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
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
