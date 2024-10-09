'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import Link from 'next/link';
import { fetchCategoryData } from "../utils/sanity/HelpCenterData";
import { useParams } from 'next/navigation';
import Breadcrumbs from './Breadcrumbs'; // Import Breadcrumbs component
import SkeletonCard from './ui/skeletonCard'; // Import the SkeletonCard component

interface SubCategory {
  slug: string;
  title: string;
}

interface Article {
  slug: string;
  title: string;
  description: string;
}

export default function CategoryViewComponent() {
  const { slug } = useParams(); // Get the category slug from the URL
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categoryTitle, setCategoryTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const categorySlug = Array.isArray(slug) ? slug[0] : slug; // Ensure slug is a string

    if (typeof categorySlug === 'string') {
      async function fetchData() {
        // Fetch data for the specific category using slug
        const categoryData = await fetchCategoryData(categorySlug);
        setCategoryTitle(categoryData.title);
        setSubCategories(categoryData.subCategories);
        setArticles(categoryData.articles);
        setIsLoading(false);
      }
      fetchData();
    }
  }, [slug]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs Container Aligned */}
      <div className="container mx-auto px-4 py-4"> {/* Match the styling with main content */}
        <Breadcrumbs
          category={{ slug: slug as string, title: categoryTitle }}
        />
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">{categoryTitle}</h1>

        {/* Subcategories Section (Show only if there are subcategories or if loading) */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Subcategories</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />) // Show 3 skeleton cards during loading
              : subCategories.length > 0 &&
                subCategories.map((subCategory) => (
                  <Card key={subCategory.slug}>
                    <CardHeader>
                      <CardTitle>{subCategory.title}</CardTitle>
                    </CardHeader>
                    <CardFooter>
                      <Link href={`/subcategory/${subCategory.slug}`} legacyBehavior>
                        <a className="rounded-full">VIEW SUBCATEGORY</a>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
          </div>
        </section>

        {/* Articles Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6 text-center">Articles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />) // Show 6 skeleton cards during loading
              : articles.length > 0
              ? articles.map((article) => (
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
              : (
                <p className="text-center text-gray-600">No articles available for this category.</p>
              )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 py-4 text-center text-sm text-gray-600">
        Powered by Tokeet
      </footer>
    </div>
  );
}
