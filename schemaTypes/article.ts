import { defineType, defineField, defineArrayMember } from 'sanity';

export const article = defineType({
  type: "document",
  name: "article",
  fields: [
    defineField({
      type: "string",
      name: "title",
    }),
    defineField({
      type: "slug",
      name: "slug",
    }),
    defineField({
      type: "text",
      name: "description",
    }),
    defineField({
      type: "array",
      name: "content",
      of: [
        defineArrayMember({
          type: "block",
        }),
        defineArrayMember({
          type: "image",
          fields: [
            {
              type: "string",
              name: "caption",
            },
          ],
          options: { hotspot: true },
        }),
        // Adding raw HTML embed support
        defineArrayMember({
          type: "object",
          name: "htmlEmbed",
          title: "HTML Embed",
          fields: [
            defineField({
              name: "html",
              type: "text",
              title: "HTML Code",
              description: "Insert HTML code such as iframe or embed code here",
            }),
          ],
          preview: {
            select: {
              html: 'html',
            },
            prepare(selection) {
              return {
                title: 'HTML Embed',
                subtitle: selection.html ? selection.html.substring(0, 40) + '...' : 'No content',
              };
            },
          },
        }),
      ],
    }),
    defineField({
      type: "reference",
      name: "category",
      to: [{ type: "category" }],
    }),
    defineField({
      type: "reference",
      name: "subCategory",
      to: [{ type: "subCategory" }],
    }),
    defineField({
      type: "reference",
      name: "author",
      to: [{ type: "author" }],
    }),
  ],
});
