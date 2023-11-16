
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

        await sql`CREATE TABLE Category (
            id UUID DEFAULT uuid_generate_v4() NOT NULL,
            name VARCHAR(255) UNIQUE NOT NULL,
            PRIMARY KEY (id)
          );`

        console.log("created")
        NextResponse.json("Good", { status: 200 })




    } catch (error:any) {
        console.log(error+"error",)
        return new NextResponse("Internal Error", { status: 500 });

    }
}