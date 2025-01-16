import { AdminPanel } from "@/components/admin/AdminPanel";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

function verifyBasicAuth() {
  const headersList = headers();
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

  if (
    password !== process.env.ADMIN_PASSWORD ||
    username !== process.env.ADMIN_USERNAME
  ) {
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
