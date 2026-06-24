// 集中管理 GROQ 查詢，頁面引用即可。

// 影像投影：展開 asset 取 lqip（模糊預載底）＋ dimensions（寬高比，杜絕版面跳動）。
// 外層 ... 保留 hotspot/crop/_type，asset->{_id,...} 讓 urlFor 仍能組網址。
const IMG = `{ ..., asset->{ _id, metadata { lqip, dimensions } } }`;

// 列表共用欄位（含 status / featured / capture：半真簽名與「進行中」綠標需要）。
const LIST_FIELDS = `
  title,
  "slug": slug.current,
  publishedAt,
  cover ${IMG},
  category,
  status,
  featured,
  capture,
  "themes": themes[]->{title, "slug": slug.current}
`;

// 索引排序：精選置頂，其餘依日期。
const LIST_ORDER = `order(coalesce(featured, false) desc, publishedAt desc)`;

export const POSTS_LIST = `
  *[_type == "post" && defined(slug.current) && status != "draft"] | ${LIST_ORDER}{
    ${LIST_FIELDS}
  }
`;

export const ARTWORKS_LIST = `
  *[_type == "post" && defined(slug.current) && status != "draft" && (!defined(category) || category == "artwork")] | ${LIST_ORDER}{
    ${LIST_FIELDS}
  }
`;

export const GALLERIES_LIST = `
  *[_type == "post" && defined(slug.current) && status != "draft" && category == "gallery"] | ${LIST_ORDER}{
    ${LIST_FIELDS}
  }
`;

export const ESSAYS_LIST = `
  *[_type == "post" && defined(slug.current) && status != "draft" && category == "essay"] | ${LIST_ORDER}{
    ${LIST_FIELDS}
  }
`;

export const POST_BY_SLUG = `
  *[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    publishedAt,
    cover ${IMG},
    category,
    status,
    featured,
    capture,
    body,
    gallery[] ${IMG},
    "themes": themes[]->{title, "slug": slug.current},
    "themeRefs": themes[]._ref,
    // 上一件 / 下一件（同分類，依日期相鄰）
    "prev": *[_type == "post" && defined(slug.current) && status != "draft" && category == ^.category && publishedAt < ^.publishedAt] | order(publishedAt desc)[0]{
      title, "slug": slug.current, cover, category
    },
    "next": *[_type == "post" && defined(slug.current) && status != "draft" && category == ^.category && publishedAt > ^.publishedAt] | order(publishedAt asc)[0]{
      title, "slug": slug.current, cover, category
    },
    // 同主題的關聯作品（排除自身，最多 4）
    "related": *[_type == "post" && defined(slug.current) && status != "draft" && _id != ^._id && count(themes[@._ref in ^.themes[]._ref]) > 0] | order(publishedAt desc)[0...4]{
      title, "slug": slug.current, cover, category,
      "themes": themes[]->{title, "slug": slug.current}
    }
  }
`;

export const POST_SLUGS = `
  *[_type == "post" && defined(slug.current) && status != "draft"].slug.current
`;

export const THEMES_LIST = `
  *[_type == "theme" && defined(slug.current)] | order(coalesce(order, 9999) asc, title asc){
    title,
    "slug": slug.current,
    description,
    cover,
    "count": count(*[_type == "post" && status != "draft" && references(^._id)])
  }
`;

export const THEME_BY_SLUG = `
  *[_type == "theme" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    description,
    cover,
    "posts": *[_type == "post" && status != "draft" && references(^._id)] | order(publishedAt desc){
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
