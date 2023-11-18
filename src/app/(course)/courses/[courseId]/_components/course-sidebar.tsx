import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { CourseProgress } from "@/components/course-progress";

import { sql } from "@vercel/postgres";
import { CourseSidebarItem } from "./course-sidebar-item";

interface CourseSidebarProps {
  course: any & {
    chapters: (any & {
      userProgress: any[] | null;
    })[]
  };
  progressCount: number;
};

export const CourseSidebar = async ({
  course,
  progressCount,
}: CourseSidebarProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  const purchase = await sql`
  SELECT *
FROM Purchase
WHERE userId = ${userId}
  AND courseId = ${course[0].id};
`
    
const chapters=await sql`select * from chapter where courseid = '93ee32d9-bcd5-40ed-9292-093e57f7d21b'  `
console.log(course[0].id,"jkik")


    
  return (
    <div className="h-full border-r flex flex-col overflow-y-auto shadow-sm">
      <div className="p-8 flex flex-col border-b">
        <h1 className="font-semibold">
          {course[0].title}
        </h1>
        {purchase.rows?.length>0 && (
          <div className="mt-10">
            <CourseProgress
              variant="success"
              value={progressCount}
            />
          </div>
        )}
      </div>
      <div className="flex flex-col w-full">
        {course[1].chapters.map((chapter:any) => (
          <CourseSidebarItem
            key={chapter.id}
            id={chapter.id}
            label={chapter.title}
            isCompleted={course[2].userProgress?.length>0 && course[2].userProgress?.find((chapters:any)=>{
                if(chapters.chapterid===chapter.id){
                    return chapters.iscomplete
                }
                return false
            })}
            courseId={course[0].id}
            isLocked={!chapter.isfree && purchase.rows?.length===0}
          />
        ))}
      </div>
    </div>
  )
}