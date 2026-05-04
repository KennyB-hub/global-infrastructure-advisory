deep-mind.js
// src/functions/api/deep-mind.js

export async function onRequestPost(context) {
  try {
    const env = context.env;
    const request = context.request;

    const { query } = await request.json();

    const aiResponse = await env.AI.run("@cf/google/gemma-4-26b-a4b-it", {
      prompt: `GIA System Intelligence Query: ${query}`,
      max_tokens: 512
    });

    return new Response(JSON.stringify({ result: aiResponse.response }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Deep Mind Bridge Failure", details: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
