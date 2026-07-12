import { writeLog } from '../seven-os/ai/logs/log-writer.js';
import { validateLog } from '../seven-os/ai/logs/log-validator.js';

export default {
  async fetch(req) {
    try {
      const body = await req.json();
      const { type, entry } = body;

      const validation = validateLog(type, entry);
      if (!validation.valid) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid log entry",
            missing: validation.missing
          }),
          { status: 400 }
        );
      }

      await writeLog(type, entry);

      return new Response(
        JSON.stringify({ success: true }),
        { status: 200 }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        { status: 500 }
      );
    }
  }
};
