
import { auth } from "@clerk/nextjs"
import { redirect } from "next/navigation";
import { CheckCircle, Clock } from "lucide-react";
import { getDashboardCourses } from "@/actions/get-dashboard-courses";

export default async function Home() {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }
  return (
   <div className="class">hi</div>
  )
}
