const express = require('express');
const router = express.Router();
const axios = require('axios');
const to = require('await-to-js').to;
const VideoJob = require('../models/VideoJob');
const { translateIndexedLines } = require('../services/openaiTranslateService');

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

async function runTranslationJob(jobId) {
    const job = await VideoJob.findById(jobId);
    if (!job) return;

    if (!job.indexedLines || job.indexedLines.length === 0) {
        await VideoJob.findByIdAndUpdate(jobId, {
            status: 'FAILED',
            error: 'No indexedLines provided for translation',
        });
        return;
    }

    try {
        await VideoJob.findByIdAndUpdate(jobId, { status: 'PROCESSING', error: null });

        const translatedLines = await translateIndexedLines({
            indexedLines: job.indexedLines,
            targetLanguage: job.targetLanguage,
        });

        await VideoJob.findByIdAndUpdate(jobId, {
            status: 'COMPLETED',
            translatedLines,
            openai: {
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            },
        });
    } catch (err) {
        logger.warn('Translation job failed', {
            jobId,
            status: err?.status || err?.statusCode,
            message: err?.message,
        });

        await VideoJob.findByIdAndUpdate(jobId, {
            status: 'FAILED',
            error: err?.message || 'Translation failed',
            openai: {
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                lastError: err?.message || 'Translation failed',
            },
        });
    }
}

async function testTranslationWithHardcodedData(indexedLines, targetLanguage, videoUrl) {
    try {
        const job = await VideoJob.create({
            videoUrl: videoUrl,
            clientRequestId: `test-${Date.now()}`,
            targetLanguage,
            indexedLines: indexedLines,
            status: 'PENDING',
        });

        // Start async translation
        setImmediate(() => runTranslationJob(job._id));

        return {
            success: true,
            message: 'TEST: Translation job started with hardcoded data',
            data: {
                jobId: job._id,
                indexedLines: indexedLines,
                targetLanguage,
                note: 'Poll GET /api/video/job/:id to check status',
            },
        };
    } catch (error) {
        console.error('Error translating indexed transcript:', error);
        return { success: false, error: error.message };
    }
};

function formatTranscript(transcript) {
    const indexedLines = transcript.map((item, index) => `${index + 1}. ${item.text}`);
    return { indexedLines };
}


router.post('/transcribe', async (req, res) => {
    try {
        const { videoUrl, convertLanguage, clientRequestId } = req.body;

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

        const { targetLanguage = convertLanguage } = req.body;

        const translationResponse = await testTranslationWithHardcodedData(
            formattedTranscript.indexedLines,
            targetLanguage,
            videoUrl
        );

        if (!translationResponse.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to start translation job',
                error: translationResponse.error
            });
        }

        // res.json({
        //     success: true,
        //     message: 'Transcript and translation job started',
        //     videoUrl,
        //     targetLanguage,
        //     jobId: translationResponse.data.jobId,
        //     status: 'PENDING'
        // });

        // res.json({
        //     targetLanguage: convertLanguage,
        //     videoUrl,
        //     ...formattedTranscript
        // });

        return res.json({
            success: true,
            message: 'Transcript and translation job started',
            videoUrl,
            targetLanguage,
            jobId: translationResponse.data.jobId,
            note: translationResponse.data.note,
            status: 'PENDING',
            targetLanguage: convertLanguage,
            ...formattedTranscript
        });

    }
    catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: err.message
        });
    }
})


module.exports = router;