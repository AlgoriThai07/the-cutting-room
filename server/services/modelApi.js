/**
 * Model API Service
 * 
 * Thin client for the Python ML microservice (FastAPI on port 8000).
 * The ML service handles ONLY: image parsing, text embedding, vector search,
 * and LLM text generation.
 * 
 * All orchestration (item storage, node creation, track management, daily
 * limits, auto-conclude) lives in the Node.js controllers.
 */

const MODEL_API_URL = process.env.MODEL_API_URL || 'http://localhost:8000';

const fetch = require('node-fetch');
const FormData = require('form-data');

/**
 * Parse an image → get description + embedding. No DB writes.
 * @param {Buffer} imageBuffer
 * @param {string} filename
 * @returns {Promise<{description: string, embedding: number[]}>}
 */
const parseImage = async (imageBuffer, filename) => {
    const form = new FormData();
    form.append('file', imageBuffer, { filename });

    const res = await fetch(`${MODEL_API_URL}/api/ml/parse-image`, {
        method: 'POST',
        body: form,
        headers: form.getHeaders()
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`ML parse-image error: ${res.status} - ${errorText}`);
    }
    return res.json();
};

/**
 * Parse text → get embedding. No DB writes.
 * @param {string} text
 * @returns {Promise<{text: string, embedding: number[]}>}
 */
const parseText = async (text) => {
    const res = await fetch(`${MODEL_API_URL}/api/ml/parse-text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`ML parse-text error: ${res.status} - ${errorText}`);
    }
    return res.json();
};

/**
 * Vector search for similar items from other users.
 * @param {number[]} embedding
 * @param {string} userId - current user's ID (to exclude)
 * @param {number} [limit=3]
 * @param {string[]} [excludeItemIds=[]] - item IDs already paired with this user
 * @returns {Promise<{similar_items: Object[]}>}
 */
const vectorSearch = async (embedding, userId, limit = 3, excludeItemIds = []) => {
    const res = await fetch(`${MODEL_API_URL}/api/ml/vector-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            embedding,
            user_id: userId,
            limit,
            exclude_item_ids: excludeItemIds
        })
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`ML vector-search error: ${res.status} - ${errorText}`);
    }
    return res.json();
};

/**
 * Generate a recap sentence for a node via LLM.
 * @param {string} userItemDescription
 * @param {string[]} similarItemDescriptions
 * @param {string} [storySoFar='']
 * @returns {Promise<{recap_sentence: string}>}
 */
const generateRecap = async (userItemDescription, similarItemDescriptions, storySoFar = '') => {
    const res = await fetch(`${MODEL_API_URL}/api/ml/generate-recap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_item_description: userItemDescription,
            similar_item_descriptions: similarItemDescriptions,
            story_so_far: storySoFar
        })
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`ML generate-recap error: ${res.status} - ${errorText}`);
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
    parseImage,
    parseText,
    vectorSearch,
    generateRecap,
    generateConclusion
};
