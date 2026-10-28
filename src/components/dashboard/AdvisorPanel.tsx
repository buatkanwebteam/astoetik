import type { Filters } from "@/lib/analytics";
import { Card, CardTitle } from "./ui";

// Placeholder until the AI phase lands.
export function AdvisorPanel({ filters }: { filters: Filters }) {
  return (
    <Card>
      <CardTitle>AI Advisor</CardTitle>
      <p className="text-sm">Segera hadir ({filters.days} hari).</p>
    </Card>
  );
}
