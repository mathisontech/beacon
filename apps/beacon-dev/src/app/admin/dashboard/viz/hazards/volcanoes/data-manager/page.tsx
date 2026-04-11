import { redirect } from "next/navigation";

export default function DataManagerIndexPage() {
  redirect("/admin/dashboard/viz/hazards/volcanoes/data-manager/sources");
}
