// /services/dispatch-service.js
import { LogicEngine } from "../ai/engines/logic-engine.js";
import { MathEngine } from "../ai/engines/math-engine.js";

export class DispatchService {
  constructor(env) {
    this.env = env;
    this.logic = new LogicEngine();
    this.math = new MathEngine();
  }

  assignTask(task, workers) {
    const scored = workers.map(w => ({
      worker: w,
      score: this.math.weightedScore(
        [w.experience, w.distance, w.availability],
        [3, -1, 2]
      )
    }));

    return this.logic.resolvePriority(
      scored.map(s => ({ ...s.worker, priority: s.score }))
    );
  }

  createDispatchRecord(task, worker) {
    return {
      id: crypto.randomUUID(),
      task,
      worker,
      timestamp: Date.now(),
      status: "assigned"
    };
  }
}
