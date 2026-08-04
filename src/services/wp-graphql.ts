import { graphql, ResultOf } from "gql.tada";
import { cacheExchange, createClient, fetchExchange } from "@urql/core";
import { retryExchange } from "@urql/exchange-retry";
import { registerUrql } from "@urql/next/rsc";
import { WP_URL } from "./config";

// WordPress intermittently answers with an HTML database-error page — under a
// 200 status and a JSON content-type — which urql surfaces as a networkError
// while parsing. Left alone these blips blank out whichever block was unlucky.
const REQUEST_TIMEOUT_MS = 15_000;

export const makeClient = () => {
  return createClient({
    url: (WP_URL + "graphql") as string,
    exchanges: [
      cacheExchange,
      // Retry transport failures only. GraphQL errors are deterministic — the
      // same malformed query would just fail three times.
      retryExchange({
        initialDelayMs: 300,
        maxDelayMs: 5_000,
        randomDelay: true,
        maxNumberAttempts: 3,
        retryIf: (error) => !!error.networkError,
      }),
      fetchExchange,
    ],
    // Evaluated per attempt, so each retry gets a fresh deadline rather than
    // inheriting an already-expired signal.
    fetchOptions: () => ({
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    }),
  });
};

export const { getClient } = registerUrql(makeClient);

export const GET_CATEGORY_METADATA = graphql(`
  query GetCategoryMetadata($slug: String!) {
    categories(where: { slug: [$slug] }) {
      nodes {
        name
        description
      }
    }
  }
`);

export const GET_TAG_METADATA = graphql(`
  query GetTagMetadata($slug: String!) {
    tags(where: { slug: [$slug] }) {
      nodes {
        name
        description
      }
    }
  }
`);

export const GET_AUTHOR_METADATA = graphql(`
  query GetAuthorMetadata($authorSlug: String!) {
    users(where: { nicename: $authorSlug }) {
      nodes {
        name
        description
      }
    }
  }
`);

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
        description
      }
    }

    posts(
      where: {
        categoryName: $slug
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
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
      edges {
        cursor
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
            slug
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
        description
      }
    }

    posts(
      where: {
        tag: $slug
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
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
      edges {
        cursor
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
            slug
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
        orderby: { field: DATE, order: DESC }
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
      edges {
        cursor
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
            slug
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
      content
      databaseId
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
          slug
        }
      }
      featuredImage {
        node {
          sourceUrl
          altText
          srcSet
          mediaDetails {
            height
            width
          }
        }
      }
    }
  }
`);

export type StoryPost = NonNullable<ResultOf<typeof GET_POST_BY_ID>["post"]>;

/**
 * Batched equivalent of GET_POST_BY_ID, used to resolve every story block on a
 * grid page in a single round trip. Rendering one query per block used to fan
 * ~40 concurrent requests at WordPress per render, which pushed response times
 * from <1s to >12s and made individual queries time out.
 *
 * The selection set must stay in sync with GET_POST_BY_ID: nodes from this query
 * are handed to the same components, typed as StoryPost.
 */
export const GET_POSTS_BY_IDS = graphql(`
  query GetPostsByIds($ids: [ID], $first: Int!) {
    posts(where: { in: $ids }, first: $first) {
      nodes {
        id
        title
        content
        databaseId
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
            slug
          }
        }
        featuredImage {
          node {
            sourceUrl
            altText
            srcSet
            mediaDetails {
              height
              width
            }
          }
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
      databaseId
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
          slug
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
  query GetFirstThousandPosts($first: Int!, $after: String) {
    posts(
      first: $first
      after: $after
      where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          slug
          date
          modified
          title
          categories {
            edges {
              node {
                name
              }
            }
          }
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

export const GET_POSTS_BY_SEARCH = graphql(`
  query GetPostsBySearch(
    $searchQuery: String!
    $postsPerPage: Int!
    $after: String
  ) {
    posts(
      where: {
        search: $searchQuery
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
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
            slug
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

export const GET_POSTS_BY_AUTHOR_SLUG = graphql(`
  query GetPostsByAuthorSlug(
    $authorSlug: String!
    $postsPerPage: Int!
    $after: String
  ) {
    users(where: { nicename: $authorSlug }) {
      nodes {
        name
        slug
        description
        avatar {
          url
        }
      }
    }

    posts(
      where: {
        authorName: $authorSlug
        status: PUBLISH
        orderby: { field: DATE, order: DESC }
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
