export async function forwardRequestcookie(request, newUrl, pathname) {
 
    let targetUrl;

    //console.log(`${newUrl}`); 
    // Determine the appropriate target URL based on the pathname
    if (pathname.includes('inch0ck')) {
        targetUrl = `${newUrl}in.php?`;
    } else if (pathname.includes('ccspt')) {
        targetUrl = `${newUrl}pointer.googleapi.com/?ccspt`;
    } else {
        console.error('Unrecognized pathname');
        return new Response(JSON.stringify({ error: 'Invalid pathname' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Copy request headers
    const headers = new Headers(request.headers);

    // Log each header to the console
    //headers.forEach((value, key) => {
        //console.log(`${key}: ${value}`);
   // });

    // Determine request body based on the content type
    const contentType = request.headers.get('Content-Type');
    let requestBody;

    if (contentType && contentType.includes('application/json')) {
        requestBody = JSON.stringify(await request.json());
    } else if (contentType && contentType.includes('application/x-www-form-urlencoded')) {
        requestBody = new URLSearchParams(await request.formData()).toString();
    } else {
        requestBody = await request.text();
    }

    // Create a new request for the target URL
    try {
        const newRequest = new Request(targetUrl, {
            method: 'POST',
            headers: headers,
            body: requestBody,
        });

        // Fetch response from the target URL
        const response = await fetch(newRequest);
        const responseData = await response.text();

        // Clone response headers and set content type as JSON
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set('Content-Type', 'application/json');

        return new Response(responseData, {
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error('Error fetching target URL:', error);
        return new Response(JSON.stringify({ error: 'Request failed', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
