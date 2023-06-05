"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export const Search = () => {
    const [query, setQuery] = useState<string>("");
    const [results, setResults] = useState<SearchResults[]>([]);

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

    console.log(results);
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

const SearchResults = ({ results }: { results: SearchResults[] }) => {
    return (
        <div className="flex flex-col w-full gap-3">
            {results.map((result) => (
                <div className="flex flex-col w-full gap-3" key={result.id}>
                    <div>{result.meta.line}</div>
                    <div>{result.id}</div>
                </div>
            ))}
        </div>
    );
};

interface SearchResults {
    id: number;
    meta: {
        line: string;
        start_time: number;
    };
    embedding: number[];
}
