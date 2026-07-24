import { useWorkforce } from "../useWorkforce";
import { WorkforceTable } from "../components/WorkforceTable";

export default function WorkforcePage() {
  const workforce = useWorkforce();

  return (
    <div>
      <h1>Workforce</h1>
      <WorkforceTable workforce={workforce} />
    </div>
  );
}
