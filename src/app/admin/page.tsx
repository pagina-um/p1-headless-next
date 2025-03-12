import { AdminPanel } from "@/components/admin/AdminPanel";
import { ADMIN_PASSWORD, ADMIN_USERNAME } from "@/services/config";
import { headers } from "next/headers";

async function verifyBasicAuth() {
  const headersList = await headers();
  const authorization = headersList.get("authorization");

  if (!authorization) {
    // Send 401 to trigger browser's basic auth prompt
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": "Basic" },
    });
  }

  // Verify credentials match your middleware
  const [scheme, encoded] = authorization.split(" ");
  if (!encoded || scheme !== "Basic") {
    return new Response("Invalid credentials", { status: 401 });
  }

  const buffer = Buffer.from(encoded, "base64");
  const [username, password] = buffer.toString().split(":");

  if (password !== ADMIN_PASSWORD || username !== ADMIN_USERNAME) {
    return new Response("Invalid credentials", { status: 401 });
  }
}

export default function AdminPage() {
  if (process.env.NODE_ENV === "production") verifyBasicAuth();
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <AdminPanel />
    </main>
  );
}
