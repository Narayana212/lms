import { auth } from "@clerk/nextjs";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import { title } from "process";

export async function PATCH(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;
    const value = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    
  
  const {type}=value
  const title = value[type]
  
const course = await sql`
  UPDATE "Course"
  SET
    "title" = ${title}
  WHERE
    "id" = ${courseId}
    AND "userId" = ${userId}
  RETURNING *;
`;




    
    return NextResponse.json(course.rows[0]);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}