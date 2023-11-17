import { auth } from "@clerk/nextjs";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";



export async function PATCH(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const { userId } = auth();

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const course = await sql`
    SELECT  ch.*
FROM course c
JOIN chapter ch ON c.id = ch.courseid
LEFT JOIN muxdata md ON ch.id = md.chapterid
WHERE c.id = ${params.courseId} AND c.userId = ${userId};
`

        if (course.rows?.length === 0) {
            return new NextResponse("Not found", { status: 404 });
        }


        const hasPublishedChapter = course.rows.some((chapter: any) => chapter.ispublished);

        if (!hasPublishedChapter) {
            return new NextResponse("Missing required fields", { status: 401 });
        }

        const publishedCourse = await sql`
    UPDATE course
SET ispublished = true
WHERE id = ${params.courseId} AND userId = ${userId};
`

        return NextResponse.json(publishedCourse);
    } catch (error) {
        console.log("[COURSE_ID_PUBLISH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}