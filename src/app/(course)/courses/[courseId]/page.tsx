
import { sql } from "@vercel/postgres";
import { redirect } from "next/navigation";

const CourseIdPage = async ({
  params
}: {
  params: { courseId: string; }
}) => {
    let course:any = await sql`SELECT
    *
  FROM
    Course c
  JOIN
    Chapter ch ON c.id = ch.courseid
  
  WHERE
    c.id =${params.courseId}
    AND ch.ispublished = true
  ORDER BY
    ch.position ASC;
  `

  const chapters=await sql`select * from chapter where courseid = ${params.courseId}`
  
  course=[...course.rows,{chapters:[chapters.rows[0]]}]

  if (!course) {
    return redirect("/");
  }
 

  return redirect(`/courses/${course[0].courseid}/chapters/${chapters.rows[0].id}`);
}
 
export default CourseIdPage;