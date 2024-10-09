import { defineType, defineField } from 'sanity'

export const author = defineType({
  type: "document",
  name: "author",
  fields: [
    defineField({
      type: "string",
      name: "name",
    }),
    defineField({
      type: "slug",
      name: "slug",
    }),
    defineField({
      type: "string",
      name: "email",
    }),
    defineField({
      type: "image",
      name: "avatar",
      options: { hotspot: true },
    }),
    defineField({
      type: "text",
      name: "bio",
    }),
  ],
});

