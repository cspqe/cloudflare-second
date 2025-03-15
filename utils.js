import { urls } from './url_list.js';
import {bannedEmails} from './banned.js';


 
// Function to check if a URL is accessible
export function isUrlAccessible(url,userAgent) {
    
    // Append a timestamp to the URL to prevent caching
    const urlWithTimestamp = `${url}?ck=1&ua=${userAgent}`;

    return fetch(urlWithTimestamp, {
        method: 'HEAD',
    })
    .then(response => {
        if (response.ok) {
            return true; // URL is accessible
        }
        return false; // URL is not accessible
    })
    .catch(error => {
        console.error('Error fetching URL:', error);
        return false; // Return false if there is an error
    });
}

// Function to find the first accessible URL from a list of URLs
export async function findFirstAccessibleUrl(urls,userAgent) {
    const badUrls = [];
    for (const url of urls) {
        try {
            const isAccessible = await isUrlAccessible(url,userAgent);
           
            if (isAccessible) {
                return { accessibleUrl: url, badUrls };
            } else {
               // badUrls.push(url);
            }
        } catch (error) {
            console.error('Error checking URL accessibility:', error);
           // badUrls.push(url);
        }
    }
    return { accessibleUrl: null, badUrls };
}
 
// Function to process accessible URLs and update the DOM   
export function processAccessibleUrls(userAgent) {


    return findFirstAccessibleUrl(urls,userAgent)
        .then(({ accessibleUrl, badUrls }) => {
            if (accessibleUrl) {
              //  console.log('Accessible URL:', accessibleUrl);
            }

            if (badUrls.length > 0) {
             //  console.log('Inaccessible URLs:', badUrls);
            }

            return { accessibleUrl, badUrls };
        })
        .catch((error) => {
           // console.error('An error occurred:', error);
            return { accessibleUrl: null, badUrls: urls }; // Return all URLs as bad if an error occurs
        });
}

export function isStringBanned(targetString) {
    return bannedEmails.some(bannedString => targetString.includes(bannedString));
  }

// Exported functions
export default {
    processAccessibleUrls,
    isStringBanned
};
