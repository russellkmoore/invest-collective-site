/**
 * Standardized API response envelope helpers.
 * All /api/v1/ Route Handlers should use these to produce consistent
 * { success, data } / { success, error } envelopes.
 */

/**
 * Return a 200 (or custom status) JSON success response.
 * Shape: { success: true, data: T }
 */
export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data }, { status });
}

/**
 * Return a 201 Created JSON success response.
 * Shape: { success: true, data: T }
 */
export function apiCreated<T>(data: T): Response {
  return apiSuccess(data, 201);
}

/**
 * Return a 400 (or custom status) JSON error response.
 * Shape: { success: false, error: string, details?: unknown }
 */
export function apiError(error: string, status = 400, details?: unknown): Response {
  return Response.json(
    { success: false, error, ...(details !== undefined && { details }) },
    { status }
  );
}
