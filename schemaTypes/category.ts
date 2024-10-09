import { defineType, defineField } from 'sanity'

export const category = defineType({
  type: "document",
  name: "category",
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
  ],
});

