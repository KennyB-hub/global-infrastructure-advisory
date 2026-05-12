// /services/response.js
export class ResponseBuilder {
  static json(data, status = 200) {
    return new Response(JSON.stringify(data), {
      status,
      headers: { "Content-Type": "application/json" }
    });
  }

  static error(message, status = 400) {
    return this.json({ error: message }, status);
  }

  static success(message, data = {}) {
    return this.json({ message, ...data }, 200);
  }
}
