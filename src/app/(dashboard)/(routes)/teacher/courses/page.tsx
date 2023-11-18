import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";


import { DataTable } from "./_components/data-table";
import { columns } from "./_components/columns";
import { sql } from "@vercel/postgres";

const CoursesPage = async () => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }



  const courses = await sql`SELECT *
  FROM course
  WHERE userId = ${userId}
  ORDER BY createdAt DESC;
  `
  console.log(courses.rows[0]);

  return ( 
    <div className="p-6">
      <DataTable columns={columns} data={courses.rows} />
    </div>
   );
}
 
export default CoursesPage;