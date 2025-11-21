import { redirect } from "next/navigation";
import { getPostBySlug } from "../page";

export default async function EditPage({ params }: any) {
  const { slug, day, month, yearOrSlug: year } = params;
  // Construct your external URL based on the slug
  const { data } = await getPostBySlug(slug);
  const externalUrl = `${process.env.NEXT_PUBLIC_WP_URL}wp-admin/post.php?post=${data?.postBy?.databaseId}&action=edit`;
  console.log("Redirecting to:", externalUrl);
  redirect(externalUrl);
}
