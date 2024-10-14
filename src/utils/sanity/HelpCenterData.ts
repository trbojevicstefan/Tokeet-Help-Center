import { createClient } from '@sanity/client';

// Create the Sanity client
const client = createClient({
  projectId: 'z9ibsxa0',        // Use your project ID
  dataset: 'production',        // Use your dataset name
  apiVersion: '2022-03-07',     // Use the correct API version
  useCdn: true,                 // Use `true` for faster, cached responses
  token: process.env.SANITY_API_TOKEN // Or use your new API token directly
});

export const fetchHelpCategories = async () => {
  const query = `{
    "categories": *[_type == "category"] {
      title,
      "slug": slug.current,
      description,
    },
    "subcategories": *[_type == "subCategory"] {
      title,
      "slug": slug.current,
      description,
      category-> {
        title,
        "slug": slug.current
      },
    },
    "articles": *[_type == "article"] {
      title,
      "slug": slug.current,
      description,
      body,
      publishedAt,
      category-> {
        title,
        "slug": slug.current
      },
      subCategory-> {
        title,
        "slug": slug.current
      }
    }
  }`;

  return await client.fetch(query);
};


// utils/sanity/HelpCenterData.js
export const fetchTopArticles = async () => {
  const query = `*[_type == "article"] | order(viewCount desc)[0...3] {
    title,
    "slug": slug.current,
    description,
    body,
    publishedAt,
    category-> {
      title,
      "slug": slug.current
    },
    subCategory-> {
      title,
      "slug": slug.current
    }
  }`;

  return await client.fetch(query);
};
