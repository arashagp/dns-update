import https from "https";

import "dotenv/config";

const getPublicIP = () => {
    return new Promise((resolve, reject) => {
        https
            .get("https://api.ipify.org", (res) => {
                let data = "";

                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on("end", () => {
                    resolve(data); // Return the public IP address
                });
            })
            .on("error", (error) => {
                reject(error); // Handle any errors
            });
    });
};

const updateDNSRecord = (zoneId, recordId, ip, apiToken) => {
    const options = {
        hostname: "api.cloudflare.com",
        path: `/client/v4/zones/${zoneId}/dns_records/${recordId}`,
        method: "PUT",
        headers: {
            Authorization: `Bearer ${apiToken}`,
            "Content-Type": "application/json",
        },
    };

    const postData = JSON.stringify({
        type: "A",
        name: "agpagp.ir", // Change to your actual domain
        content: ip,
        ttl: 120,
        proxied: true, // Set to true if you want Cloudflare to proxy traffic
    });

    const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => {
            data += chunk;
        });
        res.on("end", () => {
            console.log("DNS Update Response:", data);
        });
    });

    req.on("error", (error) => {
        console.log("Error updating DNS:", error);
    });

    // Write the data to the request body
    req.write(postData);
    req.end();
};

// Replace these with your actual values
const zoneId = process.env.ZONE_ID;
const recordId = process.env.RECORD_ID;
const apiToken = process.env.API_TOKEN;

const time = 60 * 1000 * 60 * 2; // 2 hours

setInterval(() => {
    getPublicIP()
        .then((ip) => {
            console.log("Your public IP address is:", ip);
            updateDNSRecord(zoneId, recordId, ip, apiToken); // Update DNS record with new IP
        })
        .catch((error) => {
            console.error("Error fetching IP address:", error);
        });
}, time);
