const https = require('https');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, subject, message } = req.body;
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
        return res.status(500).json({ message: 'Server configuration error: Missing API Key' });
    }

    const payload = JSON.stringify({
        access_key: accessKey,
        name,
        email,
        subject,
        message
    });

    const options = {
        hostname: 'api.web3forms.com',
        port: 443,
        path: '/submit',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Content-Length': Buffer.byteLength(payload)
        }
    };

    return new Promise((resolve) => {
        const request = https.request(options, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    if (response.statusCode === 200) {
                        res.status(200).json(result);
                    } else {
                        res.status(response.statusCode).json(result);
                    }
                    resolve();
                } catch (e) {
                    res.status(500).json({ message: 'Error parsing response from Web3Forms' });
                    resolve();
                }
            });
        });

        request.on('error', (error) => {
            console.error('Contact Form Error:', error);
            res.status(500).json({ message: 'Error: ' + error.message });
            resolve();
        });

        request.write(payload);
        request.end();
    });
}
