import { TwitterIcon, Facebook, MessageCircle } from "lucide-react";

export function SocialShare() {
  return (
    <div className="flex gap-x-2 items-center">
      <TwitterIcon className="w-6 h-6 hover:stroke-primary" />{" "}
      <Facebook className="w-6 h-6 hover:stroke-primary" />
      <MessageCircle className="w-6 h-6 hover:stroke-primary" />
    </div>
  );
}
