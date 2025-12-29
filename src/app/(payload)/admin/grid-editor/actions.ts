'use server'

import { getPayload } from 'payload';
import config from '@payload-config';
import { GridState, PayloadPost, PayloadCategory } from '@/types';

// Grid Layout Operations

export async function getGridLayout(id: string) {
  try {
    const payload = await getPayload({ config });
    const layout = await payload.findByID({
      collection: 'grid-layouts',
      id,
    });
    return layout;
  } catch (error: any) {
    console.error('Failed to fetch grid layout:', error);
    throw new Error(`Error fetching grid layout: ${error.message}`);
  }
}

export async function getActiveGridLayout() {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'grid-layouts',
      where: {
        isActive: {
          equals: true,
        },
      },
      limit: 1,
    });

    const activeLayout = result.docs[0];
    if (!activeLayout) {
      return {
        gridState: {
          blocks: [],
          createdAt: new Date().toISOString(),
        },
      };
    }

    return activeLayout;
  } catch (error: any) {
    console.error('Failed to fetch active grid layout:', error);
    throw new Error(`Error fetching active grid layout: ${error.message}`);
  }
}

export async function saveGridLayout(data: {
  gridState: GridState;
  name?: string;
  id?: string;
}) {
  try {
    const payload = await getPayload({ config });

    if (data.id) {
      // Update existing layout
      const updated = await payload.update({
        collection: 'grid-layouts',
        id: data.id,
        data: {
          gridState: data.gridState as unknown as Record<string, unknown>,
          ...(data.name && { name: data.name }),
        },
      });

      return {
        success: true,
        layout: updated,
        message: 'Grid layout updated successfully',
      };
    }

    // Create new layout
    const created = await payload.create({
      collection: 'grid-layouts',
      data: {
        name: data.name || 'New Grid Layout',
        gridState: data.gridState as unknown as Record<string, unknown>,
      },
    });

    return {
      success: true,
      layout: created,
      message: 'Grid layout created successfully',
    };
  } catch (error: any) {
    console.error('Failed to save grid layout:', error);
    return {
      success: false,
      error: 'Failed to save grid layout',
      details: error.message,
    };
  }
}

// Post Operations

export async function getPost(id: string | number) {
  try {
    const payload = await getPayload({ config });

    // Try by ID first, then by wpDatabaseId
    let post: PayloadPost | null = null;

    try {
      post = await payload.findByID({
        collection: 'posts',
        id: Number(id),
        depth: 2,
      }) as PayloadPost;
    } catch {
      // Try by wpDatabaseId
      const result = await payload.find({
        collection: 'posts',
        where: {
          wpDatabaseId: { equals: parseInt(String(id)) },
        },
        limit: 1,
        depth: 2,
      });
      post = (result.docs[0] as PayloadPost) || null;
    }

    if (!post) {
      throw new Error('Post not found');
    }

    return post;
  } catch (error: any) {
    console.error('Failed to fetch post:', error);
    throw new Error(`Error fetching post: ${error.message}`);
  }
}

export async function getPostsByCategory(categoryId: string | number, limit: number = 10) {
  try {
    const payload = await getPayload({ config });

    // First resolve category
    let category: PayloadCategory | null = null;
    try {
      category = await payload.findByID({
        collection: 'categories',
        id: String(categoryId),
      }) as PayloadCategory;
    } catch {
      const result = await payload.find({
        collection: 'categories',
        where: {
          wpDatabaseId: { equals: Number(categoryId) },
        },
        limit: 1,
      });
      category = (result.docs[0] as PayloadCategory) || null;
    }

    if (!category) {
      throw new Error('Category not found');
    }

    // Fetch posts
    const postsResult = await payload.find({
      collection: 'posts',
      where: {
        categories: { in: [category.id] },
        _status: { equals: 'published' },
      },
      limit,
      sort: '-publishedAt',
      depth: 2,
    });

    return {
      posts: postsResult.docs as PayloadPost[],
      category,
    };
  } catch (error: any) {
    console.error('Failed to fetch posts by category:', error);
    throw new Error(`Error fetching posts by category: ${error.message}`);
  }
}

// Category Operations

export async function getCategories() {
  try {
    const payload = await getPayload({ config });
    const result = await payload.find({
      collection: 'categories',
      limit: 100,
      sort: 'name',
    });

    return { docs: result.docs as PayloadCategory[] };
  } catch (error: any) {
    console.error('Failed to fetch categories:', error);
    throw new Error(`Error fetching categories: ${error.message}`);
  }
}

export async function getCategory(id: string | number) {
  try {
    const payload = await getPayload({ config });

    // Try to find by ID first
    try {
      const category = await payload.findByID({
        collection: 'categories',
        id: Number(id),
      });
      return category;
    } catch {
      // If not found by ID, try by wpDatabaseId
      const result = await payload.find({
        collection: 'categories',
        where: {
          wpDatabaseId: {
            equals: parseInt(String(id)),
          },
        },
        limit: 1,
      });

      if (result.docs.length > 0) {
        return result.docs[0];
      }
      throw new Error('Category not found');
    }
  } catch (error: any) {
    console.error('Failed to fetch category:', error);
    throw new Error(`Error fetching category: ${error.message}`);
  }
}
