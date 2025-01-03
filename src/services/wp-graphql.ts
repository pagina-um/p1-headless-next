import { graphql } from "gql.tada";
import { cacheExchange, createClient, fetchExchange } from "@urql/core";
import { registerUrql } from "@urql/next/rsc";

export const makeClient = () => {
  return createClient({
    url: process.env.NEXT_PUBLIC_GQL_URL as string,
    exchanges: [cacheExchange, fetchExchange],
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

export const GET_POSTS_BY_CATEGORY = graphql(`
  query GetPostsByCategory($categoryId: Int!, $postsPerPage: Int!) {
    posts(where: { categoryId: $categoryId }, first: $postsPerPage) {
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
    posts(first: 10) {
      nodes {
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
