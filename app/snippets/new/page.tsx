import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import NewSnippetClient from "./NewSnippetClient";

export default async function NewSnippetPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/library?tab=snippets");
  }

  return <NewSnippetClient />;
}
