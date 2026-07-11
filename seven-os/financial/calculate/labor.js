import model from '../models/labor.json';
import { calculateCost } from './calculate.js';

export function calculateLaborCost(params) {
  return calculateCost(model, params);
}
