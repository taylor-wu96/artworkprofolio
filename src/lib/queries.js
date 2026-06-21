// 集中管理 GROQ 查詢，頁面引用即可。

export const POSTS_LIST = `
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc){
    title,
    "slug": slug.current,
    publishedAt,
    cover,
    category,
    "themes": themes[]->{title, "slug": slug.current}
  }
`;

export const ARTWORKS_LIST = `
  *[_type == "post" && defined(slug.current) && (!defined(category) || category == "artwork")] | order(publishedAt desc){
    title,
    "slug": slug.current,
    publishedAt,
    cover,
    category,
    "themes": themes[]->{title, "slug": slug.current}
  }
`;

export const GALLERIES_LIST = `
  *[_type == "post" && defined(slug.current) && category == "gallery"] | order(publishedAt desc){
    title,
    "slug": slug.current,
    publishedAt,
    cover,
    category,
    "themes": themes[]->{title, "slug": slug.current}
  }
`;

export const ESSAYS_LIST = `
  *[_type == "post" && defined(slug.current) && category == "essay"] | order(publishedAt desc){
    title,
    "slug": slug.current,
    publishedAt,
    cover,
    category,
    "themes": themes[]->{title, "slug": slug.current}
  }
`;

export const POST_BY_SLUG = `
  *[_type == "post" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    publishedAt,
    cover,
    category,
    body,
    gallery,
    "themes": themes[]->{title, "slug": slug.current}
  }
`;

export const POST_SLUGS = `
  *[_type == "post" && defined(slug.current)].slug.current
`;

export const THEMES_LIST = `
  *[_type == "theme" && defined(slug.current)] | order(title asc){
    title,
    "slug": slug.current,
    description,
    "count": count(*[_type == "post" && references(^._id)])
  }
`;

export const THEME_BY_SLUG = `
  *[_type == "theme" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    description,
    "posts": *[_type == "post" && references(^._id)] | order(publishedAt desc){
      title,
      "slug": slug.current,
      publishedAt,
      category,
      cover
    }
  }
`;

export const THEME_SLUGS = `
  *[_type == "theme" && defined(slug.current)].slug.current
`;

export const ABOUT_QUERY = `
  *[_type == "about"][0]{
    name,
    photo,
    bio,
    cv[] | order(year desc),
    contact[]
  }
`;
