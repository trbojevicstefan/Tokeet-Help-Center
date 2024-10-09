'use client';

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { fetchSearchResults } from '../utils/sanity/fetchSearchResults ';
import Link from 'next/link';
import SkeletonCard from '@/components/ui/skeletonCard'; // Import the SkeletonCard

interface ArticleType {
  _id: string;
  title: string;
  description: string;
  slug: string;
}

export default function SearchView() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || '';  // Get search query from the URL
  const [searchResults, setSearchResults] = useState<ArticleType[]>([]); // Use the correct type instead of any
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (query) {
      async function fetchResults() {
        setIsLoading(true);
        const results = await fetchSearchResults(query);
        setSearchResults(results);
        setIsLoading(false);
      }
      fetchResults();
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search results for &quot;{query}&quot;</h1>

        
        {isLoading ? (
          <div className="space-y-8">
            {/* Render 3 SkeletonCards for loading state */}
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="space-y-8">  {/* Display all articles in one column */}
            {searchResults.map((article) => (
              <div key={article._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <Link href={`/article/${article.slug}`} className="block">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 hover:underline">{article.title}</h2>
                  <p className="text-gray-600">{article.description}</p>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 py-4 text-center text-sm text-gray-600">
        Powered by Tokeet
      </footer>
    </div>
  );
}
