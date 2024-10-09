'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import Link from 'next/link';
import { fetchTopArticles, fetchHelpCategories } from "../utils/sanity/HelpCenterData";
import SkeletonCard from './ui/skeletonCard';  // Default import


interface Article {
  slug: string;
  title: string;
  description: string;
  link: string | null;
}

interface Category {
  slug: string;
  title: string;
  subCategoriesCount: number;
  articlesCount: number;
}

export function HelpcenterHomepageComponent() {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [topArticles, setTopArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch top 3 articles and categories
      const [articles, categories] = await Promise.all([fetchTopArticles(), fetchHelpCategories()]);
      setTopArticles(articles);
      setCategories(categories);
      setIsLoading(false);
    }
    fetchData();
  }, []);

  // Number of skeleton cards to show while loading
  const skeletonCards = [1, 2, 3];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Top Articles Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Top Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {isLoading ? (
              skeletonCards.map((_, idx) => <SkeletonCard key={idx} />)  // Render skeleton loaders while loading
            ) : (
              topArticles.map((article) => (
                <Card key={article.slug}>
                  <CardHeader>
                    <CardTitle>{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">{article.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/article/${article.slug}`} legacyBehavior>
                      <a className="rounded-full">READ MORE</a>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">Categories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {isLoading ? (
              skeletonCards.map((_, idx) => <SkeletonCard key={idx} />)  // Show skeleton loaders for categories as well
            ) : (
              categories.map((category) => (
                <Card key={category.slug}>
                  <CardHeader>
                    <CardTitle>{category.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      {category.subCategoriesCount} All Subcategories, {category.articlesCount} articles
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/category/${category.slug}`} legacyBehavior>
                      <a className="rounded-full">VIEW CATEGORY</a>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
