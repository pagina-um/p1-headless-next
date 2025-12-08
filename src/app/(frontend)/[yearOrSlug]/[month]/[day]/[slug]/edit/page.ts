import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@payload-config";

export default async function EditPage({ params }: any) {
  const { slug } = await params;
  const payload = await getPayload({ config });

  // Find the post by slug
  const result = await payload.find({
    collection: "posts",
    where: {
      slug: { equals: slug },
    },
    limit: 1,
  });

  const post = result.docs[0];

  if (!post) {
    redirect("/");
  }

  // Redirect to Payload admin
  redirect(`/admin/collections/posts/${post.id}`);
}
