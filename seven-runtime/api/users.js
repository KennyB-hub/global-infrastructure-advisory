users.js
// seven-os/functions/api/users.js

export async function onRequestGet(context) {
  const env = context.env;

  try {
    const { results } = await env.DB.prepare("SELECT * FROM users").all();

    return new Response(JSON.stringify({ users: results }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: "User DB Query Failed", details: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
