// /services/request-parser.js
export class RequestParser {
  static async json(request) {
    try {
      return await request.json();
    } catch {
      return null;
    }
  }

  static query(request) {
    const url = new URL(request.url);
    const params = {};
    for (const [key, value] of url.searchParams.entries()) {
      params[key] = value;
    }
    return params;
  }

  static async form(request) {
    const form = await request.formData();
    const out = {};
    for (const key of form.keys()) {
      out[key] = form.get(key);
    }
    return out;
  }
}
