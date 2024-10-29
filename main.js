const axios = require("axios");
const fs = require("fs");

// Define the URL and request headers
const url = "https://pradan.issdc.gov.in/ch2/protected/browse.xhtml";
const headers = {
    "Accept": "application/xml, text/xml, */*; q=0.01",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Cookie": "FGTServer=5DB1E9B68132028CF7976EE4DF4CBB47C2F908C978D8DADB79380837E680FA20672DD56B0798AF391BF6; JSESSIONID=8f9d4bf04b6847b6c8c9ed6804c8; JSESSIONID=8a6b7692e9a9bbd56a6833c2e503; OAuth_Token_Request_State=11839ad7-557e-4659-921d-776190274054",
};

// Define the POST data (payload)
const data = new URLSearchParams({
    "javax.faces.partial.ajax": "true",
    "javax.faces.source": "tableForm:lazyDocTable",
    "javax.faces.partial.execute": "tableForm:lazyDocTable",
    "javax.faces.partial.render": "tableForm:lazyDocTable",
    "tableForm:lazyDocTable": "tableForm:lazyDocTable",
    "tableForm:lazyDocTable_pagination": "true",
    "tableForm:lazyDocTable_first": "0",
    "tableForm:lazyDocTable_rows": "10",
    "tableForm:lazyDocTable_skipChildren": "true",
    "tableForm:lazyDocTable_encodeFeature": "true",
    "tableForm": "tableForm",
    "tableForm:lazyDocTable_rppDD": "10",
    "tableForm:lazyDocTable_selection": "",
    "tableForm:docDetail_scrollState": "0,0",
});

// Send the POST request and handle response
axios.post(url, data, { headers })
    .then(response => {
        console.log("Request successful!");

        const xmlData = response.data;

        // Base URL for the links
        const baseUrl = "https://pradan.issdc.gov.in";

        // Regex to capture .fits links
        const fitsRegex = /href="([^"]+\.fits[^"]*)"/g;

        // Initialize arrays for separated .fits and .xml links
        const fitsLinks = [];
        const xmlLinks = [];

        // Extract .fits links, replace &amp; with &, and prepend the base URL
        let match;
        while ((match = fitsRegex.exec(xmlData)) !== null) {
            const link = baseUrl + match[1].replace(/&amp;/g, "&");

            // Separate links into fits and xml
            if (link.includes('.xml') && link.includes('.fits')) {
                xmlLinks.push(link); // Add to xml array
            } else if (link.includes('.fits') && !link.includes('.xml')) {
                fitsLinks.push(link); // Add to fits array
            }
        }

        // Create a new object to hold the separated links
        const separatedLinks = {
            fits: fitsLinks,
            xml: xmlLinks,
        };

        // Write the separated data to the JSON file
        if (fitsLinks.length > 0 || xmlLinks.length > 0) {
            fs.writeFileSync('links_1.json', JSON.stringify(separatedLinks, null, 2));
            console.log("Links separated and saved to links_1.json");
        } else {
            console.log("No .fits or .xml links found to save.");
        }
    })
    .catch(error => {
        console.error("Request failed:", error);
    });
