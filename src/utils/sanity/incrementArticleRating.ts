import { client } from './sanity.cli';

export async function incrementArticleRating(articleId: string, rating: number) {
  await client
    .patch(articleId)
    .setIfMissing({ totalRating: 0, votesCount: 0 }) // Initialize if missing
    .inc({ totalRating: rating, votesCount: 1 }) // Increment total rating and votes count
    .commit();
}
