import { headers as getHeaders } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { redirect } from "next/navigation";

export default async function GridEditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check authentication using Payload's auth method
  const payload = await getPayload({ config });
  const headers = await getHeaders();

  try {
    const { user } = await payload.auth({ headers });

    if (!user) {
      redirect("/admin/login");
    }
  } catch (error) {
    redirect("/admin/login");
  }

  return children;
}
