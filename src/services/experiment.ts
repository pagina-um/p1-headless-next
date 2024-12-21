import { graphql } from "gql.tada";
import { cacheExchange, createClient, fetchExchange } from "@urql/core";
import { registerUrql } from "@urql/next/rsc";

export const makeClient = () => {
  return createClient({
    url: "https://p1-git.local/graphql",
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
      }
    }
  }
`);

const GET_POSTS_BY_CATEGORY = graphql(`
  query GetPostsByCategory($categoryId: ID!, $postsPerPage: Int!) {
    posts(where: { categoryId: $categoryId }, first: $postsPerPage) {
      nodes {
        id
        title
        content
        excerpt
        date
        slug
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
        }
      }
    }
  }
`);
