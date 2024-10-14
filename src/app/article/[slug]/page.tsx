// /src/app/articles/[slug]/page.tsx

import React from 'react';
import ArticleView from '@/components/article-view';

interface ArticlePageProps {
  params: {
    slug: string;
  };
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = params; // Extract slug from params

  if (!slug) {
    console.log("Slug is not available yet, rendering loading state.");
    return <div>Loading...</div>;
  }

  return (
    <div>
      <ArticleView slug={slug} />
    </div>
  );
}
