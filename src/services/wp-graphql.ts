import { graphql } from "gql.tada";
import { cacheExchange, createClient, fetchExchange } from "@urql/core";
import { registerUrql } from "@urql/next/rsc";

export const makeClient = () => {
  return createClient({
    url: (process.env.NEXT_PUBLIC_WP_URL + "graphql") as string,
    exchanges: [cacheExchange, fetchExchange],
    fetchOptions: {
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_HOST_USER}:${process.env.NEXT_PUBLIC_HOST_PASS}`
        ).toString("base64")}`,
      },
    },
  });
};

export const { getClient } = registerUrql(makeClient);

export const GET_CATEGORIES = graphql(`
  query GetCategories {
    categories(first: 100) {
      nodes {
        id
        name
        slug
        count
        databaseId
      }
    }
  }
`);

export const GET_POSTS_BY_CATEGORY_SLUG = graphql(`
  query GetPostsByCategorySlug(
    $slug: String!
    $postsPerPage: Int!
    $after: String
  ) {
    categories(where: { slug: [$slug] }) {
      nodes {
        name
      }
    }

    posts(where: { categoryName: $slug }, first: $postsPerPage, after: $after) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      nodes {
        id
        title
        content
        excerpt
        date
        slug
        uri
        postFields {
          antetitulo
          chamadaDestaque
          chamadaManchete
        }
        categories {
          nodes {
            id
            name
          }
        }
        postFields {
          chamadaDestaque
        }
        author {
          node {
            name
            avatar {
              url
            }
          }
        }
        featuredImage {
          node {
            sourceUrl
            srcSet
            altText
          }
        }
      }
    }
  }
`);

export const GET_POSTS_BY_TAG_SLUG = graphql(`
  query GetPostsByTagSlug($slug: String!, $postsPerPage: Int!, $after: String) {
    tags(where: { slug: [$slug] }) {
      nodes {
        name
      }
    }

    posts(
      where: { tag: $slug, status: PUBLISH }
      first: $postsPerPage
      after: $after
    ) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      nodes {
        id
        title
        content
        excerpt
        date
        slug
        uri
        postFields {
          antetitulo
          chamadaDestaque
          chamadaManchete
        }
        categories {
          nodes {
            id
            name
          }
        }
        author {
          node {
            name
            avatar {
              url
            }
          }
        }
        featuredImage {
          node {
            sourceUrl
            srcSet
            altText
          }
        }
      }
    }
  }
`);

export const GET_POSTS_BY_CATEGORY = graphql(`
  query GetPostsByCategory(
    $categoryId: Int
    $sameCategoryIdAsString: ID!
    $postsPerPage: Int!
    $after: String
    $excludePostIds: [ID!]
  ) {
    category(id: $sameCategoryIdAsString, idType: DATABASE_ID) {
      id
      name
      slug
    }
    posts(
      where: {
        categoryId: $categoryId
        status: PUBLISH
        notIn: $excludePostIds
      }
      first: $postsPerPage
      after: $after
    ) {
      pageInfo {
        endCursor
        hasNextPage
        hasPreviousPage
        startCursor
      }
      nodes {
        id
        title
        content
        excerpt
        date
        slug
        uri
        categories {
          nodes {
            id
            name
          }
        }
        author {
          node {
            name
            avatar {
              url
            }
          }
        }
        postFields {
          antetitulo
          chamadaDestaque
          chamadaManchete
        }
        featuredImage {
          node {
            sourceUrl
            srcSet
            altText
          }
        }
      }
    }
  }
`);

export const GET_POST_BY_ID = graphql(`
  query GetPostById($id: ID!) {
    post(id: $id, idType: DATABASE_ID) {
      id
      title
      uri
      excerpt
      date
      slug
      postFields {
        antetitulo
        chamadaDestaque
        chamadaManchete
      }
      tags {
        nodes {
          id
          name
        }
      }
      categories {
        nodes {
          id
          name
        }
      }
      author {
        node {
          name
        }
      }
      featuredImage {
        node {
          sourceUrl
          altText
          srcSet
        }
      }
    }
  }
`);

export const GET_LATEST_POSTS = graphql(`
  query GetLatestPosts {
    posts(first: 40, where: { status: PUBLISH }) {
      nodes {
        id
        databaseId
        title
        date
        slug
        categories {
          nodes {
            id
            name
          }
        }
      }
    }
  }
`);

export const GET_POST_BY_SLUG = graphql(`
  query GetPostBySlug($slug: String!) {
    postBy(slug: $slug) {
      id
      title
      content
      date
      slug
      uri
      modified
      categories {
        nodes {
          id
          name
        }
      }
      author {
        node {
          name
          avatar {
            url
            width
            foundAvatar
          }
        }
      }
      postFields {
        antetitulo
        chamadaDestaque
        chamadaManchete
      }
      featuredImage {
        node {
          sourceUrl
          srcSet
          altText
        }
      }
    }
  }
`);

export const GET_LATEST_POSTS_FOR_STATIC_GENERATION = graphql(`
  query GetFirstThousandPosts($first: Int!) {
    posts(
      first: $first
      where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }
    ) {
      edges {
        node {
          slug
          date
          modified
        }
      }
    }
  }
`);

export const GET_ALL_PAGES = graphql(`
  query GetAllPages {
    pages(first: 100) {
      nodes {
        id
        title
        content
        uri
      }
    }
  }
`);

export const GET_PAGE_BY_SLUG = graphql(`
  query GetPageBySlug($slug: String!) {
    pageBy(uri: $slug) {
      id
      title
      content
      uri
    }
  }
`);
