import { createClient } from '@sanity/client';
import groq from 'groq';

// Sanity client setup
const client = createClient({
  projectId: 'z9ibsxa0',
  dataset: 'production',
  apiVersion: '2022-03-07',
  useCdn: true,
  token: process.env.SANITY_API_TOKEN // Or use your new API token directly
});

// Function to fetch article by slug
export async function fetchArticleBySlug(slug: string) {
  if (!slug || typeof slug !== 'string') {
    throw new Error('Slug must be a non-empty string.');
  }

  console.log("Fetching article with slug:", slug); // Debugging the slug value

  const QUERY = groq`
    *[_type == "article" && slug.current == $slug][0] {
      _id,
      title,
      description,
      content,
      "category": {
        title: category->title,
        slug: category->slug.current
      },
      "subCategory": {
        title: subCategory->title,
        slug: subCategory->slug.current
      },
      "author": author->name,
      "relatedArticles": *[_type == "article" && references(^._id)] {
        _id,
        title,
        "slug": slug.current
      }
    }
  `;

  try {
    const article = await client.fetch(QUERY, { slug });
    console.log("Fetched article:", article); // Debugging the fetched article
    return article;
  } catch (error) {
    console.error('Error fetching article:', error);
    throw new Error('Failed to fetch the article');
  }
}
