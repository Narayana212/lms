
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(request: Request) {
    try {
        const { userId } = auth();
        const { title } = await request.json();

        if (!userId || !isTeacher(userId)) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        
        const course:any = await sql`INSERT INTO Course (title, userId) VALUES (${title}, ${userId}) RETURNING id`;
        return NextResponse.json(course.rows[0])




    } catch (error:any) {
        console.log(error+"error",)
        return new NextResponse("Internal Error", { status: 500 });

    }
}