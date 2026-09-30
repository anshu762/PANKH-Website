import { adminService } from "@/services/admin.service";
import { AlertRulesView } from "@/components/admin/rules/alert-rules-view";

export default async function AdminAlertRulesPage() {
  const rules = await adminService.getAlertRulesWithHistory();

  return <AlertRulesView initialRules={rules} />;
}
