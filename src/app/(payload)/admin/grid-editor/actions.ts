'use server'

import {
  getPayloadInstance,
  getPostById as getPostByIdService,
  getPostsByCategoryId as getPostsByCategoryIdService,
  getCategories as getCategoriesService,
} from '@/services/payload-api';
import { GridState } from '@/types';

// Grid Layout Operations

export async function getGridLayout(id: string) {
  try {
    const payload = await getPayloadInstance();
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
    const payload = await getPayloadInstance();
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
    const payload = await getPayloadInstance();

    if (data.id) {
      // Update existing layout
      const updated = await payload.update({
        collection: 'grid-layouts',
        id: data.id,
        data: {
          gridState: data.gridState,
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
        gridState: data.gridState,
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

export async function getPost(id: string) {
  try {
    // Use service layer function that transforms to WordPress format
    const { data, error } = await getPostByIdService(id);
    if (error || !data) {
      throw new Error(error || 'Post not found');
    }
    return data.post;
  } catch (error: any) {
    console.error('Failed to fetch post:', error);
    throw new Error(`Error fetching post: ${error.message}`);
  }
}

export async function getPostsByCategory(categoryId: number, limit: number = 10) {
  try {
    // Use service layer function that transforms to WordPress format
    const { data, error } = await getPostsByCategoryIdService(categoryId, limit);
    if (error || !data) {
      throw new Error(error || 'Posts not found');
    }
    return data;
  } catch (error: any) {
    console.error('Failed to fetch posts by category:', error);
    throw new Error(`Error fetching posts by category: ${error.message}`);
  }
}

// Category Operations

export async function getCategories() {
  try {
    // Use service layer function
    const { data, error } = await getCategoriesService();
    if (error || !data) {
      throw new Error(error || 'Categories not found');
    }
    return { docs: data.categories.nodes };
  } catch (error: any) {
    console.error('Failed to fetch categories:', error);
    throw new Error(`Error fetching categories: ${error.message}`);
  }
}

export async function getCategory(id: string) {
  try {
    const payload = await getPayloadInstance();

    // Try to find by ID first
    try {
      const category = await payload.findByID({
        collection: 'categories',
        id,
      });
      return category;
    } catch {
      // If not found by ID, try by wpDatabaseId
      const result = await payload.find({
        collection: 'categories',
        where: {
          wpDatabaseId: {
            equals: parseInt(id),
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
