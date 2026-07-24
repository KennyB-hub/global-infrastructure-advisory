// cli entry
import { DoctorEngine } from '../../../seven-os/doctor/doctor-engine';

const doctor = new DoctorEngine();
await doctor.init();

async function runCommand(intent: string, context: any) {
  const plan = doctor.route({
    source: 'cli',
    intent,
    context,
  });

  // now call the worker/runtime from plan
  // e.g. enqueue task to /api/autonomous/task/enqueue with sector/grid/worker/runtime
}
