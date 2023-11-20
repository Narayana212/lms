import { auth } from "@clerk/nextjs";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";





export async function PUT(req: Request,
    { params }: { params: { courseId: string; chapterId: string } }) {
    try {
        const { userId } = auth();
        const { isCompleted } = await req.json();
        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userProgress = await sql`
              INSERT INTO userProgress (userId, chapterId, iscompleted)
VALUES
  (
    ${userId},
    ${params.chapterId},
    ${isCompleted}

  )
ON CONFLICT (userId, chapterId)
DO UPDATE SET isCompleted = ${isCompleted};
` 
return NextResponse.json(userProgress);





    } catch (error) {
        console.log("[CHAPTER_ID_PROGRESS]", error);
    return new NextResponse("Internal Error", { status: 500 });

    }
}