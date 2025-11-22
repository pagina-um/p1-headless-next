/**
 * Payload CMS API Service Layer
 *
 * This replaces the WordPress GraphQL queries with Payload Local API calls.
 * All data fetching functions match the original WordPress API interface
 * to minimize changes needed in components.
 */

import { getPayload } from "payload";
import config from "@payload-config";
import { richTextToHtml } from "@/utils/richTextConversion";

// Initialize Payload (cached)
let payloadInstance: any = null;

export async function getPayloadInstance() {
  if (!payloadInstance) {
    payloadInstance = await getPayload({ config });
  }
  return payloadInstance;
}

async function serializePostContent(content: unknown) {
  try {
    return await richTextToHtml(content as any);
  } catch (error) {
    console.error("Failed to convert rich text content", error);
    return "";
  }
}

// ============================================================================
// CATEGORIES
// ============================================================================

export async function getCategories() {
  const payload = await getPayloadInstance();

  const result = await payload.find({
    collection: "categories",
    limit: 100,
    sort: "name",
  });

  return {
    data: {
      categories: {
        nodes: result.docs.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          databaseId: cat.wpDatabaseId || 0,
          count: 0, // TODO: Calculate post count if needed
        })),
      },
    },
    error: null,
  };
}

export async function getCategoryBySlug(slug: string) {
  const payload = await getPayloadInstance();

  const result = await payload.find({
    collection: "categories",
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  if (!result.docs[0]) {
    return { data: null, error: "Category not found" };
  }

  return {
    data: {
      category: {
        id: result.docs[0].id,
        name: result.docs[0].name,
        slug: result.docs[0].slug,
      },
    },
    error: null,
  };
}

// ============================================================================
// POSTS
// ============================================================================

export async function getLatestPosts(limit = 40) {
  const payload = await getPayloadInstance();

  const result = await payload.find({
    collection: "posts",
    where: {
      status: {
        equals: "publish",
      },
    },
    limit,
    sort: "-publishedAt",
    depth: 2, // Include relationships
  });

  return {
    data: {
      posts: {
        nodes: result.docs.map((post: any) => ({
          id: post.id,
          databaseId: post.wpDatabaseId || 0,
          title: post.title,
          date: post.publishedAt,
          slug: post.slug,
          categories: {
            nodes: Array.isArray(post.categories)
              ? post.categories.map((cat: any) => ({
                  id: typeof cat === "object" ? cat.id : cat,
                  name: typeof cat === "object" ? cat.name : "",
                }))
              : [],
          },
        })),
      },
    },
    error: null,
  };
}

export async function getPostBySlug(slug: string) {
  // Validate slug parameter
  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    return { data: null, error: "Invalid slug parameter" };
  }

  const payload = await getPayloadInstance();

  const result = await payload.find({
    collection: "posts",
    where: {
      slug: {
        equals: slug.trim(),
      },
    },
    limit: 1,
    depth: 2,
  });

  if (!result.docs[0]) {
    return { data: null, error: "Post not found" };
  }

  const post = result.docs[0];
  const htmlContent = await serializePostContent(post.content);

  return {
    data: {
      postBy: {
        id: post.id,
        title: post.title,
        content: htmlContent,
        excerpt: post.excerpt || "",
        date: post.publishedAt,
        slug: post.slug,
        uri: post.uri,
        status: post.status,
        postFields: {
          antetitulo: post.antetitulo || null,
          chamadaDestaque: post.chamadaDestaque || null,
          chamadaManchete: post.chamadaManchete || null,
        },
        categories: {
          nodes: Array.isArray(post.categories)
            ? post.categories.map((cat: any) => ({
                id: typeof cat === "object" ? cat.id : cat,
                name: typeof cat === "object" ? cat.name : "",
              }))
            : [],
        },
        tags: {
          nodes: Array.isArray(post.tags)
            ? post.tags.map((tag: any) => ({
                id: typeof tag === "object" ? tag.id : tag,
                name: typeof tag === "object" ? tag.name : "",
              }))
            : [],
        },
        author: {
          node: {
            name: post.author?.name || "Unknown",
            avatar: {
              url: post.author?.avatar || "",
            },
          },
        },
        featuredImage: post.featuredImage
          ? {
              node: {
                sourceUrl:
                  typeof post.featuredImage === "object"
                    ? post.featuredImage.url
                    : "",
                srcSet: "",
                altText:
                  typeof post.featuredImage === "object"
                    ? post.featuredImage.alt
                    : "",
                mediaDetails: {
                  height:
                    typeof post.featuredImage === "object"
                      ? post.featuredImage.height
                      : 0,
                  width:
                    typeof post.featuredImage === "object"
                      ? post.featuredImage.width
                      : 0,
                },
              },
            }
          : null,
      },
    },
    error: null,
  };
}

export async function getPostById(id: string) {
  const payload = await getPayloadInstance();

  // Try to find by WordPress database ID first
  let result = await payload.find({
    collection: "posts",
    where: {
      wpDatabaseId: {
        equals: parseInt(id),
      },
    },
    limit: 1,
    depth: 2,
  });

  // If not found, try by Payload ID
  if (!result.docs[0]) {
    try {
      const post = await payload.findByID({
        collection: "posts",
        id,
        depth: 2,
      });
      result = { docs: [post] };
    } catch (e) {
      return { data: null, error: "Post not found" };
    }
  }

  const post = result.docs[0];
  const htmlContent = await serializePostContent(post.content);

  return {
    data: {
      post: {
        id: post.id,
        title: post.title,
        content: htmlContent,
        excerpt: post.excerpt || "",
        date: post.publishedAt,
        slug: post.slug,
        uri: post.uri,
        postFields: {
          antetitulo: post.antetitulo || null,
          chamadaDestaque: post.chamadaDestaque || null,
          chamadaManchete: post.chamadaManchete || null,
        },
        categories: {
          nodes: Array.isArray(post.categories)
            ? post.categories.map((cat: any) => ({
                id: typeof cat === "object" ? cat.id : cat,
                name: typeof cat === "object" ? cat.name : "",
              }))
            : [],
        },
        tags: {
          nodes: Array.isArray(post.tags)
            ? post.tags.map((tag: any) => ({
                id: typeof tag === "object" ? tag.id : tag,
                name: typeof tag === "object" ? tag.name : "",
              }))
            : [],
        },
        author: {
          node: {
            name: post.author?.name || "Unknown",
          },
        },
        featuredImage: post.featuredImage
          ? {
              node: {
                sourceUrl:
                  typeof post.featuredImage === "object"
                    ? post.featuredImage.url
                    : "",
                srcSet: "",
                altText:
                  typeof post.featuredImage === "object"
                    ? post.featuredImage.alt
                    : "",
                mediaDetails: {
                  height:
                    typeof post.featuredImage === "object"
                      ? post.featuredImage.height
                      : 0,
                  width:
                    typeof post.featuredImage === "object"
                      ? post.featuredImage.width
                      : 0,
                },
              },
            }
          : null,
      },
    },
    error: null,
  };
}

export async function getPostsByCategorySlug(
  slug: string,
  postsPerPage = 10,
  after?: string
) {
  const payload = await getPayloadInstance();

  // First, find the category
  const categoryResult = await payload.find({
    collection: "categories",
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  if (!categoryResult.docs[0]) {
    return { data: null, error: "Category not found" };
  }

  const category = categoryResult.docs[0];

  // Calculate page from cursor (simplified pagination)
  const page = after ? parseInt(Buffer.from(after, "base64").toString()) : 1;

  // Find posts in this category
  // Use 'in' operator with array for hasMany relationship fields
  const result = await payload.find({
    collection: "posts",
    where: {
      categories: {
        in: [category.id], // Must be an array
      },
      status: {
        equals: "publish",
      },
    },
    limit: postsPerPage,
    page,
    sort: "-publishedAt",
    depth: 2,
  });

  const serializedNodes = await Promise.all(
    result.docs.map(async (post: any) => ({
      id: post.id,
      title: post.title,
      content: await serializePostContent(post.content),
      excerpt: post.excerpt || "",
      date: post.publishedAt,
      slug: post.slug,
      uri: post.uri,
      postFields: {
        antetitulo: post.antetitulo || null,
        chamadaDestaque: post.chamadaDestaque || null,
        chamadaManchete: post.chamadaManchete || null,
      },
      categories: {
        nodes: Array.isArray(post.categories)
          ? post.categories.map((cat: any) => ({
              id: typeof cat === "object" ? cat.id : cat,
              name: typeof cat === "object" ? cat.name : "",
            }))
          : [],
      },
      author: {
        node: {
          name: post.author?.name || "Unknown",
          avatar: {
            url: post.author?.avatar || "",
          },
        },
      },
      featuredImage: post.featuredImage
        ? {
            node: {
              sourceUrl:
                typeof post.featuredImage === "object"
                  ? post.featuredImage.url
                  : "",
              srcSet: "",
              altText:
                typeof post.featuredImage === "object"
                  ? post.featuredImage.alt
                  : "",
            },
          }
        : null,
    }))
  );

  return {
    data: {
      categories: {
        nodes: [
          {
            name: category.name,
          },
        ],
      },
      posts: {
        pageInfo: {
          endCursor: Buffer.from(String(page + 1)).toString("base64"),
          hasNextPage: result.hasNextPage,
          hasPreviousPage: result.hasPrevPage,
          startCursor: Buffer.from(String(page)).toString("base64"),
        },
        edges: result.docs.map((post: any) => ({
          cursor: Buffer.from(String(post.id)).toString("base64"),
        })),
        nodes: serializedNodes,
      },
    },
    error: null,
  };
}

export async function getPostsByCategoryId(
  categoryId: number,
  postsPerPage = 10,
  excludePostIds: string[] = []
) {
  const payload = await getPayloadInstance();

  // Find the category by WordPress database ID
  const categoryResult = await payload.find({
    collection: "categories",
    where: {
      wpDatabaseId: {
        equals: categoryId,
      },
    },
    limit: 1,
  });

  if (!categoryResult.docs[0]) {
    return { data: null, error: "Category not found" };
  }

  const category = categoryResult.docs[0];

  // Build where clause with exclusions if provided
  const whereClause: any = {
    categories: {
      in: [category.id], // Must be an array
    },
    status: {
      equals: "publish",
    },
  };

  // Add exclusion filter if there are IDs to exclude
  if (excludePostIds.length > 0) {
    whereClause.and = [
      {
        wpDatabaseId: {
          not_in: excludePostIds.map((id) => parseInt(id)),
        },
      },
    ];
  }

  // Find posts in this category
  const result = await payload.find({
    collection: "posts",
    where: whereClause,
    limit: postsPerPage,
    sort: "-publishedAt",
    depth: 2,
  });

  return {
    data: {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
      },
      posts: {
        nodes: result.docs.map((post: any) => ({
          id: post.id,
          databaseId: post.wpDatabaseId || 0,
          title: post.title,
          content: post.content || "",
          excerpt: post.excerpt || "",
          date: post.publishedAt,
          slug: post.slug,
          uri: post.uri,
          postFields: {
            antetitulo: post.antetitulo || null,
            chamadaDestaque: post.chamadaDestaque || null,
            chamadaManchete: post.chamadaManchete || null,
          },
          categories: {
            nodes: Array.isArray(post.categories)
              ? post.categories.map((cat: any) => ({
                  id: typeof cat === "object" ? cat.id : cat,
                  name: typeof cat === "object" ? cat.name : "",
                }))
              : [],
          },
          author: {
            node: {
              name: post.author?.name || "Unknown",
              avatar: {
                url: post.author?.avatar || "",
              },
            },
          },
          featuredImage: post.featuredImage
            ? {
                node: {
                  sourceUrl:
                    typeof post.featuredImage === "object"
                      ? post.featuredImage.url
                      : "",
                  srcSet: "",
                  altText:
                    typeof post.featuredImage === "object"
                      ? post.featuredImage.alt
                      : "",
                },
              }
            : null,
        })),
      },
    },
    error: null,
  };
}

export async function getPostsByTagSlug(
  slug: string,
  postsPerPage = 10,
  after?: string
) {
  const payload = await getPayloadInstance();

  // First, find the tag
  const tagResult = await payload.find({
    collection: "tags",
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  if (!tagResult.docs[0]) {
    return { data: null, error: "Tag not found" };
  }

  const tag = tagResult.docs[0];
  const page = after ? parseInt(Buffer.from(after, "base64").toString()) : 1;

  // Find posts with this tag
  // Use 'in' operator with array for hasMany relationship fields
  const result = await payload.find({
    collection: "posts",
    where: {
      tags: {
        in: [tag.id], // Must be an array
      },
      status: {
        equals: "publish",
      },
    },
    limit: postsPerPage,
    page,
    sort: "-publishedAt",
    depth: 2,
  });

  return {
    data: {
      tags: {
        nodes: [
          {
            name: tag.name,
          },
        ],
      },
      posts: {
        pageInfo: {
          endCursor: Buffer.from(String(page + 1)).toString("base64"),
          hasNextPage: result.hasNextPage,
          hasPreviousPage: result.hasPrevPage,
        },
        nodes: result.docs.map((post: any) => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || "",
          date: post.publishedAt,
          slug: post.slug,
          uri: post.uri,
          author: {
            node: {
              name: post.author?.name || "Unknown",
            },
          },
          categories: {
            nodes: Array.isArray(post.categories)
              ? post.categories.map((cat: any) => ({
                  name: typeof cat === "object" ? cat.name : "",
                }))
              : [],
          },
          featuredImage: post.featuredImage
            ? {
                node: {
                  sourceUrl:
                    typeof post.featuredImage === "object"
                      ? post.featuredImage.url
                      : "",
                  altText:
                    typeof post.featuredImage === "object"
                      ? post.featuredImage.alt
                      : "",
                },
              }
            : null,
        })),
      },
    },
    error: null,
  };
}

export async function searchPosts(searchTerm: string, limit = 20) {
  const payload = await getPayloadInstance();

  const result = await payload.find({
    collection: "posts",
    where: {
      or: [
        {
          title: {
            contains: searchTerm,
          },
        },
        {
          excerpt: {
            contains: searchTerm,
          },
        },
      ],
      status: {
        equals: "publish",
      },
    },
    limit,
    sort: "-publishedAt",
    depth: 2,
  });

  return {
    data: {
      posts: {
        nodes: result.docs.map((post: any) => ({
          id: post.id,
          title: post.title,
          excerpt: post.excerpt || "",
          date: post.publishedAt,
          slug: post.slug,
          uri: post.uri,
          postFields: {
            antetitulo: post.antetitulo || null,
            chamadaDestaque: post.chamadaDestaque || null,
            chamadaManchete: post.chamadaManchete || null,
          },
          author: {
            node: {
              name: post.author?.name || "Unknown",
            },
          },
          categories: {
            nodes: Array.isArray(post.categories)
              ? post.categories.map((cat: any) => ({
                  name: typeof cat === "object" ? cat.name : "",
                }))
              : [],
          },
          featuredImage: post.featuredImage
            ? {
                node: {
                  sourceUrl:
                    typeof post.featuredImage === "object"
                      ? post.featuredImage.url
                      : "",
                  altText:
                    typeof post.featuredImage === "object"
                      ? post.featuredImage.alt
                      : "",
                },
              }
            : null,
        })),
      },
    },
    error: null,
  };
}

// ============================================================================
// SITEMAP
// ============================================================================

export async function getAllPublishedPosts() {
  const payload = await getPayloadInstance();

  const allPosts: any[] = [];
  let page = 1;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = await payload.find({
      collection: "posts",
      where: {
        status: {
          equals: "publish",
        },
      },
      limit: 100,
      page,
      sort: "-publishedAt",
      depth: 1, // Only need basic info
    });

    allPosts.push(...result.docs);
    hasNextPage = result.hasNextPage;
    page++;
  }

  return {
    data: {
      posts: allPosts.map((post: any) => ({
        id: post.id,
        title: post.title,
        date: post.publishedAt,
        slug: post.slug,
        categories: Array.isArray(post.categories)
          ? post.categories.map((cat: any) => ({
              name: typeof cat === "object" ? cat.name : "",
            }))
          : [],
      })),
    },
    error: null,
  };
}

// ============================================================================
// PAGES
// ============================================================================

export async function getAllPages() {
  const payload = await getPayloadInstance();

  const result = await payload.find({
    collection: "pages",
    limit: 100,
  });

  return {
    data: {
      pages: {
        nodes: result.docs.map((page: any) => ({
          id: page.id,
          title: page.title,
          slug: page.slug,
        })),
      },
    },
    error: null,
  };
}

export async function getPageBySlug(slug: string) {
  const payload = await getPayloadInstance();

  const result = await payload.find({
    collection: "pages",
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  if (!result.docs[0]) {
    return { data: null, error: "Page not found" };
  }

  const page = result.docs[0];

  return {
    data: {
      page: {
        id: page.id,
        title: page.title,
        content: page.content || "",
        slug: page.slug,
      },
    },
    error: null,
  };
}
