'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/context/ThemeProvider';
import { PortableText, PortableTextReactComponents } from '@portabletext/react';
import ReactMarkdown from 'react-markdown';
import { client } from '../utils/sanity/sanity.cli';
import { urlFor } from '../utils/sanity/imageUrl';
import Image from 'next/image';
import ArticleRating from '@/components/article-rating';
import { AlertTriangle, Info, FileText } from 'lucide-react';

interface ArticleViewProps {
  slug: string;
}

interface ImageProps {
  value?: {
    asset: {
      _ref: string;
    };
    alt?: string;
  };
}

interface BlockProps {
  value?: {
    body: string;
  };
}

interface VideoEmbedProps {
  value?: {
    url: string;
  };
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
      <div className="relative w-full aspect-video">
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
        <div className={`flex items-start p-4 my-4 rounded-lg ${isDarkTheme ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-700'} border-l-4 border-red-500`} role="alert">
          <AlertTriangle className={`h-6 w-6 mr-2 ${isDarkTheme ? 'text-red-300' : 'text-red-500'}`} />
          <p className="flex-1">{value?.body}</p>
        </div>
      ),
      infoBlock: ({ value }: BlockProps) => (
        <div className={`flex items-start p-4 my-4 rounded-lg ${isDarkTheme ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'} border-l-4 border-blue-500`} role="alert">
          <Info className={`h-6 w-6 mr-2 ${isDarkTheme ? 'text-blue-300' : 'text-blue-500'}`} />
          <p className="flex-1">{value?.body}</p>
        </div>
      ),
      noteBlock: ({ value }: BlockProps) => (
        <div className={`flex items-start p-4 my-4 rounded-lg ${isDarkTheme ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'} border-l-4 border-green-500`} role="alert">
          <FileText className={`h-6 w-6 mr-2 ${isDarkTheme ? 'text-green-300' : 'text-green-500'}`} />
          <p className="flex-1">{value?.body}</p>
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
      h1: ({ children }) => <h1 className="text-5xl font-extrabold my-8 text-center border-b-2 border-gray-300 pb-4">{children}</h1>,
      h2: ({ children }) => <h2 className="text-4xl font-semibold my-6 border-b border-gray-300 pb-2">{children}</h2>,
      normal: ({ children }) => <p className="mb-4 leading-relaxed text-lg">{children}</p>,
      ul: ({ children }) => <ul className="list-disc list-inside ml-6 border-l-2 border-gray-300 pl-4 relative">
        {React.Children.map(children, (child,) => (
          <li className="relative mb-2 pl-2 before:absolute before:top-1/2 before:left-[-10px] before:w-2 before:h-2 before:bg-gray-500 before:rounded-full">
            {child}
          </li>
        ))}
      </ul>,
      hr: () => <hr className="my-6 border-gray-400" />,
    },
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkTheme ? 'bg-[#111827] text-white' : 'bg-[#F9FAFB] text-black'} overflow-y-auto`}>
      {error ? (
        <div className="container mx-auto max-w-3xl p-4 h-screen flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold text-red-600 text-center mb-4">Failed to load article.</h2>
          <p className="text-center">Please try refreshing the page or check back later.</p>
        </div>
      ) : article ? (
        <main className="container pt-16 mx-auto max-w-3xl p-4 h-full">
          <div className={`border ${isDarkTheme ? 'border-gray-600' : 'border-gray-300'} p-6 rounded-lg bg-opacity-80`}>
            <h1 className="text-4xl font-light text-center mb-6 border-b border-gray-300 pb-2" style={{ fontFamily: 'Arial, sans-serif' }}>{article.title}</h1>
            {article.content && (
              <PortableText value={article.content} components={myPortableTextComponents} />
            )}
            {article.markdownContent && (
              <ReactMarkdown>{article.markdownContent}</ReactMarkdown>
            )}
            <ArticleRating onRatingSubmit={(rating) => console.log(`User rated: ${rating}`)} />
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
