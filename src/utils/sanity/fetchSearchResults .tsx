import { client } from './sanity.cli'; // Import your Sanity client

// Define the Article interface
interface Article {
  _id: string;
  title: string;
  description: string;
  slug: string;
  content?: {
    children?: Array<{ text?: string }>; // Ensure text is safely handled
  }[];
  snippet?: string; // Optional snippet field to show matched sentence
}

export async function fetchSearchResults(searchTerm: string): Promise<Article[]> {
  const searchQuery = `*[_type == "article" && (title match $searchTerm || description match $searchTerm || content[].children[].text match $searchTerm)] {
    _id,
    title,
    description,
    content,
    "slug": slug.current
  }`;

  // Fetch results from Sanity using the correct parameter object format
  const results: Article[] = await client.fetch(searchQuery, { searchTerm: `${searchTerm}*` });

  // Extract the sentence that contains the search term
  return results.map((article) => {
    const regex = new RegExp(`[^.]*${searchTerm}[^.]*\\.`); // Regex to find the sentence containing the search term

    // Safely access content and children arrays, ensure content is at least an empty array
    const contentMatch = (article.content || [])
      .flatMap((block) => block.children || []) // Handle cases where children is undefined
      .map((child) => child.text || '') // Handle cases where text is undefined
      .find((text) => regex.test(text)); // Find the sentence with the search term

    return {
      ...article,
      snippet: contentMatch || '', // Add the sentence containing the search term
    };
  });
}
