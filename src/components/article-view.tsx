'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs'; // Import Breadcrumbs component
import { fetchSingleArticle } from '@/utils/sanity/HelpCenterData';
import { incrementArticleViewCount } from '@/utils/sanity/incrementViewCount'; // Import the function to increment view count
import { incrementArticleRating } from '@/utils/sanity/incrementArticleRating'; // Import rating increment function
import SkeletonCard from '@/components/ui/skeletonCard'; // Import SkeletonCard

interface Article {
  _id: string;
  title: string;
  category?: {
    slug: string;
    title: string;
  };
  subCategory?: {
    slug: string;
    title: string;
  };
  content: Array<Block | ImageBlock | HtmlEmbedBlock>;
  relatedArticles?: Array<{
    slug: string;
    title: string;
  }>;
}

interface Block {
  _type: 'block';
  style: string;
  children: Array<Span>;
  markDefs?: Array<{ _key: string; _type: string; href: string }>;
}

interface Span {
  _key: string;
  _type: 'span';
  text: string;
  marks?: string[];
}

interface ImageBlock {
  _type: 'image';
  asset: {
    _ref: string;
  };
  alt?: string;
}

interface HtmlEmbedBlock {
  _type: 'htmlEmbed';
  html: string;
}

export default function ArticleView() {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);

  // Function to handle rating submission
  const handleRatingClick = async (rating: number) => {
    setSelectedRating(rating);
    if (article && article._id) {
      await incrementArticleRating(article._id, rating);
      setHasRated(true);
    }
  };

  useEffect(() => {
    if (typeof slug === 'string') {
      fetchSingleArticle(slug).then(fetchedArticle => {
        setArticle(fetchedArticle as Article);
        incrementArticleViewCount(fetchedArticle._id);
        setIsLoading(false);
      });
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs />
        </div>
        <main className="container mx-auto px-4 py-8">
          <SkeletonCard />
        </main>
      </div>
    );
  }

  if (!article) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs Container */}
      <div className="container mx-auto px-4 py-4">
        <Breadcrumbs
          category={article?.category ? { slug: article.category.slug, title: article.category.title } : undefined}
          subCategory={article?.subCategory ? { slug: article.subCategory.slug, title: article.subCategory.title } : undefined}
          article={{ title: article.title }}
        />
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 text-center">{article.title}</h1>
            <div className="prose max-w-none">
              {article.content.map((block, idx) => {
                if ((block as Block)._type === 'block') {
                  const blockContent = block as Block;
                  const BlockComponent = blockContent.style === 'h1' ? 'h1'
                    : blockContent.style === 'h2' ? 'h2'
                    : blockContent.style === 'h3' ? 'h3'
                    : blockContent.style === 'blockquote' ? 'blockquote'
                    : 'p';
                  return (
                    <BlockComponent key={idx} className={blockContent.style === 'blockquote' ? 'italic border-l-4 pl-4' : ''}>
                      {blockContent.children.map((child) => {
                        if (child._type === 'span') {
                          if (child.marks?.length) {
                            const mark = blockContent.markDefs?.find(mark => mark._key === child.marks![0]);
                            if (mark && mark._type === 'link') {
                              const href = mark.href.startsWith('http') ? mark.href : `https://${mark.href}`;
                              return (
                                <a
                                  key={child._key}
                                  href={href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {child.text}
                                </a>
                              );
                            }
                          }
                          return <span key={child._key} className={child.marks?.includes('strong') ? 'font-bold' : child.marks?.includes('em') ? 'italic' : ''}>{child.text}</span>;
                        }
                        return null;
                      })}
                    </BlockComponent>
                  );
                } else if ((block as ImageBlock)._type === 'image') {
                  const imageBlock = block as ImageBlock;
                  const imageUrl = `https://cdn.sanity.io/images/z9ibsxa0/production/${imageBlock.asset._ref.split('-')[1]}-${imageBlock.asset._ref.split('-')[2]}.${imageBlock.asset._ref.split('-')[3]}`;
                  return (
                    <div className="flex justify-center" key={idx}>
                      <img
                        src={imageUrl}
                        alt={imageBlock.alt || 'Image'}
                        className="my-4"
                      />
                    </div>
                  );
                } else if ((block as HtmlEmbedBlock)._type === 'htmlEmbed') {
                  const htmlEmbedBlock = block as HtmlEmbedBlock;
                  return (
                    <div
                      key={idx}
                      dangerouslySetInnerHTML={{ __html: htmlEmbedBlock.html || '' }}
                      className="my-4 flex justify-center"
                    />
                  );
                }
                return <p key={idx}>Unsupported block type: {(block as Block)._type}</p>;
              })}
            </div>
          </div>
        </div>

        {/* Rating Section */}
        <div className="mt-8 text-center">
          <h2 className="text-xl font-semibold mb-4">How did we do?</h2>
          <div className="flex justify-center space-x-4">
            {['😍', '😊', '😐'].map((emoji, index) => (
              <button
                key={index}
                className={`text-4xl hover:scale-110 transition-transform ${selectedRating === 3 - index ? 'text-yellow-500' : ''}`}
                onClick={() => handleRatingClick(3 - index)}
                disabled={hasRated}
              >
                {emoji}
              </button>
            ))}
          </div>
          {hasRated && <p className="mt-2">Thank you for your feedback!</p>}
        </div>

        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Related Articles</h2>
            <ul className="space-y-2">
              {article.relatedArticles.map((relatedArticle) => (
                <li key={relatedArticle.slug}>
                  <Link href={`/article/${relatedArticle.slug}`} className="text-blue-600 hover:underline">
                    {relatedArticle.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
