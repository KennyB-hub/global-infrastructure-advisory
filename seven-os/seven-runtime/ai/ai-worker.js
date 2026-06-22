// backend/ai/ai-worker.js

const fs = require('fs');
const path = require('path');

/**
 * runAI(prompt)
 * Sends a prompt to your AI engine and returns the generated output.
 * This is the universal AI function used by all hubs.
 */

module.exports.runAI = async function(prompt) {
  try {
    // Load your base system prompt (optional)
    const systemPromptPath = path.join(__dirname, 'prompts', 'system-base.txt');
    const systemPrompt = fs.existsSync(systemPromptPath)
      ? fs.readFileSync(systemPromptPath, 'utf8')
      : '';

    // Build the final message
    const finalPrompt = `
      ${systemPrompt}

      USER INPUT:
      ${prompt}

      INSTRUCTIONS:
      - Produce structured, actionable output.
      - Use clear sections and bullet points.
      - Include compliance, risks, and recommendations.
      - Keep it professional and aligned with GIA standards.
    `;

    // Simulated AI call (replace with your actual AI API)
    const aiResponse = await fakeAI(finalPrompt);

    return aiResponse;

  } catch (err) {
    console.error('AI Worker Error:', err);
    return { error: 'AI processing failed.' };
  }
};

/**
 * Temporary fake AI function
 * Replace this with your real AI API call (OpenAI, Azure OpenAI, etc.)
 */
async function fakeAI(prompt) {
  return `
    [AI OUTPUT GENERATED]
    Prompt received:
    ${prompt.substring(0, 200)}...
  `;
}
