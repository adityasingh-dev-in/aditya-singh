import { defineConfig, s } from 'velite'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import remarkGfm from 'remark-gfm'

const computeReadingTime = (wordCount: number): string => {
  const wordsPerMinute = 200
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return `${minutes} min read`
}

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: {
    posts: {
      name: 'Post',
      pattern: 'posts/**/*.mdx',
      schema: s
        .object({
          title: s.string().max(120),
          slug: s.slug('posts'),
          date: s.isodate().or(s.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
          description: s.string().max(250),
          tags: s.array(s.string()).default([]),
          published: s.boolean().default(true),
          coverImage: s.string().url().optional(),
          body: s.mdx(),
        })
        .transform((data) => ({
          ...data,
          permalink: `/blog/${data.slug}`,
          // body from s.mdx() is compiled JS string; use description length as word count proxy
          readingTime: computeReadingTime(
            data.description.split(' ').length + 200,
          ),
        })),
    },
  },
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        { behavior: 'wrap', properties: { className: ['anchor'] } },
      ],
      [
        rehypePrettyCode,
        {
          theme: 'github-dark-dimmed',
          keepBackground: true,
          defaultLang: 'plaintext',
        },
      ],
    ],
  },
})
