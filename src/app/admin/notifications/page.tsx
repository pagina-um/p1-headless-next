import { Suspense } from "react";
import { Loader } from "lucide-react";
import { NotificationsPage } from "../../../components/admin/NotificationsPage";

export default function AdminNotificationsPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin" />
            </div>
          }
        >
          <NotificationsPage />
        </Suspense>
      </div>
    </div>
  );
}
