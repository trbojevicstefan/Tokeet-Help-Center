'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Search, Globe, Users, LogIn, Share, ChevronRight, ChevronDown, Moon, Sun, X, PanelLeftCloseIcon, Menu } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [opensubcategory, setOpensubcategory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [isMediumScreen, setIsMediumScreen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const pathname = usePathname();
  const [currentSlug, setCurrentSlug] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => setDrawerOpen(!drawerOpen);

  useEffect(() => {
    if (pathname) {
      const slug = pathname.split('/').pop();
      setCurrentSlug(slug || null);
    }
  }, [pathname]);

  useEffect(() => {
    const checkScreenSize = () => {
      const smallScreen = window.innerWidth < 640;
      const mediumScreen = window.innerWidth >= 640 && window.innerWidth < 1024;
      setIsSmallScreen(smallScreen);
      setIsMediumScreen(mediumScreen);
      setSidebarOpen(!smallScreen && !mediumScreen);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
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
    if (isSmallScreen) {
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

  const handleSearchResultClick = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className={`flex h-screen flex-col overflow-hidden ${isDarkTheme ? 'dark' : ''}`}>
      {/* Top search bar */}
      <header className="w-full bg-white shadow-md dark:bg-gray-800 z-20">
        <div className="flex items-center justify-between p-4">
          {/* Left: Logo and Menu Button */}
          <div className="flex items-center space-x-4">
            <img
              src="/images/tokeet/light_logo.png"
              alt="Tokeet Logo"
              width={120}
              height={40}
              className="h-auto"
            />
            <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700"
              >
                <PanelLeftCloseIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </button>

          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 items-center justify-center px-4 flex">
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                placeholder="How can we help?"
                className="w-full rounded-full border border-gray-300 bg-white py-2 pl-10 pr-10 text-gray-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-300 transition-shadow duration-200"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Links */}
          <div className="hidden md:flex space-x-2">
            <Link href="https://tokeet.com" target="_blank" rel="noopener noreferrer" className="flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-200 dark:hover:bg-gray-700">
              <Globe className="h-4 w-4 mr-2" />
              <span>tokeet.com</span>
            </Link>
            <Link href="https://tokeet.com/community" target="_blank" rel="noopener noreferrer" className="flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-200 dark:hover:bg-gray-700">
              <Users className="h-4 w-4 mr-2" />
              <span>Community</span>
            </Link>
            <Link href="https://app.tokeet.com/login" target="_blank" rel="noopener noreferrer" className="flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-200 dark:hover:bg-gray-700">
              <LogIn className="h-4 w-4 mr-2" />
              <span>Login</span>
            </Link>
            <button
              onClick={copyShareLink}
              className="flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              <Share className="h-4 w-4 mr-2" />
              <span>Share</span>
            </button>
            <button
              onClick={toggleTheme}
              className="flex items-center rounded-full px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
                      <button
              onClick={toggleDrawer}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 dark:hover:bg-gray-700"
            >
              <Menu className="h-6 w-6 text-gray-600 dark:text-gray-300" />
            </button>

          </div>
        </div>
      </header>

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'w-64' : 'w-0'
          } bg-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden flex flex-col dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-10`}
        >
          <div className="flex-1 overflow-y-auto pt-20">
            <nav className="space-y-1 p-4">
              {categories.map((category) => (
                <div key={category.title} className="mb-4">
                  <button
                    onClick={() => toggleCategory(category.title)}
                    className="flex w-full items-center justify-between rounded-lg p-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-200 dark:hover:bg-gray-700"
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
                            className="flex w-full items-center justify-between rounded-lg p-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-300 dark:hover:bg-gray-700"
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
                                  } transition-colors duration-200`}
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
                          } transition-colors duration-200`}
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
        <main className="flex-1 overflow-y-auto bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="mx-auto max-w-3xl px-4 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg rounded-lg z-30">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Search Results</h3>
            <ul className="space-y-2">
              {searchResults.map((result) => (
                <li key={result.slug}>
                  <Link
                    href={`/article/${result.slug}`}
                    className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={handleSearchResultClick}
                  >
                    <h4 className="font-medium text-blue-600 dark:text-blue-400">{result.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{result.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Mobile drawer menu */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={toggleDrawer}>
          <div
            className="fixed top-0 right-0 h-full w-64 bg-white shadow-lg dark:bg-gray-800 p-4 transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={toggleDrawer}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors duration-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
            <nav className="mt-16 space-y-4">
              <Link href="https://tokeet.com" target="_blank" rel="noopener noreferrer" className="flex items-center rounded-lg p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-200 dark:hover:bg-gray-700">
                <Globe className="h-4 w-4 mr-2" />
                tokeet.com
              </Link>
              <Link href="https://tokeet.com/community" target="_blank" rel="noopener noreferrer" className="flex items-center rounded-lg p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-200 dark:hover:bg-gray-700">
                <Users className="h-4 w-4 mr-2" />
                Community
              </Link>
              <Link href="https://app.tokeet.com/login" target="_blank" rel="noopener noreferrer" className="flex items-center rounded-lg p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-200 dark:hover:bg-gray-700">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Link>
              <button
                onClick={copyShareLink}
                className="flex w-full items-center rounded-lg p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </button>
              <button
                onClick={toggleTheme}
                className="flex w-full items-center rounded-lg p-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {isDarkTheme ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                Toggle Theme
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}