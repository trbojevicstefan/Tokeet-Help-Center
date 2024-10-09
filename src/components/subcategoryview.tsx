'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { fetchSubcategoryData } from "../utils/sanity/HelpCenterData";
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from './Breadcrumbs'; // Import Breadcrumbs component
import SkeletonCard from './ui/skeletonCard'; // Import SkeletonCard component

interface Article {
  slug: string;
  title: string;
  description: string;
}

interface SubcategoryData {
  title: string;
  articles: Article[];
  category: { slug: string; title: string }; // Parent category info
}

export default function SubcategoryViewComponent() {
  const { slug } = useParams(); // Get the subcategory slug from the URL
  const [articles, setArticles] = useState<Article[]>([]);
  const [subcategoryTitle, setSubcategoryTitle] = useState<string>('');
  const [parentCategory, setParentCategory] = useState<{ slug: string; title: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const subcategorySlug = Array.isArray(slug) ? slug[0] : slug; // Ensure slug is a string

    if (typeof subcategorySlug === 'string') {
      async function fetchData() {
        // Fetch data for the specific subcategory using slug
        const subcategoryData: SubcategoryData = await fetchSubcategoryData(subcategorySlug);
        setSubcategoryTitle(subcategoryData.title);
        setArticles(subcategoryData.articles);
        setParentCategory(subcategoryData.category); // Set parent category
        setIsLoading(false);
      }
      fetchData();
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs Container Aligned */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs
          category={parentCategory ? { slug: parentCategory.slug, title: parentCategory.title } : undefined}
          subCategory={{ slug: slug as string, title: subcategoryTitle }}
        />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">{subcategoryTitle}</h1>

        {/* Articles Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">Articles</h2>
          {isLoading ? (
            <div className="grid md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          ) : articles.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {articles.map((article) => (
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
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-600">No articles available for this subcategory.</p>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 py-4 text-center text-sm text-gray-600">
        Powered by Tokeet
      </footer>
    </div>
  );
}
