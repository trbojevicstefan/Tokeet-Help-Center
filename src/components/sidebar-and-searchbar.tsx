'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, Users, LogIn, Share, ChevronRight, ChevronDown, Moon, Sun, X, PanelLeftCloseIcon, Menu, Book, BookText, Folder, FolderOutput, PlusCircle, MinusCircle } from 'lucide-react';
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
  const [searchBarOpen, setSearchBarOpen] = useState(false);

  const searchResultsRef = useRef<HTMLDivElement | null>(null);
  const searchBarRef = useRef<HTMLInputElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);

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
      .then(() => {
        const sharePopup = document.createElement('div');
        sharePopup.textContent = 'Link copied to clipboard!';
        sharePopup.className = 'fixed bottom-10 right-10 bg-gray-800 text-white py-2 px-4 rounded shadow-lg z-50';
        document.body.appendChild(sharePopup);
        setTimeout(() => document.body.removeChild(sharePopup), 2000);
      })
      .catch(() => alert('Failed to copy link.'));
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
          console.error('Fetched data does not contain valid categories.');
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
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
    setSearchBarOpen(false);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      (searchResultsRef.current && !searchResultsRef.current.contains(event.target as Node)) &&
      (searchBarRef.current && !searchBarRef.current.contains(event.target as Node))
    ) {
      setSearchResults([]);
      setSearchBarOpen(false);
    }
  };

  useEffect(() => {
    if (searchBarOpen) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [searchBarOpen]);

  const expandAll = () => {
    const allCategories = categories.map((category) => category.title);
    setOpenCategories(allCategories);
    const allSubcategories = categories.flatMap((category) => category.subcategories.map((sub) => sub.title));
    setOpensubcategory(allSubcategories);
  };

  const collapseAll = () => {
    setOpenCategories([]);
    setOpensubcategory([]);
  };

  return (
    <div className={`flex h-screen flex-col overflow-hidden ${isDarkTheme ? 'dark' : ''}`}>
      {/* Top bar */}
      <header className={`w-full fixed top-0 left-0 bg-gray-100 dark:bg-gray-800 z-50 py-1`}>
        <div className="flex items-center justify-between px-4 relative">
          {/* Left: Logo */}
          <div className="flex items-center space-x-4">
            <img
              src="/images/tokeet/light_logo.png"
              alt="Tokeet Logo"
              width={120}
              height={40}
              className="h-auto"
            />
            <span className="hidden text-lg font-semibold lg:block text-gray-800 dark:text-gray-200 text-sm font-medium">Help Center</span>
          </div>

          {/* Middle: Search bar */}
          <div className="flex-1 mx-4">
            <div className="relative flex items-center">
              <input
                ref={searchBarRef}
                type="text"
                placeholder="Search..."
                className={`w-full rounded-lg border border-gray-300 bg-white py-2 px-4 text-gray-700 shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-gray-300 pr-10 ${searchBarOpen ? '' : 'hidden'}`}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {searchBarOpen && (
                <button
                  onClick={() => setSearchBarOpen(false)}
                  className="absolute right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSearchBarOpen(!searchBarOpen)}
              className="flex items-center p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700"
            >
              <Search className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-2" />
            </button>
            {isSmallScreen || isMediumScreen ? (
              <button
                onClick={toggleDrawer}
                className="flex items-center p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700"
              >
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            ) : (
              <>
                <Link href="https://tokeet.com" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700">
                  <Globe className="h-5 w-5 text-gray-500 dark:text-gray-300 mr-2" />
                  <span className="hidden md:block text-gray-800 dark:text-gray-200">Website</span>
                </Link>
                <Link href="https://tokeet.com/community" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700">
                  <Users className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-2" />
                  <span className="hidden md:block text-gray-800 dark:text-gray-200">Community</span>
                </Link>
                <Link href="https://app.tokeet.com/login" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700">
                  <LogIn className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-2" />
                  <span className="hidden md:block text-gray-800 dark:text-gray-200">Log In</span>
                </Link>
                <button
                  onClick={copyShareLink}
                  className="flex items-center p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700"
                >
                  <Share className="h-5 w-5 text-gray-600 dark:text-gray-300 mr-2" />
                  <span className="hidden md:block text-gray-800 dark:text-gray-200">Share</span>
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700"
                >
                  {isDarkTheme ? <Sun className="h-5 w-5 text-gray-600 dark:text-gray-300" /> : <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed top-14 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-72'} w-72 h-[calc(100vh-3.5rem)] bg-gray-100 dark:bg-gray-800 z-40 transition-transform duration-300 ease-in-out overflow-y-auto border-r border-gray-300 dark:border-gray-700 rounded-tr-lg rounded-br-lg`}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-300 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Categories</h2>
            <div className="flex space-x-2">
              <button onClick={expandAll} className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700">
                <PlusCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              <button onClick={collapseAll} className="p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700">
                <MinusCircle className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
          <nav className="space-y-1 p-4">
            {categories.map((category) => (
              <div key={category.title} className="mb-4 border-l-2 pl-2 border-gray-300 dark:border-gray-600">
                <button
                  onClick={() => toggleCategory(category.title)}
                  className={`flex w-full items-center justify-between rounded-lg p-2 text-left text-sm font-bold text-gray-700 hover:bg-gray-200 transition-colors duration-200 dark:text-gray-200 dark:hover:bg-gray-70 dark:hover:text-gray-700`}
                >
                  <div className="flex items-center space-x-2">
                    {openCategories.includes(category.title) ? <FolderOutput className="h-4 w-4 " /> : <Folder className="h-4 w-4 " />}
                    <span className="font-light">{category.title}</span>
                  </div>
                  {openCategories.includes(category.title) ? (
                    <ChevronDown className="h-4 w-4 " />
                  ) : (
                    <ChevronRight className="h-4 w-4 " />
                  )}
                </button>
                {openCategories.includes(category.title) && (
                  <div className="ml-4 mt-1 space-y-2 border-l-2 pl-2 border-gray-300 dark:border-gray-600">
                    {category.subcategories?.map((subcategory) => (
                      <div key={subcategory.title} className="mb-2">
                        <button
                          onClick={() => togglesubcategory(subcategory.title)}
                          className={`flex w-full items-center justify-between rounded-lg p-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-200 transition-colors duration-200 dark:text-gray-300 dark:hover:bg-gray-700 ${opensubcategory.includes(subcategory.title) ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                        >
                          <div className="flex items-center space-x-2">
                            {opensubcategory.includes(subcategory.title) ? <FolderOutput className="h-4 w-4 " /> : <Folder className="h-4 w-4 " />}
                            <span className="font-light">{subcategory.title}</span>
                          </div>
                          {opensubcategory.includes(subcategory.title) ? (
                            <ChevronDown className="h-4 w-4 " />
                          ) : (
                            <ChevronRight className="h-4 w-4 " />
                          )}
                        </button>
                        {opensubcategory.includes(subcategory.title) && (
                          <div className="ml-4 mt-1 space-y-1 border-l-2 pl-2 border-gray-300 dark:border-gray-600">
                            {subcategory.articles?.map((article) => (
                              <div
                                key={article.slug}
                                className={`flex items-center space-x-2 rounded-lg p-2 transition-colors duration-200 cursor-pointer ${currentSlug === article.slug ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                onClick={handleArticleClick}
                              >
                                <div className="flex-none flex items-center justify-center">
                                  {currentSlug === article.slug ? (
                                    <BookText className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                                  ) : (
                                    <Book className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                                  )}
                                </div>
                                <Link
                                  href={`/article/${article.slug}`}
                                  className="w-full text-sm text-gray-700 dark:text-gray-300"
                                >
                                  <span className="line-clamp-3 font-light">{article.title}</span>
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {category.articles?.map((article) => (
                      <div
                        key={article.slug}
                        className={`flex items-center space-x-2 rounded-lg p-2 transition-colors duration-200 cursor-pointer ${currentSlug === article.slug ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                        onClick={handleArticleClick}
                      >
                        <div className="flex-none flex items-center justify-center">
                          {currentSlug === article.slug ? (
                            <BookText className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                          ) : (
                            <Book className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        <Link
                          href={`/article/${article.slug}`}
                          className="w-full text-sm text-gray-700 dark:text-gray-300"
                        >
                          <span className="line-clamp-3 font-light">{article.title}</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Sidebar Toggle Button */}
        <button
          ref={toggleButtonRef}
          onClick={toggleSidebar}
          className={`fixed z-50 p-2 top-16 transform rounded-full bg-gray-100 dark:bg-gray-800 shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-transform duration-300 ease-in-out`}
          style={{
            left: sidebarOpen ? '17rem' : '0.5rem',
            transition: 'transform 0.3s ease-in-out',
          }}
        >
          <PanelLeftCloseIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-[#F9FAFB] dark:bg-gray-900 transition-colors duration-300 px-4">
          <div className="mx-auto max-w-3xl">
            {children}
          </div>
        </main>
      </div>

      {/* Drawer for medium and small screens */}
      {drawerOpen && (isSmallScreen || isMediumScreen) && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-50" onClick={toggleDrawer}>
          <div className="fixed top-0 right-0 w-72 h-full bg-white dark:bg-gray-800 p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Menu</h2>
              <button onClick={toggleDrawer} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="space-y-1">
              <Link href="https://tokeet.com" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700">
                <Globe className="h-5 w-5 inline text-gray-500 dark:text-gray-300 mr-2" /> <span className="text-gray-800 dark:text-gray-200">Website</span>
              </Link>
              <Link href="https://tokeet.com/community" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700">
                <Users className="h-5 w-5 inline text-gray-600 dark:text-gray-300 mr-2" /> <span className="text-gray-800 dark:text-gray-200">Community</span>
              </Link>
              <Link href="https://app.tokeet.com/login" target="_blank" rel="noopener noreferrer" className="flex items-center p-2 hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700">
                <LogIn className="h-5 w-5 inline text-gray-600 dark:text-gray-300 mr-2" /> <span className="text-gray-800 dark:text-gray-200">Log In</span>
              </Link>
              <button
                onClick={copyShareLink}
                className="flex items-center p-2 w-full text-left hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700"
              >
                <Share className="h-5 w-5 inline text-gray-600 dark:text-gray-300 mr-2" /> <span className="text-gray-800 dark:text-gray-200">Share</span>
              </button>
              <button
                onClick={toggleTheme}
                className="flex items-center p-2 w-full text-left hover:bg-gray-200 rounded-lg transition-colors duration-200 dark:hover:bg-gray-700"
              >
                {isDarkTheme ? <Sun className="h-5 w-5 inline text-gray-600 dark:text-gray-300" /> : <Moon className="h-5 w-5 inline text-gray-600 dark:text-gray-300" />}
                <span className="text-gray-800 dark:text-gray-200">Theme</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Search results */}
      {searchResults.length > 0 && (
        <div
          ref={searchResultsRef}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg z-50 overflow-y-auto max-h-80 rounded-lg"
        >
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Search Results</h3>
            <ul className="space-y-2">
              {searchResults.map((result) => (
                <li key={result.slug}>
                  <Link
                    href={`/article/${result.slug}`}
                    className="block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
                    onClick={handleSearchResultClick}
                  >
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">{result.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{result.description}</p>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

