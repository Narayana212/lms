import { auth } from "@clerk/nextjs";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function POST(request: Request, { params }: { params: { courseId: string } }) {
    try {
        const { userId } = auth();

        const requestBody = await request.json()
        const { url } = requestBody.images[0]

        if (!userId) {
            return new NextResponse("Unauthorized", { status: 401 });
        }


        const courseOwner = sql`SELECT * FROM "course"
      WHERE id = ${params.courseId} AND userId = ${userId};
      `
        if (!courseOwner) {
            return new NextResponse("Unauthorized", { status: 401 });

        }
        console.log( url.split("/").pop())
        const attachment = await sql`  INSERT INTO attachment (url, name, courseId)
      VALUES (${url}, ${ url.split("/").pop()}, ${params.courseId})
      RETURNING *;
    
      `
        return NextResponse.json(attachment.rows);
    } catch (error) {
        console.log("COURSE_ID_ATTACHMENTS", error);
        return new NextResponse("Internal Error", { status: 500 });


    }


}