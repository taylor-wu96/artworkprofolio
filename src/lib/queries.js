// 集中管理 GROQ 查詢，頁面引用即可。

// 影像投影：展開 asset 取 lqip（模糊預載底）＋ dimensions（寬高比，杜絕版面跳動）
// ＋ exif/location（真 EXIF/GPS，餵半真簽名，階段 H）。
// 外層 ... 保留 hotspot/crop/_type，asset->{_id,...} 讓 urlFor 仍能組網址。
const IMG = `{
  ...,
  asset->{
    _id,
    metadata {
      lqip,
      dimensions,
      location,
      exif { ISO, FNumber, ExposureTime, FocalLength, DateTimeOriginal, LensModel }
    }
  }
}`;

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

// 索引排序：純時間倒敘（ROADMAP-v4 A3・痛點5）。
// 原為「精選置頂 → 依日期」，但首頁敘事是「依時間倒敘的檔案」＋年份分組＋「最新」標——
// 精選把舊作插隊到第一位，打斷年份脊椎、讓編號與「最新」各說各話，背叛觀者的時間直覺。
// 檔案的脊椎是時間的誠實，館不替任何一件插隊。featured 欄位保留備用：未來若要「此刻凝視」
// 單格，由獨立查詢取之，不污染檔案排序。
const LIST_ORDER = `order(publishedAt desc)`;

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

// sketch 專屬欄位（生成式作品：引擎／模組／參數／比例）。
const SKETCH_FIELDS = `
  engine,
  sketchId,
  aspectRatio,
  params
`;

// 作品流（首頁索引）：攝影 post（artwork）＋ 互動 sketch 合流，依精選/日期混排。
// 每筆帶 _type，前台據此分流渲染與連結（post→/post，sketch→/sketch）。階段 J。
export const WORKS_FEED = `
  *[
    (
      (_type == "post" && (!defined(category) || category == "artwork")) ||
      _type == "sketch"
    )
    && defined(slug.current) && status != "draft"
  ] | ${LIST_ORDER}{
    _type,
    ${LIST_FIELDS},
    ${SKETCH_FIELDS}
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
    // 所屬系列（反查）＋序列 slug，供作品內頁顯示「系列 · 第 N / M」與序列動線。
    "series": *[_type == "series" && references(^._id)][0]{
      title,
      "slug": slug.current,
      "order": works[]->{ "slug": slug.current }
    },
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

// ---- 互動 / 生成作品（sketch）---------------------------------------
export const SKETCH_BY_SLUG = `
  *[_type == "sketch" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    "slug": slug.current,
    publishedAt,
    cover ${IMG},
    status,
    featured,
    capture,
    ${SKETCH_FIELDS},
    description,
    "themes": themes[]->{title, "slug": slug.current},
    // 同主題的關聯作品（post＋sketch，排除自身，最多 4）——維持作品流動線一致。
    "related": *[
      (_type == "post" || _type == "sketch") && defined(slug.current) && status != "draft"
      && _id != ^._id && count(themes[@._ref in ^.themes[]._ref]) > 0
    ] | order(publishedAt desc)[0...4]{
      _type, title, "slug": slug.current, cover, category,
      "themes": themes[]->{title, "slug": slug.current}
    }
  }
`;

export const SKETCH_SLUGS = `
  *[_type == "sketch" && defined(slug.current) && status != "draft"].slug.current
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

// ---- 系列 / 組曲（策展序列）-------------------------------------------
export const SERIES_LIST = `
  *[_type == "series" && defined(slug.current)] | order(coalesce(order, 9999) asc, title asc){
    title,
    "slug": slug.current,
    description,
    cover ${IMG},
    "count": count(works[@->status != "draft"])
  }
`;

export const SERIES_BY_SLUG = `
  *[_type == "series" && slug.current == $slug][0]{
    title,
    "slug": slug.current,
    description,
    cover ${IMG},
    // 作品序列：保留作者拖曳的順序，排除草稿。
    "works": works[@->status != "draft"]->{
      title,
      "slug": slug.current,
      category,
      publishedAt,
      capture,
      cover ${IMG}
    }
  }
`;

export const SERIES_SLUGS = `
  *[_type == "series" && defined(slug.current)].slug.current
`;

// 導覽可用性（G1/G3）：哪些「房間」有內容值得進。空房不在大廳擺門——
// 誠實 IA：別讓人推開一扇門進到空房。works/about 恆在，故不計。
export const NAV_COUNTS = `{
  "galleries": count(*[_type == "post" && status != "draft" && category == "gallery"]),
  "essays": count(*[_type == "post" && status != "draft" && category == "essay"]),
  "series": count(*[_type == "series" && defined(slug.current) && count(works[@->status != "draft"]) > 0])
}`;

export const ABOUT_QUERY = `
  *[_type == "about"][0]{
    name,
    photo,
    bio,
    cv[] | order(year desc),
    contact[]
  }
`;
