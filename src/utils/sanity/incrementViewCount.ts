 import { client } from "../sanity/sanity.cli"

// Function to increment view count of an article
export async function incrementArticleViewCount(articleId: string) {
  try {
    await client
      .patch(articleId) // The document _id of the article
      .setIfMissing({ viewCount: 0 }) // If the viewCount field does not exist, set it to 0
      .inc({ viewCount: 1 }) // Increment the viewCount by 1
      .commit(); // Commit the update to the database
    console.log('View count updated successfully!');
  } catch (error) {
    console.error('Failed to update view count:', error);
  }
}
