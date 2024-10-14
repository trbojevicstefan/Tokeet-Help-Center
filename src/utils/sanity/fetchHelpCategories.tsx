import { client } from './sanity.cli';

export async function fetchHelpCategories() {
  const query = `
    {
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
        articles[]-> {
          title,
          "slug": slug.current,
          description,
          body,
          publishedAt
        }
      },
      "articles": *[_type == "article"] {
        title,
        "slug": slug.current,
        description,
        body,
        publishedAt,
        subCategory-> {
          title,
          "slug": slug.current,
          category-> {
            title,
            "slug": slug.current
          }
        }
      }
    }
  `;

  const data = await client.fetch(query);
  return data;
}
