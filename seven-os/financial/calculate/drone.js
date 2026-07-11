import model from '../models/drone.json';
import { calculateCost } from './calculate.js';

export function calculateDroneCost(params) {
  return calculateCost(model, params);
}
