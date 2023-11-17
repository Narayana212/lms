import { auth } from "@clerk/nextjs";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";



export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await sql `SELECT * FROM course WHERE id = ${params.courseId} AND userId =${userId}; `
        if (courseOwner?.rows?.length===0) {
          return new NextResponse("Unauthorized", { status: 401 });
        }

    const unpublishedChapter = await sql ` UPDATE chapter
    SET isPublished = false
    WHERE id = ${params.chapterId} AND courseid = ${params.courseId};
    `
    const publishedChaptersInCourse = await await sql`
    SELECT * FROM chapter
    WHERE courseId = ${params.courseId} AND isPublished = true;
  `;
    if (!publishedChaptersInCourse.rows?.length) {
        await sql`
        UPDATE course
        SET isPublished = false
        WHERE id = ${params.courseId};
      `;
      
    }

    return NextResponse.json({...unpublishedChapter.rows[0]});
  } catch (error) {
    console.log("[CHAPTER_UNPUBLISH]", error);
    return new NextResponse("Internal Error", { status: 500 }); 
  }
}