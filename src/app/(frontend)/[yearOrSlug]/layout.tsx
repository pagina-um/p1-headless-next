import { Header } from "@/components/layout/Header";
import { PostFooter } from "@/components/post/PostFooter";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="max-w-4xl mx-auto">{children}</main>

      <PostFooter />
    </>
  );
}
