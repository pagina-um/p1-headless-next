import { GridState } from '@/types';

// Initialize Redis client using the KV REST API
const KV_REST_API_URL = process.env.KV_REST_API_URL;
const KV_REST_API_TOKEN = process.env.KV_REST_API_TOKEN;
const GRID_STATE_KEY = 'grid-state';

/**
 * Load grid state from KV Store
 */
export async function loadGridStateRedis(): Promise<GridState | null> {
  try {
    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
      throw new Error("Missing KV Store environment variables");
    }

    const response = await fetch(`${KV_REST_API_URL}/get/${GRID_STATE_KEY}`, {
      headers: {
        Authorization: `Bearer ${KV_REST_API_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`KV Store responded with status: ${response.status}`);
    }

    const responseData = await response.json();
    
    // Extract the actual grid state from the result property
    if (responseData.result) {
      try {
        // The result might be a string that needs to be parsed
        const gridState = typeof responseData.result === 'string' 
          ? JSON.parse(responseData.result) 
          : responseData.result;
        
        return gridState;
      } catch (error) {
        console.error("Error parsing grid state from KV Store result:", error);
        return null;
      }
    }
    
    return responseData;
  } catch (error) {
    console.error("KV Store error loading grid state:", error);
    throw new Error("Failed to load state from KV Store");
  }
}

/**
 * Save grid state to KV Store
 */
export async function saveGridStateRedis(gridState: GridState): Promise<void> {
  try {
    if (!KV_REST_API_URL || !KV_REST_API_TOKEN) {
      throw new Error("Missing KV Store environment variables");
    }

    const response = await fetch(`${KV_REST_API_URL}/set/${GRID_STATE_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${KV_REST_API_TOKEN}`
      },
      body: JSON.stringify(gridState)
    });

    if (!response.ok) {
      throw new Error(`KV Store responded with status: ${response.status}`);
    }
  } catch (error) {
    console.error("KV Store error saving grid state:", error);
    throw new Error("Failed to save state to KV Store");
  }
}
