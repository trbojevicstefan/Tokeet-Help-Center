'use client';

import { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import Link from 'next/link';
import { fetchSearchResults } from '../utils/sanity/fetchSearchResults ';

// Define the type for suggestion
interface Suggestion {
  _id: string;
  title: string;
  description: string;
  snippet?: string; // Allowing snippet to be undefined
  slug: string;
}

export default function HeaderComponent() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim()) {
        setDebouncedQuery(searchQuery.trim());
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleSearch = async (query: string) => {
      const results = await fetchSearchResults(query);
      setSuggestions(results); // This should now work without error
    };

    if (debouncedQuery) {
      handleSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setSelectedIndex((prevIndex) => (prevIndex + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      setSelectedIndex((prevIndex) => (prevIndex - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        window.location.href = `/article/${suggestions[selectedIndex].slug}`;
      } else {
        window.location.href = `/search?query=${searchQuery}`;
      }
    }
  };

  const handleClickSuggestion = (slug: string) => {
    window.location.href = `/article/${slug}`;
  };

  const highlightKeyword = (snippet: string, keyword: string) => {
    if (!keyword.trim()) return snippet;

    const regex = new RegExp(`(${keyword})`, 'gi');
    const parts = snippet.split(regex);

    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 font-semibold">{part}</span>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  return (
    <header className="relative z-50 bg-[#EFF2F5]"> {/* Ensure high z-index for the header */}
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/">
          <Image src="https://cdn.tokeet.com/images/WhiteBackground_Logo_md.png" alt="Tokeet Logo" width={120} height={40} />
        </Link>
        <nav>
          <Link href="https:///www.tokeet.com" className="text-gray-600 hover:text-gray-900 mx-2">TOKEET.COM</Link>
          <Link href="https://www.tokeet.com/community/" className="text-gray-600 hover:text-gray-900 mx-2">COMMUNITY</Link>
          <Link href="https://app.tokeet.com/login" className="text-gray-600 hover:text-gray-900 mx-2">LOGIN</Link>
          <Button variant="outline" className="ml-4 rounded-full">CONTACT</Button>
        </nav>
      </div>
      <div className="relative bg-[#EFF2F5] overflow-visible">
        <div className="absolute inset-0">
          <svg className="absolute bottom-0 w-full h-48 text-gray-50" viewBox="0 0 1440 320" fill="currentColor" preserveAspectRatio="none">
            <path d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,250.7C1248,256,1344,288,1392,304L1440,320L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
        <div className="container mx-auto px-4 py-16 relative z-20">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">How can we help you?</h1>
            <div className="relative">
              <Input
                type="search"
                placeholder="Help me with..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-white pr-10 rounded-full shadow-md"
              />
              <Button className="absolute right-0 top-0 bottom-0 rounded-full" onClick={() => (window.location.href = `/search?query=${searchQuery}`)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Button>

              {suggestions.length > 0 && (
                <ul className="absolute bg-white border rounded-md mt-2 w-full z-30 shadow-md max-h-60 overflow-y-auto hide-scrollbar"> {/* Adjusted z-30 */}
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={suggestion._id}
                      className={`p-2 hover:bg-gray-200 ${selectedIndex === index ? 'bg-gray-300' : ''}`}
                      onClick={() => handleClickSuggestion(suggestion.slug)}
                    >
                      <div className="font-semibold">{suggestion.title}</div>
                      <div className="text-sm text-gray-600">{suggestion.description}</div>
                      <div className="text-sm text-gray-600">{suggestion.snippet}</div>
                      <div className="text-sm text-gray-600">
                        {highlightKeyword(suggestion.snippet || '', searchQuery)}
                        <hr className="my-2" /> {/* Divider between results */}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
