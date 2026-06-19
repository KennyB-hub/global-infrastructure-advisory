import { readLog } from '../seven-runtime/logs/log-reader.js';
import { exportLogs } from '../seven-runtime/logs/log-exporter.js';
import { searchLogs } from '../seven-runtime/logs/log-search.js';
import { analyzeLogs } from '../seven-runtime/logs/log-analyzer.js';
import { getLogDashboard } from '../seven-runtime/logs/log-dashboard.js';

export const logApi = {
  async getDashboard(req, res) {
    const data = await getLogDashboard();
    res.json(data);
  },

  async getLog(req, res) {
    const { type } = req.params;
    const data = readLog(type);
    res.json(data);
  },

  async search(req, res) {
    const { type } = req.params;
    const { q } = req.query;
    const results = searchLogs(type, q);
    res.json(results);
  },

  async analyze(req, res) {
    const results = analyzeLogs();
    res.json(results);
  },

  async export(req, res) {
    const { type, format } = req.params;
    const file = exportLogs(type, format);
    res.json({ exported: file });
  }
};
