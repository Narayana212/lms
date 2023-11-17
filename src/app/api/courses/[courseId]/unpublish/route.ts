import { auth } from "@clerk/nextjs";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { use } from "react";



export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await sql`SELECT *
    FROM course
    WHERE id = ${params.courseId} AND userId = ${userId}`

    if (course.rows?.length===0) {
      return new NextResponse("Not found", { status: 404 });
    }

    const unpublishedCourse = await sql ` UPDATE course
    SET isPublished = false
    WHERE id =${params.courseId} AND userId = ${userId};
    
    `

    return NextResponse.json(unpublishedCourse);
  } catch (error) {
    console.log("[COURSE_ID_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  } 
}