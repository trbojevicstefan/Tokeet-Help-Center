'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect, ChangeEvent } from 'react';
import { 
  Search, Globe, Users, LogIn, Share, 
  ChevronRight, ChevronDown, Moon, Sun, 
  X, Menu 
} from 'lucide-react';
import { fetchHelpCategories } from '@/utils/sanity/HelpCenterData';
import { useTheme } from '@/context/ThemeProvider';

interface Article {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
}

interface Subcategory {
  title: string;
  slug: string;
  articles: Article[];
}

interface Category {
  title: string;
  slug: string;
  subcategories: Subcategory[];
  articles: Article[];
}

interface FetchedCategory {
  title: string;
  slug: string;
}

interface FetchedSubcategory {
  title: string;
  slug: string;
  category?: { slug: string };
}

interface FetchedArticle {
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  category?: { slug: string };
  subCategory?: { slug: string };
}

interface SidebarAndSearchbarComponentProps {
  children: React.ReactNode;
}

export function SidebarAndSearchbarComponent({ children }: SidebarAndSearchbarComponentProps) {
  const { isDarkTheme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [opensubcategory, setOpensubcategory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Article[]>([]);

  useEffect(() => {
    if (pathname) {
      const slug = pathname.split('/').pop();
      setCurrentSlug(slug || null);
    }
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true); // Keep sidebar open on larger screens
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => alert("Link copied to clipboard!"))
      .catch(() => alert("Failed to copy link."));
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await fetchHelpCategories();
        if (data && data.categories && Array.isArray(data.categories)) {
          const mappedCategories: Category[] = data.categories.map((category: FetchedCategory) => {
            const subcategories: Subcategory[] = (data.subcategories || [])
              .filter((subCategory: FetchedSubcategory) => subCategory.category?.slug === category.slug)
              .map((subCategory: FetchedSubcategory) => {
                const articles: Article[] = (data.articles || []).filter(
                  (article: FetchedArticle) => article.subCategory?.slug === subCategory.slug
                ).map((article: FetchedArticle) => ({
                  title: article.title,
                  slug: article.slug,
                  description: article.description,
                  publishedAt: article.publishedAt,
                }));

                return { title: subCategory.title, slug: subCategory.slug, articles };
              });

            const directArticles: Article[] = (data.articles || []).filter(
              (article: FetchedArticle) => !article.subCategory && article.category?.slug === category.slug
            ).map((article: FetchedArticle) => ({
              title: article.title,
              slug: article.slug,
              description: article.description,
              publishedAt: article.publishedAt,
            }));

            return { title: category.title, slug: category.slug, subcategories, articles: directArticles };
          });

          setCategories(mappedCategories);
        } else {
          console.error("Fetched data does not contain valid categories.");
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleCategory = (categoryName: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryName) ? prev.filter((name) => name !== categoryName) : [...prev, categoryName]
    );
  };
  const togglesubcategory = (subcategoryName: string) => {
    setOpensubcategory((prev) =>
      prev.includes(subcategoryName) ? prev.filter((name) => name !== subcategoryName) : [...prev, subcategoryName]
    );
  };
  const handleArticleClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length > 0) {
      const results: Article[] = [];
      categories.forEach((category) => {
        category.articles.forEach((article) => {
          if (article.title.toLowerCase().includes(query.toLowerCase()) ||
              article.description.toLowerCase().includes(query.toLowerCase())) {
            results.push(article);
          }
        });
        category.subcategories.forEach((subcategory) => {
          subcategory.articles.forEach((article) => {
            if (article.title.toLowerCase().includes(query.toLowerCase()) ||
                article.description.toLowerCase().includes(query.toLowerCase())) {
              results.push(article);
            }
          });
        });
      });
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  };

  return (
    <div className={`flex h-screen flex-col overflow-hidden ${isDarkTheme ? 'dark' : ''}`}>
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm dark:bg-gray-900">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="flex h-16 items-center justify-between">
      {/* Container for Logo and Menu Button */}
      <div className="flex items-center space-x-4"> {/* space-x-4 will give some spacing between logo and menu */}
        <img
          src="/images/tokeet/light_logo.png"
          alt="Tokeet Logo"
          width={120}
          height={40}
          className="h-8 w-auto"
        />
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700 focus:outline-none"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={sidebarOpen}
        >
          {sidebarOpen ? (
            <X className="h-6 w-6 text-gray-700 dark:text-gray-200" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700 dark:text-gray-200" aria-hidden="true" />
          )}
        </button>
      </div>
            {/* Centered Search Bar */}
            <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-center relative">
              <div className="w-full max-w-lg relative">
                <label htmlFor="search" className="sr-only">Search</label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    placeholder="How can we help?"
                    type="search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3"
                      aria-label="Clear search"
                    >
                      <X className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </button>
                  )}
                </div>
                {searchQuery && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white rounded-lg shadow-md dark:bg-gray-800 z-10">
                    {searchResults.map((result) => (
                      <Link
                        href={`/article/${result.slug}`}
                        key={result.slug}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                      >
                        <div>
                          <strong>{result.title}</strong>
                          {result.description && (
                            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                              {result.description}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden lg:flex items-center space-x-4">
              <Link href="https://tokeet.com" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                <Globe className="h-6 w-6" aria-hidden="true" />
              </Link>
              <Link href="https://tokeet.com/community" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                <Users className="h-6 w-6" aria-hidden="true" />
              </Link>
              <Link href="https://app.tokeet.com/login" className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
                <LogIn className="h-6 w-6" aria-hidden="true" />
              </Link>
              <button
                onClick={copyShareLink}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                aria-label="Share link"
              >
                <Share className="h-6 w-6" aria-hidden="true" />
              </button>
              <button
                onClick={toggleTheme}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none"
                aria-label="Toggle theme"
              >
                {isDarkTheme ? <Sun className="h-6 w-6" aria-hidden="true" /> : <Moon className="h-6 w-6" aria-hidden="true" />}
              </button>
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-2">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                  Home
                </Link>
              </li>
              {/* Dynamically generate breadcrumbs based on the current path */}
              {pathname && pathname !== '/' && pathname.split('/').filter(Boolean).map((segment, index, array) => {
                const href = '/' + array.slice(0, index + 1).join('/');
                const isLast = index === array.length - 1;
                const displayName = segment.charAt(0).toUpperCase() + segment.slice(1);
                return (
                  <li key={href}>
                    {isLast ? (
                      <span className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
                        <ChevronRight className="w-4 h-4 mx-1" aria-hidden="true" />
                        {displayName}
                      </span>
                    ) : (
                      <Link href={href} className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                        <ChevronRight className="w-4 h-4 mx-1" aria-hidden="true" />
                        {displayName}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>
      </header>

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen
              ? 'fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0'
              : 'transform -translate-x-full transition-transform duration-300 ease-in-out md:translate-x-0 md:w-0'
          } bg-white shadow-lg overflow-hidden flex flex-col dark:bg-gray-900`}
        >
          <div className="flex-1 overflow-y-auto">
            <nav className="space-y-1 p-2">
              {categories.map((category) => (
                <div key={category.title} className="mb-2">
                  <button
                    onClick={() => toggleCategory(category.title)}
                    className="flex w-full items-center justify-between rounded-lg p-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700 focus:outline-none"
                  >
                    {category.title}
                    {openCategories.includes(category.title) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  {openCategories.includes(category.title) && (
                    <div className="ml-4 mt-2 space-y-1">
                      {category.subcategories?.map((subcategory) => (
                        <div key={subcategory.title}>
                          <button
                            onClick={() => togglesubcategory(subcategory.title)}
                            className="flex w-full items-center justify-between rounded-lg p-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none"
                          >
                            {subcategory.title}
                            {opensubcategory.includes(subcategory.title) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                          {opensubcategory.includes(subcategory.title) && (
                            <div className="ml-4 mt-1 space-y-1">
                              {subcategory.articles?.map((article) => (
                                <Link
                                  href={`/article/${article.slug}`}
                                  key={article.slug}
                                  className={`block rounded-lg py-2 pl-4 pr-2 text-sm ${
                                    currentSlug === article.slug
                                      ? 'bg-gray-100 text-blue-500 dark:bg-gray-700 dark:text-blue-400'
                                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                  } no-underline`}
                                  onClick={handleArticleClick}
                                >
                                  {article.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                      {category.articles?.map((article) => (
                        <Link
                          href={`/article/${article.slug}`}
                          key={article.slug}
                          className={`block rounded-lg py-2 pl-4 pr-2 text-sm ${
                            currentSlug === article.slug
                              ? 'bg-gray-100 text-blue-500 dark:bg-gray-700 dark:text-blue-400'
                              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                          } no-underline`}
                          onClick={handleArticleClick}
                        >
                          {article.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${sidebarOpen ? 'md:ml-64' : ''}`}>
          {/* Breadcrumbs will appear here if placed outside the header */}
          {children}
        </main>
      </div>
    </div>
  );
}
