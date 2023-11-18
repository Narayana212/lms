import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

import { getProgress } from "@/actions/get-progress";
import { sql } from "@vercel/postgres";
import { CourseNavbar } from "./_components/course-navbar";
import { CourseSidebar } from "./_components/course-sidebar";

const CourseLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { courseId: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

 
  let course: any = await sql`SELECT
  c.title,c.id
FROM
  Course c
JOIN
  Chapter ch ON c.id = ch.courseid
LEFT JOIN
  UserProgress up ON ch.id = up.chapterid AND up.userid = ${userId}
WHERE
  c.id =${params.courseId}
  AND ch.ispublished = true
ORDER BY
  ch.position ASC;
`;

  const chapters =
    await sql`select * from chapter where courseid = ${params.courseId}  `;

  console.log(chapters.rows);

  const userProgress =
    await sql`select * from userprogress where userId = ${userId}  `;
 
  course = [
    ...course.rows,
    { chapters: [chapters.rows[0]] },
    { userProgress: userProgress.rows },
  ];
  console.log(course,"co")

  

  if (!course) {
    return redirect("/");
  }

  const progressCount = await getProgress(userId, params.courseId);

  return (
    <div className="h-full">
      <div className="h-[80px] md:pl-80 fixed inset-y-0 w-full z-50">
        <CourseNavbar course={course} progressCount={progressCount}  />
      </div>
      <div className="hidden md:flex h-full w-80 flex-col fixed inset-y-0 z-50">
        <CourseSidebar course={course} progressCount={progressCount} />
      </div>

      <main className="md:pl-80 pt-[80px] h-full">{children}</main>
    </div>
  );
};

export default CourseLayout;
