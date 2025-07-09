import { Header } from "@/components/layout/Header";
import { PostFooter } from "@/components/post/PostFooter";
import { PushNotificationsProvider } from "@/contexts/PushNotificationsContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PushNotificationsProvider>
      <main className="">{children}</main>
      <PostFooter />
    </PushNotificationsProvider>
  );
}
