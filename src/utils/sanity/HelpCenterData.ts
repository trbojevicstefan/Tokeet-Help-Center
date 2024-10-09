import { createClient } from '@sanity/client';
import groq from 'groq';

// Create the Sanity client
const client = createClient({
  projectId: 'z9ibsxa0',        // Use your project ID
  dataset: 'production',        // Use your dataset name
  apiVersion: '2022-03-07',     // Use the correct API version
  useCdn: true,                 // Use `true` for faster, cached responses
  token: process.env.SANITY_API_TOKEN // Or use your new API token directly
});

export default client;

// Queries
const allArticlesQuery = groq`
  *[_type == "article"] {
    _id,
    title,
    description,
    "slug": slug.current
  }
`;

const singleArticleQuery = groq`
  *[_type == "article" && slug.current == $slug] {
    _id,
    title,
    description,
    content,
    "category": category->{
      title,
      "slug": slug.current
    },
    "subCategory": subCategory->{
      title,
      "slug": slug.current
    },
    "author": author->name
  }[0]
`;

const allCategoriesQuery = groq`
  *[_type == "category"] {
    _id,
    title,
    "slug": slug.current,
    "subCategoriesCount": count(*[_type == "subCategory" && references(^._id)]),
    "articlesCount": count(*[_type == "article" && references(^._id)])
  }
`;


const categoryDataQuery = groq`
  *[_type == "category" && slug.current == $slug] {
    _id,
    title,
    "subCategories": *[_type == "subCategory" && references(^._id)] {
      _id,
      title,
      "slug": slug.current
    },
    "articles": *[_type == "article" && references(^._id)] {
      _id,
      title,
      description,
      "slug": slug.current
    }
  }[0]
`;

const subcategoryDataQuery = groq`
  *[_type == "subCategory" && slug.current == $slug] {
    _id,
    title,
    "articles": *[_type == "article" && references(^._id)] {
      _id,
      title,
      description,
      "slug": slug.current
    }
  }[0]
`;

const topArticlesQuery = `
  *[_type == "article"] | order(viewCount desc)[0...3] {
    _id,
    title,
    description,
    "slug": slug.current,
    viewCount
  }
`;

// Functions
export async function fetchHelpArticles() {
  return await client.fetch(allArticlesQuery);
}

export async function fetchSingleArticle(slug: string) {
  return await client.fetch(singleArticleQuery, { slug });
}

export async function fetchHelpCategories() {
  return await client.fetch(allCategoriesQuery);
}


export async function fetchCategoryData(slug: string) {
  return await client.fetch(categoryDataQuery, { slug });
}

export async function fetchSubcategoryData(slug: string) {
  return await client.fetch(subcategoryDataQuery, { slug });
}

export async function fetchTopArticles() {
  return await client.fetch(topArticlesQuery);
}