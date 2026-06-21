import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'theme',
  title: '主題',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: '名稱',
      type: 'string',
      description: '例：光、門檻與邊界、衰敗與生機',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: '網址代稱',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: '描述',
      type: 'text',
      rows: 3,
    }),
  ],
});
