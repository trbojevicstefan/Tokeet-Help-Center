'use client';

import Link from 'next/link';
import { AiFillHome } from 'react-icons/ai'; // Import the home icon

interface BreadcrumbProps {
  category?: { slug: string; title: string };
  subCategory?: { slug: string; title: string };
  article?: { title: string };
}

export default function Breadcrumbs({ category, subCategory, article }: BreadcrumbProps) {
  return (
    <nav className="text-sm text-gray-600 mb-4 flex items-center">
      {/* Home icon */}
      <Link href="/" className="hover:underline flex items-center">
        <AiFillHome className="mr-1" /> {/* Home icon */}
        Home
      </Link>

      {category?.slug && category?.title && (
        <>
          <span className="mx-2">&gt;</span>
          <Link href={`/category/${category.slug}`} className="hover:underline">
            {category.title}
          </Link>
        </>
      )}

      {subCategory?.slug && subCategory?.title && (
        <>
          <span className="mx-2">&gt;</span>
          <Link href={`/subcategory/${subCategory.slug}`} className="hover:underline">
            {subCategory.title}
          </Link>
        </>
      )}

      {article?.title && (
        <>
          <span className="mx-2">&gt;</span>
          <span>{article.title}</span>
        </>
      )}
    </nav>
  );
}
