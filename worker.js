import { processAccessibleUrls } from './utils.js';
import { loadpage } from './utilspro.js';
import { forwardRequest_ck1 } from './forwardRequest-ck-1.js';
import { forwardRequest_in } from './forwardRequest-in.js';
import { forwardRequest } from './forwardRequest.js';
import { callers, textData, securityKeys } from './callers.js';


function createResponse(message, status = 200) {
  return new Response(message, {
    status,
    headers: { 'Content-Type': 'text/html' },
  });
}

export default {
  async fetch(request, env, ctx) {
    // Parse the incoming request URL.
    const url = new URL(request.url);
    const { pathname, searchParams } = url;
    const queryString = searchParams.toString();

    // Retrieve necessary headers.
    const userAgent = request.headers.get('User-Agent') || '';
    const userReferer = request.headers.get('Referer') || '';
    const ipAddress =
      request.headers.get('CF-Connecting-IP') ||
      request.headers.get('X-Forwarded-For') ||
      request.headers.get('Remote-Addr'); // Note: Currently not used, but can be useful for logging.

    let newUrl;
    try {
      // Process the accessible URL using a Base64-encoded User-Agent.
      const urlWorking = await processAccessibleUrls(btoa(userAgent));
      newUrl = urlWorking.accessibleUrl;
    } catch (error) {
      console.error('Error processing accessible URL:', error);
      return createResponse('Error processing request', 500);
    }

    // Validate the request referer to ensure proper routing.
    if (!userReferer.includes('workers')) {
      return createResponse(textData[2], 500);
    }



    try {
      // Determine the appropriate forwarding action based on the pathname.
      if (pathname.includes('ck10')) {
        return await forwardRequest_ck1(request, newUrl, queryString);
      } else if (pathname.includes('inch0ck')) {
        return await forwardRequest_in(request, newUrl, pathname);
      } else if (pathname.includes('pointer')) {
        return await forwardRequest(request, newUrl);
      } else if (pathname.includes('/chekzone')) {
        return createResponse('Bad network', 200);
      } else if (pathname.includes(callers[2])) {
        return await loadpage(request, newUrl, pathname);
      } else {
        // Default response for unmatched routes.
        return createResponse(textData[0], 404);
      }
    } catch (error) {
      console.error('Error forwarding request:', error);
      return createResponse('Error forwarding request', 500);
    }
  },
};
