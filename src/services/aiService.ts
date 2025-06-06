import type { AiChunkedSummaryRequest, AiSummaryWithTasksResponse } from '@/types';
import { api } from '@/services';

/**
 * Sends a request to the AI summary endpoint to generate a summary and action items.
 * @param requestBody Input containing original text and options
 * @returns AI summary and extracted action items
 */
export async function generateAi(
  requestBody: AiChunkedSummaryRequest,
): Promise<AiSummaryWithTasksResponse> {
  const { data } = await api.post<AiSummaryWithTasksResponse>(
    '/ai/generate-chunked-summary-with-action-items',
    requestBody,
  );
  return data;
}
