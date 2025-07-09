import { Header } from "@/components/layout/Header";
import { PostFooter } from "@/components/post/PostFooter";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="">{children}</main>
      <PostFooter />
    </>
  );
}
