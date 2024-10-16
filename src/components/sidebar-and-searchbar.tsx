'use client';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Search, Globe, Users, LogIn, Share, ChevronRight, ChevronDown, Moon, Sun, X, Menu } from 'lucide-react';
import { fetchHelpCategories } from '@/utils/sanity/HelpCenterData';
import { useTheme } from '@/context/ThemeProvider';
import MenuIcon from '../components/ui/sidebartoggle';

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
      setIsSmallScreen(window.innerWidth < 640);
      setIsMediumScreen(window.innerWidth >= 640 && window.innerWidth < 1024);
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

  return (
    <div className={`flex h-screen flex-col overflow-hidden ${isDarkTheme ? 'dark' : ''}`}>
      {/* Top search bar */}
      <header className="w-full bg-white shadow-sm dark:bg-[#171717]">
        <div className="flex items-center justify-between p-2">
          {/* Left: Logo and Menu Button */}
          <div className="flex items-center space-x-2">
            <img
              src="/images/tokeet/light_logo.png"
              alt="Tokeet Logo"
              width={120}
              height={40}
              className="h-auto"
            />
            <button
              onClick={toggleSidebar}
              className="p-1 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-700"
            >
              <MenuIcon fill={isDarkTheme ? "#FFFFFF" : "#000000"} />
            </button>
          </div>

          {/* Center: Search Bar */}
          <div className="flex flex-1 items-center justify-center px-4 py-2">
            <div className="relative w-full max-w-2xl">
              <input
                type="text"
                placeholder="How can we help?"
                className="w-full rounded-full border border-gray-300 bg-[rgb(244,244,244)] py-2 pl-10 pr-10 text-[#5D5D5D] focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:bg-[#2F2F2F] dark:text-gray-200 dark:border-gray-600 dark:focus:border-blue-400 dark:focus:ring-blue-300"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchQuery && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white rounded-lg shadow-md dark:bg-gray-800 z-[60]">
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

          {/* Right: Drawer Button or Links */}
          <div className="flex items-center space-x-2">
            <div className="block md:hidden">
              <button
                onClick={toggleDrawer}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Menu className="h-6 w-6" fill={isDarkTheme ? "#FFFFFF" : "#000000"} />
              </button>
            </div>
            <div className="hidden md:flex space-x-1 sm:space-x-2">
              <Link href="https://tokeet.com" target="_blank" rel="noopener noreferrer" className="flex items-center rounded-full p-1 text-xs font-medium text-gray-700 hover:bg-gray-100 sm:px-2 sm:py-1 sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                <Globe className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">tokeet.com</span>
              </Link>
              <Link href="https://tokeet.com/community" target="_blank" rel="noopener noreferrer" className="flex items-center rounded-full p-1 text-xs font-medium text-gray-700 hover:bg-gray-100 sm:px-2 sm:py-1 sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                <Users className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Community</span>
              </Link>
              <Link href="https://app.tokeet.com/login" target="_blank" rel="noopener noreferrer" className="flex items-center rounded-full p-1 text-xs font-medium text-gray-700 hover:bg-gray-100 sm:px-2 sm:py-1 sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700">
                <LogIn className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Login</span>
              </Link>
              <button
                onClick={copyShareLink}
                className="flex items-center rounded-full p-1 text-xs font-medium text-gray-700 hover:bg-gray-100 sm:px-2 sm:py-1 sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                <Share className="h-4 w-4 sm:mr-1" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center rounded-full p-1 text-xs font-medium text-gray-700 hover:bg-gray-100 sm:px-2 sm:py-1 sm:text-sm dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
              >
                {isDarkTheme ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        {/* Drawer Menu */}
        {drawerOpen && (
          <div className={`fixed top-20 right-4 z-50 w-64 bg-white shadow-lg rounded-lg dark:bg-[#2F2F2F] dark:text-gray-200 p-4 transition-transform duration-300`}>
            <button
              onClick={toggleDrawer}
              className="absolute top-2 right-2 p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
            <nav className="mt-8 space-y-4">
              <Link href="https://tokeet.com" target="_blank" rel="noopener noreferrer" className="flex items-center rounded-full p-2 text-xs font-medium text-gray-700 dark:text-gray-200">
                <Globe className="h-4 w-4 mr-2" />
                tokeet.com
              </Link>
              <Link href="https://tokeet.com/community" target="_blank" rel="noopener noreferrer" className="flex items-center rounded-full p-2 text-xs font-medium text-gray-700 dark:text-gray-200">
                <Users className="h-4 w-4 mr-2" />
                Community
              </Link>
              <Link href="https://app.tokeet.com/login" target="_blank" rel="noopener noreferrer" className="flex items-center rounded-full p-2 text-xs font-medium text-gray-700 dark:text-gray-200">
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Link>
              <button
                onClick={copyShareLink}
                className="flex items-center rounded-full p-2 text-xs font-medium text-gray-700 dark:text-gray-200"
              >
                <Share className="h-4 w-4 mr-2" />
                Share
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center rounded-full p-2 text-xs font-medium text-gray-700 dark:text-gray-200"
              >
                {isDarkTheme ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                Toggle Theme
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            sidebarOpen
              ? (isSmallScreen
                  ? 'w-full fixed inset-y-0 left-0 z-50 pt-16'
                  : isMediumScreen
                    ? 'w-1/2 max-w-xs pt-16'
                    : 'w-64 pt-16')
              : 'w-0'
          } bg-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden flex flex-col dark:bg-[#171717]`}
        >
          {isSmallScreen && sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          )}

          <div className="flex-1 overflow-y-auto">
            <nav className="space-y-1 p-2">
              {categories.map((category) => (
                <div key={category.title} className="mb-2">
                  <button
                    onClick={() => toggleCategory(category.title)}
                    className="flex w-full items-center justify-between rounded-lg p-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
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
                            className="flex w-full items-center justify-between rounded-lg p-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
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
        <main className={`flex-1 overflow-y-auto p-0 ${sidebarOpen && isSmallScreen ? 'hidden' : ''}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
