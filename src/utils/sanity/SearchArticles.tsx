import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'z9ibsxa0',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2022-03-07', // Replace with your actual API version
});

export const searchArticles = async (query: string) => {
    if (!query) return [];
  
    const queryString = `*[_type == "article" && (title match $query || description match $query || body match $query)] {
      title,
      slug,
      description,
      "foundInBody": select(pt::text(body) match $query => body, null)
    }`;
  
    const params: Record<string, string> = { query: `${query}*` };
  
    try {
      console.log("Running query:", queryString, "with params:", params); // Debug: log query and params
      const results = await client.fetch(queryString, params);
      console.log("Results:", results); // Debug: log results from Sanity
      return results;
    } catch (error) {
      console.error("Error fetching articles:", error);
      return [];
    }
  };
  
