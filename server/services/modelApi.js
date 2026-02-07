/**
 * Model API Service
 * 
 * Thin client for the Python ML microservice (FastAPI on port 8008).
 * The ML service handles ONLY: 
 * - Story generation from Images
 * - Story generation from Text
 * - Track Conclusion
 * 
 * All orchestration (item storage, node creation, track management, daily
 * limits, auto-conclude) lives in the Node.js controllers.
 */

const MODEL_API_URL = process.env.MODEL_API_URL || 'http://localhost:8008';

const fetch = require('node-fetch');
const FormData = require('form-data');

/**
 * Generate a story segment directly from an image.
 * @param {Buffer} imageBuffer
 * @param {string} filename
 * @param {string} storySoFar
 * @returns {Promise<{description: string, story_segment: string}>}
 */
const generateStoryFromImage = async (imageBuffer, filename, storySoFar = "") => {
    const form = new FormData();
    form.append('file', imageBuffer, { filename });
    form.append('story_so_far', storySoFar);

    const res = await fetch(`${MODEL_API_URL}/api/ml/story-from-image`, {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`ML story-from-image error: ${res.status} - ${errorText}`);
    }
    return res.json();
};

/**
 * Generate a story segment directly from text.
 * @param {string} text
 * @param {string} storySoFar
 * @returns {Promise<{description: string, story_segment: string}>}
 */
const generateStoryFromText = async (text, storySoFar = "") => {
    const res = await fetch(`${MODEL_API_URL}/api/ml/story-from-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, story_so_far: storySoFar })
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`ML story-from-text error: ${res.status} - ${errorText}`);
    }
    return res.json();
};

/**
 * Generate a track conclusion + community reflection via LLM.
 * @param {string} story - the track's accumulated story
 * @param {string[]} [similarStories=[]] - other users' stories for community reflection
 * @returns {Promise<{conclusion: string, community_reflection: string}>}
 */
const generateConclusion = async (story, similarStories = []) => {
    const res = await fetch(`${MODEL_API_URL}/api/ml/generate-conclusion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ story, similar_stories: similarStories })
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`ML generate-conclusion error: ${res.status} - ${errorText}`);
    }
    return res.json();
};

module.exports = {
    generateStoryFromImage,
    generateStoryFromText,
    generateConclusion
};
