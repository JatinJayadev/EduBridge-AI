const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');
const { pipeline } = require('stream/promises');
require('dotenv').config();

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const TIMEOUT_MS = parseInt(process.env.ELEVENLABS_TIMEOUT_MS || '60000', 10);

/**
 * ElevenLabs API client for text-to-speech conversion
 */
class ElevenLabsClient {
  constructor() {
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not set in environment variables');
    }

    this.apiKey = ELEVENLABS_API_KEY;
    this.baseURL = ELEVENLABS_API_URL;
    this.timeout = TIMEOUT_MS;
  }

  /**
   * Convert text to speech and save to file
   * @param {string} text - Text to convert to speech
   * @param {string} outputPath - Path where audio file will be saved
   * @param {Object} options - Optional parameters
   * @param {string} options.voiceId - Voice ID (default from env)
   * @param {string} options.modelId - Model ID (default from env)
   * @param {Object} options.voiceSettings - Voice settings (stability, similarity_boost)
   * @returns {Promise<Object>} - Result with file path and metadata
   */
  async textToSpeech(text, outputPath, options = {}) {
    const voiceId = options.voiceId || process.env.ELEVENLABS_VOICE_ID || 'JBFqnCBsd6RMkjVDRZzb';
    const modelId = options.modelId || process.env.ELEVENLABS_MODEL || 'eleven_multilingual_v2';
    
    const voiceSettings = options.voiceSettings || {
      stability: 0.5,
      similarity_boost: 0.75,
    };

    const url = `${this.baseURL}/text-to-speech/${voiceId}`;

    try {
      // Make request to ElevenLabs API
      const response = await axios({
        method: 'POST',
        url: url,
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey,
        },
        data: {
          text: text,
          model_id: modelId,
          voice_settings: voiceSettings,
        },
        responseType: 'stream',
        timeout: this.timeout,
      });

      // Ensure output directory exists
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // Stream the audio to file
      const writeStream = fs.createWriteStream(outputPath);
      await pipeline(response.data, writeStream);

      // Get file stats
      const stats = fs.statSync(outputPath);

      return {
        success: true,
        filePath: outputPath,
        fileSize: stats.size,
        voiceId: voiceId,
        modelId: modelId,
      };
    } catch (error) {
      console.error('ElevenLabs TTS error:', error.message);
      
      if (error.response) {
        throw new Error(`ElevenLabs API error: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('ElevenLabs request timeout');
      } else {
        throw new Error(`Failed to generate speech: ${error.message}`);
      }
    }
  }

  /**
   * Get available voices from ElevenLabs
   * @returns {Promise<Array>} - List of available voices
   */
  async getVoices() {
    const url = `${this.baseURL}/voices`;

    try {
      const response = await axios.get(url, {
        headers: {
          'xi-api-key': this.apiKey,
        },
        timeout: this.timeout,
      });

      return response.data.voices || [];
    } catch (error) {
      console.error('Failed to fetch voices:', error.message);
      throw new Error(`Failed to fetch voices: ${error.message}`);
    }
  }

  /**
   * Get user subscription info
   * @returns {Promise<Object>} - User subscription details
   */
  async getUserInfo() {
    const url = `${this.baseURL}/user`;

    try {
      const response = await axios.get(url, {
        headers: {
          'xi-api-key': this.apiKey,
        },
        timeout: this.timeout,
      });

      return response.data;
    } catch (error) {
      console.error('Failed to fetch user info:', error.message);
      throw new Error(`Failed to fetch user info: ${error.message}`);
    }
  }
}

// Export a singleton instance
module.exports = new ElevenLabsClient();