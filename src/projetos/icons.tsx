import {
  Activity,
  Archive,
  BarChart3,
  BookOpen,
  Database,
  FileSearch,
  Gavel,
  Landmark,
  Map,
  Scale,
  Users,
  type LucideProps,
} from "lucide-react";
import type { ProjetoIconName } from "./registry";

const ICONS: Record<ProjetoIconName, React.ComponentType<LucideProps>> = {
  activity: Activity,
  archive: Archive,
  scale: Scale,
  landmark: Landmark,
  gavel: Gavel,
  database: Database,
  map: Map,
  "book-open": BookOpen,
  users: Users,
  "bar-chart": BarChart3,
  "file-search": FileSearch,
};

export function ProjetoIcon({
  name,
  ...props
}: { name: ProjetoIconName } & LucideProps) {
  const Icon = ICONS[name];
  return <Icon aria-hidden="true" {...props} />;
}
