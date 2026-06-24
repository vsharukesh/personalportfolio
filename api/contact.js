export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { name, email, subject, message } = req.body;
    const accessKey = process.env.WEB3FORMS_ACCESS_KEY;

    if (!accessKey) {
        return res.status(500).json({ message: 'Server configuration error: Missing API Key' });
    }

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                access_key: accessKey,
                name,
                email,
                subject,
                message
            })
        });

        const result = await response.json();
        if (response.status === 200) {
            res.status(200).json(result);
        } else {
            res.status(response.status).json(result);
        }
    } catch (error) {
        console.error('Contact Form Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}
