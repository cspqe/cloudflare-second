export async function forwardRequest_ck1(request, newUrl, href = '') {

    const targetUrl = `${newUrl}?${href}`;
    console.log(`Forwarding request to: ${targetUrl}`);

    // Clone request headers
    const headers = new Headers(request.headers);

    // Extract client data from headers 
    const userAgent = request.headers.get('User-Agent') || 'Unknown';
    const clientIp = request.headers.get('X-Forwarded-For') || request.headers.get('CF-Connecting-IP') || 'Unknown IP';

    // Determine if the client is using a mobile or desktop device based on the User-Agent string
    const isMobile = /mobile/i.test(userAgent) ? 'Mobile' : 'Desktop';

    // Append additional client data to headers or query params
    headers.append('X-Client-IP', clientIp);
    headers.append('X-Client-User-Agent', userAgent);
    headers.append('X-Client-Device-Type', isMobile);

    // Determine request body based on the content type, only if method is not GET
    const method = request.method || 'GET';
    let requestBody = null;

    if (method !== 'GET') {
        const contentType = request.headers.get('Content-Type');
        if (contentType) {
            if (contentType.includes('application/json')) {
                requestBody = JSON.stringify(await request.json());
            } else if (contentType.includes('application/x-www-form-urlencoded')) {
                requestBody = new URLSearchParams(await request.formData()).toString();
            } else {
                requestBody = await request.text();
            }
        }
    }

    // Create a new request object for forwarding
    try {
        const newRequest = new Request(targetUrl, {
            method,
            headers,
            body: method !== 'GET' ? requestBody : null, // Don't include body for GET requests
        });

        // Fetch response from the new target URL
        const response = await fetch(newRequest);
        const responseData = await response.text();

        // Return the fetched response data (HTML) with CORS headers
        return new Response(responseData, {
            status: response.status,
            statusText: response.statusText,
            headers: {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*',  // Allow all origins
            },
        });

    } catch (error) {
        console.error('Error fetching target URL:', error);

        // Return detailed error message in HTML format with CORS headers and 500 status
        const errorHtml = `
            <html>
            <head>
                <title>Error</title>
            </head>
            <body>
                <h1>Request Failed</h1>
                <p><strong>Error Details:</strong> ${error.message}</p>
            </body>
            </html>
        `;
        return new Response(errorHtml, {
            status: 500,
            headers: {
                'Content-Type': 'text/html',
                'Access-Control-Allow-Origin': '*',  // Allow all origins even in error response
            },
        });
    }
}
