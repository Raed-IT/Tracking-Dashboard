import { AuthGate } from "@/components/auth/AuthGate";
import { OperationsDrawer } from "@/components/navigation/OperationsDrawer";
import { AlertWorkspace } from "@/components/operations/AlertWorkspace";
export default function AlertsPage() {
  return (
    <AuthGate>
      <OperationsDrawer>
        <AlertWorkspace />
      </OperationsDrawer>
    </AuthGate>
  );
}
