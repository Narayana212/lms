import { auth } from "@clerk/nextjs";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";


export async function PUT(
  req: Request,
  { params }: { params: { courseId: string; } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { list } = await req.json();

    const ownCourse = await sql`SELECT * FROM course WHERE id = ${params.courseId} AND userId = ${userId}`
    if (ownCourse?.rows?.length===0) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    for (let item of list) {
      await sql `UPDATE chapter SET position = ${item.position} WHERE id = ${item.id} RETURNING *`
    }

    return new NextResponse("Success", { status: 200 });
  } catch (error) {
    console.log("[REORDER]", error);
    return new NextResponse("Internal Error", { status: 500 }); 
  }
}