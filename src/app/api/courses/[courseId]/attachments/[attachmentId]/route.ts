import { auth } from "@clerk/nextjs";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string, attachmentId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const courseOwner = await sql `SELECT * FROM course WHERE id = ${params.courseId} AND userId =${userId};    `

    if (courseOwner?.rows?.length===0) {
      return new NextResponse("Unauthorized", { status: 401 });
    }


    const attachment= await sql`DELETE FROM attachment WHERE courseId = ${params.courseId} AND id = ${params.attachmentId} RETURNING *`

    return NextResponse.json(attachment.rows[0]);
  } catch (error) {
    console.log("ATTACHMENT_ID", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
