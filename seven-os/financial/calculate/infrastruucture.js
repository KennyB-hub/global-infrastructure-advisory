import model from '../models/infrastructure.json';
import { calculateCost } from './calculate.js';

export function calculateInfrastructureCost(params) {
  return calculateCost(model, params);
}
