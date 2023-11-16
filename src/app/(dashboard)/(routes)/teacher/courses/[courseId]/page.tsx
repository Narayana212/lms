import { IconBadge } from "@/components/icon-badge";
import { auth } from "@clerk/nextjs";
import { sql } from "@vercel/postgres";
import { Dice1, LayoutDashboard } from "lucide-react";
import { redirect } from "next/navigation";
import { TitleForm } from "./_components/title-form";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/");
  }
  const course = await sql`
  SELECT *
  FROM "Course"
  WHERE "Course"."id" = ${params.courseId}
    


  `;

  if (course.rows.length === 0) {
    return redirect("/");
  }

  const requiredFields = [
    course.rows[0].title,
    course.rows[0].description,
    course.rows[0].imageUrl,
    course.rows[0].price,
    course.rows[0].categoryId,
  ];

  const totalFields=requiredFields.length
  const completedFields=requiredFields.filter(Boolean).length
  const completionText=`(${completedFields}/${totalFields}) `


  return(
    <div className="p-6">
        <div className="flex items-center justify-between">
            <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">Course setup</h1>
                <span className="text-sm text-slate-700">Complete all fields {completionText}</span>
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            <div>
                <div className="flex items-center gap-x-2">
                    <IconBadge icon={LayoutDashboard}/>
                    <h2 className="text-xl">Customize your course</h2>
                </div>
                <TitleForm initialData={course.rows[0]} courseId={course.rows[0].id} />
            </div>
        </div>
    </div>
  )
};

export default CourseIdPage;
