const express = require('express');
const router = express.Router();
const axios = require('axios');
const to = require('await-to-js').to;

require('dotenv').config();

const API_KEY = process.env.TRANSCRIBE_API_KEY;

async function fetchTranscript(videoUrl) {
    try {
        const url = `https://transcriptapi.com/api/v2/youtube/transcript?video_url=${encodeURIComponent(videoUrl)}`;

        console.log(API_KEY)
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`
            }
        });

        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }

        const data = response.data;

        if (!data.transcript) {
            throw new Error('API returned an invalid response or missing transcript');
        }

        return data.transcript;
    } catch (err) {
        console.error('Failed to fetch transcript:', err.message);
        throw err;
    }
}

function formatTranscript(transcript) {
    const indexedLines = transcript.map((item, index) => `${index + 1}. ${item.text}`);
    return { indexedLines };
}


router.post('/transcribe', async (req, res) => {
    try {
        const { videoUrl, convertLanguage } = req.body;

        if (!videoUrl) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or missing video URL'
            });
        }

        console.log("Video URL received:", videoUrl);
        const [err, transcript] = await to(fetchTranscript(videoUrl));

        if (err) {
            console.error("Error fetching transcript:", err.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch transcript',
                error: err.message
            });
        }
        console.log("Transcript fetched:", transcript);

        const formattedTranscript = formatTranscript(transcript);

        console.log(formattedTranscript);

        res.json({
            targetLanguage: convertLanguage,
            videoUrl,
            ...formattedTranscript
        });
    }
    catch (err) {
        console.log(err)
    }
})


module.exports = router;