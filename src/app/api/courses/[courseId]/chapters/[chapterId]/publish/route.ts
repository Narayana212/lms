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

        

        const chapter = await sql`SELECT * FROM chapter WHERE id = ${params.chapterId} AND courseid =${params.courseId} ;
    `

        const muxData = await sql`SELECT * FROM muxData
    WHERE chapterId = ${params.chapterId};
    `

        if (chapter.rows?.length===0 || muxData.rows?.length===0 || !chapter.rows[0]?.title || !chapter.rows[0]?.description || !chapter.rows[0]?.videourl) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        const publishedChapter = await sql ` UPDATE chapter
        SET isPublished = true
        WHERE id = ${params.chapterId} AND courseId = ${params.courseId};
        `

        return NextResponse.json({...publishedChapter.rows[0]});
    } catch (error) {
        console.log("[CHAPTER_PUBLISH]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}