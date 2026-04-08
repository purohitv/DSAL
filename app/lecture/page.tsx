import { Suspense } from "react";
import LectureClient from "./LectureClient";

export const metadata = {
  title: "Lecture Mode | DSAL Laboratory",
  description: "Interactive data structures and algorithms lectures with video and code integration.",
};

export default function LecturePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-dark flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <LectureClient />
    </Suspense>
  );
}
