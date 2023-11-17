import { auth } from "@clerk/nextjs";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";



export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { title } = await req.json();
    console.log(params)

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await sql `SELECT * FROM course WHERE id = ${params.courseId} AND userId =${userId};    `

    if (courseOwner?.rows?.length===0) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log(params.courseId)

    const lastChapter = await sql`SELECT * FROM chapter
    WHERE courseId = ${params.courseId}
    ORDER BY position DESC
    LIMIT 1;
    ` 
    const newPosition = lastChapter?.rows?.length>0 ? lastChapter.rows[0].position + 1 : 1;
    const chapter=await sql`INSERT INTO chapter (title, courseId, position) VALUES (${title}, ${params.courseId}, ${newPosition}) RETURNING *`

    return NextResponse.json(chapter.rows[0]);
  } catch (error) {
    console.log("[CHAPTERS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}