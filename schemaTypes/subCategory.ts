import { defineType, defineField } from 'sanity'

export const subCategory = defineType({
  type: "document",
  name: "subCategory",
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
      type: "reference",
      name: "category",
      to: [{ type: "category" }],
    }),
  ],
});

