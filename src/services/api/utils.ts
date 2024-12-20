export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    console.error('API Error:', error);
    throw new Error(`API error: ${response.status}`);
  }
  return response.json();
}