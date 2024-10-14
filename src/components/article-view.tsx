'use client'

import React, { useEffect, useState } from 'react'
import { useTheme } from '@/context/ThemeProvider'
import { PortableText, PortableTextReactComponents } from '@portabletext/react'
import ReactMarkdown from 'react-markdown'
import { client } from '../utils/sanity/sanity.cli'
import { urlFor } from '../utils/sanity/imageUrl' // Import the URL generator utility
import Image from 'next/image'

interface ArticleViewProps {
  slug: string
}

interface ImageProps {
  value?: {
    asset: {
      _ref: string
    }
    alt?: string
  }
}

interface BlockProps {
  value?: {
    body: string
  }
}

interface VideoEmbedProps {
  value?: {
    url: string
  }
}

type ArticleContent = {
  _type: 'image' | 'dangerBlock' | 'infoBlock' | 'noteBlock' | 'videoEmbed' | 'htmlEmbed' | string
  asset?: {
    _ref: string
  }
  alt?: string
  body?: string
  url?: string
  html?: string
}

interface ArticleData {
  title: string
  content?: ArticleContent[]
  markdownContent?: string
}

export default function ArticleView({ slug }: ArticleViewProps) {
  const { isDarkTheme } = useTheme()
  const [article, setArticle] = useState<ArticleData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSpinner, setShowSpinner] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (slug) {
      setIsLoading(true)
      setShowSpinner(false)
      setArticle(null)
      setError(false)

      const spinnerTimer = setTimeout(() => {
        if (isLoading) {
          setShowSpinner(true)
        }
      }, 600)

      const fetchArticle = async () => {
        try {
          const data = await client.fetch(
            `*[_type == "article" && slug.current == $slug][0]{
              title,
              content,
              markdownContent
            }`,
            { slug }
          )

          if (data) {
            setArticle(data)
          } else {
            setError(true)
            console.error('Article not found.')
          }
        } catch (error) {
          setError(true)
          console.error('Failed to fetch article:', error)
        } finally {
          setIsLoading(false)
          clearTimeout(spinnerTimer)
        }
      }

      fetchArticle()

      return () => clearTimeout(spinnerTimer)
    }
  }, [slug])

  // Custom PortableText Components for Rendering Custom Blocks
  const myPortableTextComponents: Partial<PortableTextReactComponents> = {
    types: {
      image: ({ value }: ImageProps) => {
        if (!value || !value.asset?._ref) return null
        return (
          <Image
            src={urlFor(value.asset).width(800).url()} // Generate URL using the utility
            alt={value.alt || 'Image'}
            width={800}
            height={450}
            className="my-4 rounded-lg"
          />
        )
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
      videoEmbed: ({ value }: VideoEmbedProps) => (
        <div className="my-4">
          <iframe
            width="100%"
            height="315"
            src={value?.url}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ),
      htmlEmbed: ({ value }: { value?: { html: string } }) => (
        <div className="my-4" dangerouslySetInnerHTML={{ __html: value?.html || '' }} />
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
    },
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkTheme ? 'bg-[#212121] text-white' : 'bg-white text-black'}`}>
      {error ? (
        <div className="container mx-auto max-w-3xl p-4 h-screen flex flex-col justify-center items-center">
          <h2 className="text-2xl font-bold text-red-600 text-center mb-4">Failed to load article.</h2>
          <p className="text-center">Please try refreshing the page or check back later.</p>
        </div>
      ) : article ? (
        <main className="container mx-auto max-w-3xl p-4 h-screen flex flex-col">
          <div className="flex-grow overflow-y-auto pr-4">
            <h1 className="text-3xl font-bold text-center mb-4">{article.title}</h1>
            {article.content && (
              <PortableText value={article.content} components={myPortableTextComponents} />
            )}
            {article.markdownContent && (
              <ReactMarkdown>{article.markdownContent}</ReactMarkdown>
            )}
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
    </div>
  )
}
