const https = require("https");
const { resolve } = require("path");
const get_func = (url) =>
    new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                if (response.statusCode === 429) {
                    console.log("Rate limit exceeded.");
                    resolve("");
                }
                reject(new Error("Https GET Request Error: " + String(response.statusCode)));
            }
            let chunks_of_data = [];
            response.on('data', (fragments) => {
                chunks_of_data.push(fragments);
            });
    
            response.on('end', () => {
                let response_body = Buffer.concat(chunks_of_data);
                // promise resolved on success
                resolve(JSON.parse(response_body));
            });
    
            response.on('error', (error) => {
                // promise rejected on error
                console.log("Error on getting the URL");
                reject(error);
            });
        });
    });
//exports a function which takes an url and send an https 
//get request to that url, and then returns a promise
module.exports = get_func;

