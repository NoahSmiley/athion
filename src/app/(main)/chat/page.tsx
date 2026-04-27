import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/roles";
import { ChatRoom } from "./chat-room";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <>
      <h1>#general</h1>
      <p className="muted">Where everyone hangs out.</p>
      <ChatRoom channelSlug="general" me={{ id: user.id, displayName: user.displayName }} />
    </>
  );
}
