
export async function forwardRequest(request, newUrl) {
  // Construct the target URL.
  const targetUrl = `${newUrl}pointer.googleapi.com/?`;
    // Handle OPTIONS preflight request
    if (request.method === 'OPTIONS') {
      return new Response(null, {
          status: 204,
          headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization, authorization1, authorizationpass',
              'Access-Control-Max-Age': '86400', // Cache preflight response for 24 hours
          },
      });
  }

  // Clone the incoming request headers.
  const requestHeaders = new Headers(request.headers);
  let requestBody;
  const contentType = requestHeaders.get('Content-Type') || '';

  // Process the request body if the HTTP method permits one.
  if (requestBodyAllowed(request.method)) {
    if (contentType.includes('application/json')) {
      // Retrieve and re-stringify the JSON body.
      requestBody = JSON.stringify(await request.json());
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      // Convert form data into a URL-encoded string.
      requestBody = new URLSearchParams(await request.formData()).toString();
    } else {
      // For other content types, process as plain text.
      requestBody = await request.text();
    }
  }

  try {
    // Construct a new Request object to forward to the target URL.
    const newRequest = new Request(targetUrl, {
      method: request.method,
      headers: requestHeaders,
      body: requestBody,
    });

    // Forward the request and await the response.
    const response = await fetch(newRequest);
    const responseData = await response.text();

    // Clone the response headers and set the correct content type.
    // Note: No CORS headers are added.
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Content-Type', 'application/json');

    return new Response(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Error during request forwarding:', error);

    // Return an error response without any CORS headers.
    return new Response(
      JSON.stringify({
        error: 'Request forwarding failed',
        details: error.message,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

/**
 * Determines whether the given HTTP method permits a request body.
 *
 * @param {string} method - The HTTP method.
 * @returns {boolean} - True if a body is allowed; otherwise, false.
 */
function requestBodyAllowed(method) {
  return !['GET', 'HEAD'].includes(method);
}
