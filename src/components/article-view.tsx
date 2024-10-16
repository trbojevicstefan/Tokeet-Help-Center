'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { PortableText, PortableTextReactComponents } from '@portabletext/react';
import ReactMarkdown from 'react-markdown';
import { client } from '../utils/sanity/sanity.cli';
import { urlFor } from '../utils/sanity/imageUrl'; // Import the URL generator utility
import Image from 'next/image';
import ArticleRating from '@/components/article-rating'; // Importing the rating component

interface ArticleViewProps {
  slug: string;
}

interface ImageProps {
  value?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  }
}

interface BlockProps {
  value?: {
    body: string;
  }
}

interface VideoEmbedProps {
  value?: {
    url: string;
  }
}

type ArticleContent = {
  _type: 'image' | 'dangerBlock' | 'infoBlock' | 'noteBlock' | 'videoEmbed' | 'htmlEmbed' | string;
  asset?: {
    _ref: string;
  };
  alt?: string;
  body?: string;
  url?: string;
  html?: string;
};

interface ArticleData {
  title: string;
  content?: ArticleContent[];
  markdownContent?: string;
}

export default function ArticleView({ slug }: ArticleViewProps) {
  const { isDarkTheme } = useTheme();
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSpinner, setShowSpinner] = useState(false);
  const [error, setError] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      setIsLoading(true);
      setShowSpinner(false);
      setArticle(null);
      setError(false);

      const spinnerTimer = setTimeout(() => {
        if (isLoading) {
          setShowSpinner(true);
        }
      }, 600);

      const fetchArticle = async () => {
        try {
          const data = await client.fetch(
            `*[_type == "article" && slug.current == $slug][0]{
              title,
              content,
              markdownContent
            }`,
            { slug }
          );

          if (data) {
            setArticle(data);
          } else {
            setError(true);
            console.error('Article not found.');
          }
        } catch (error) {
          setError(true);
          console.error('Failed to fetch article:', error);
        } finally {
          setIsLoading(false);
          clearTimeout(spinnerTimer);
        }
      };

      fetchArticle();

      return () => clearTimeout(spinnerTimer);
    }
  }, [slug]);

  const handleImageClick = (url: string) => {
    setModalImageUrl(url);
  };

  const closeModal = () => {
    setModalImageUrl(null);
  };

  const VideoEmbed = ({ value }: VideoEmbedProps) => (
    <div className="flex justify-center my-4 w-full">
      <div className="relative w-full max-w-[960px] aspect-video">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={value?.url}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );

  // Custom PortableText Components for Rendering Custom Blocks
  const myPortableTextComponents: Partial<PortableTextReactComponents> = {
    types: {
      image: ({ value }: ImageProps) => {
        if (!value || !value.asset?._ref) return null;
        const imageUrl = urlFor(value.asset).url();
        return (
          <div className="relative my-4 max-w-full">
            <Image
              src={imageUrl}
              alt={value.alt || 'Image'}
              width={800}
              height={450}
              className="rounded-lg cursor-pointer max-w-full h-auto"
              onClick={() => handleImageClick(imageUrl)}
              style={{ objectFit: 'contain', maxWidth: '100%', width: 'auto', height: 'auto' }}
            />
          </div>
        );
      },
      dangerBlock: ({ value }: BlockProps) => (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 my-4" role="alert">
          <p>{value?.body}</p>
        </div>
      ),
      infoBlock: ({ value }: BlockProps) => (
        <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 my-4" role="alert">
          <p>{value?.body}</p>
        </div>
      ),
      noteBlock: ({ value }: BlockProps) => (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 my-4" role="alert">
          <p>{value?.body}</p>
        </div>
      ),
      videoEmbed: VideoEmbed,
      htmlEmbed: ({ value }: { value?: { html: string } }) => (
        <div
          className="my-4 overflow-x-auto w-full max-w-full"
          style={{ wordWrap: 'break-word' }}
          dangerouslySetInnerHTML={{ __html: value?.html || '' }}
        />
      ),
    },
    marks: {
      strong: ({ children }) => <strong className="font-bold">{children}</strong>,
      em: ({ children }) => <em className="italic">{children}</em>,
      link: ({ children, value }: { children?: React.ReactNode; value?: { href: string } }) => (
        <a
          href={value?.href || '#'}
          className="text-blue-500 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),
    },
    block: {
      h1: ({ children }) => <h1 className="text-4xl font-bold my-6">{children}</h1>,
      h2: ({ children }) => <h2 className="text-3xl font-semibold my-4">{children}</h2>,
      normal: ({ children }) => <p className="mb-4">{children}</p>,
      hr: () => <hr className="my-4 border-gray-300" />, // Added hr handler
    },
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkTheme ? 'bg-[#212121] text-white' : 'bg-white text-black'}`}>
      {error ? (
        <div className="container mx-auto max-w-3xl p-4 h-screen flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold text-red-600 text-center mb-4">Failed to load article.</h2>
          <p className="text-center">Please try refreshing the page or check back later.</p>
        </div>
      ) : article ? (
        <main className="container mx-auto max-w-3xl p-4 h-screen overflow-y-auto pt-10">
          <div className="flex-grow overflow-y-auto pr-4">
            <h1 className="text-3xl font-bold text-center mb-4">{article.title}</h1>
            <div className={`border ${isDarkTheme ? 'border-gray-600' : 'border-gray-300'} shadow-lg p-6 rounded-lg bg-opacity-80`}>
              {article.content && (
                <PortableText value={article.content} components={myPortableTextComponents} />
              )}
              {article.markdownContent && (
                <ReactMarkdown>{article.markdownContent}</ReactMarkdown>
              )}
            </div>
            {/* Article Rating Component with the same styling as the article container */}
            <div className={`border ${isDarkTheme ? 'border-gray-600' : 'border-gray-300'} shadow-lg p-6 rounded-lg bg-opacity-80 mt-6`}>
              <ArticleRating onRatingSubmit={(rating) => console.log(`User rated: ${rating}`)} />
            </div>
          </div>
        </main>
      ) : null}
      {isLoading && !showSpinner && (
        <div className="container mx-auto max-w-3xl p-4 h-screen flex flex-col animate-pulse">
          <div className="h-10 bg-gray-300 rounded mb-4"></div>
          <div className="flex-grow overflow-hidden pr-4">
            <div className="h-5 bg-gray-300 rounded my-2"></div>
            <div className="h-5 bg-gray-300 rounded my-2"></div>
            <div className="h-5 bg-gray-300 rounded my-2"></div>
          </div>
        </div>
      )}
      {showSpinner && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {/* Image Modal */}
      {modalImageUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative max-w-full max-h-full overflow-hidden p-4">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-xl bg-gray-800 rounded-full p-2 hover:bg-gray-600"
            >
              ✕
            </button>
            <div className="overflow-auto max-h-[90vh] max-w-[90vw]">
              <Image
                src={modalImageUrl}
                alt="Modal Image"
                width={1200}
                height={800}
                className="rounded-lg cursor-zoom-in"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
