'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs'; // Import Breadcrumbs component
import { fetchSingleArticle } from '@/utils/sanity/HelpCenterData';
import { incrementArticleViewCount } from '@/utils/sanity/incrementViewCount'; // Import the function to increment view count
import { incrementArticleRating } from '@/utils/sanity/incrementArticleRating'; // Import rating increment function
import SkeletonCard from '@/components/ui/skeletonCard'; // Import SkeletonCard

export default function ArticleView() {
  const { slug } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [selectedRating, setSelectedRating] = useState<number | null>(null); // State for storing the selected rating
  const [hasRated, setHasRated] = useState(false); // State to track if the user has rated

  // Function to handle rating submission
  const handleRatingClick = async (rating: number) => {
    setSelectedRating(rating);
    if (article && article._id) {
      await incrementArticleRating(article._id, rating); // Increment the article rating
      setHasRated(true); // User has rated
    }
  };

  useEffect(() => {
    if (typeof slug === 'string') {
      fetchSingleArticle(slug).then(fetchedArticle => {
        setArticle(fetchedArticle);
        incrementArticleViewCount(fetchedArticle._id); // Increment the view count for the article
        setIsLoading(false); // Disable loading state after article is fetched
      });
    }
  }, [slug]);

  if (isLoading) {
    // Return the skeleton while the content is loading
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumbs />
        </div>
        <main className="container mx-auto px-4 py-8">
          <SkeletonCard /> {/* Render SkeletonCard while loading */}
        </main>
      </div>
    );
  }

  if (!article) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs Container */}
      <div className="container mx-auto px-4 py-4"> {/* Align Breadcrumbs */}
        <Breadcrumbs
          category={article?.category ? { slug: article.category.slug, title: article.category.title } : undefined}
          subCategory={article?.subCategory ? { slug: article.subCategory.slug, title: article.subCategory.title } : undefined}
          article={{ title: article.title }}
        />
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6"> {/* Center the content */}
            <h1 className="text-3xl font-bold mb-4 text-center">{article.title}</h1> {/* Centered Title */}
            <div className="prose max-w-none"> {/* Center Text */}
              {article.content.map((block: any, idx: number) => {
                if (block._type === 'block') {
                  const BlockComponent = block.style === 'h1' ? 'h1'
                    : block.style === 'h2' ? 'h2'
                    : block.style === 'h3' ? 'h3'
                    : block.style === 'blockquote' ? 'blockquote'
                    : 'p';
                  return (
                    <BlockComponent key={idx} className={block.style === 'blockquote' ? 'italic border-l-4 pl-4' : ''}>
                      {block.children.map((child: any) => {
                        if (child._type === 'span') {
                          if (child.marks?.length) {
                            const mark = block.markDefs?.find((mark: any) => mark._key === child.marks[0]);
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
                } else if (block._type === 'image') {
                  return (
                    <div className="flex justify-center"> {/* Center Image */}
                      <Image
                        key={idx}
                        src={`https://cdn.sanity.io/images/z9ibsxa0/production/${block.asset._ref.split('-')[1]}-${block.asset._ref.split('-')[2]}.${block.asset._ref.split('-')[3]}`}
                        alt={block.alt || 'Image'}
                        width={800}
                        height={250}
                        className="my-4"
                      />
                    </div>
                  );
                } else if (block._type === 'htmlEmbed') {
                  return (
                    <div
                      key={idx}
                      dangerouslySetInnerHTML={{ __html: block.html || '' }} // Safely handling undefined html content
                      className="my-4 flex justify-center"
                    />
                  );
                }
                return <p key={idx}>Unsupported block type: {block._type}</p>;
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
                onClick={() => handleRatingClick(3 - index)} // 😍 = 3, 😊 = 2, 😐 = 1
                disabled={hasRated} // Disable buttons after rating
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
              {article.relatedArticles.map((relatedArticle: any, index: number) => (
                <li key={index}>
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
