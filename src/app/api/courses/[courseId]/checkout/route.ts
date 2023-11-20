
import { currentUser } from "@clerk/nextjs";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";



export async function POST(
    req: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        console.log("checkout started")
        const user = await currentUser();

        if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const course = await sql`
  SELECT *
  FROM Course
  WHERE id = ${params.courseId}
    AND isPublished = true;
`;


        const purchase = await sql`
  SELECT *
  FROM Purchase
  WHERE userid = ${user.id}
    AND courseid = ${params.courseId};
`;    






        console.log(purchase.rows.length,"purchase")
        if (purchase.rows.length > 0) {
            return new NextResponse("Already purchased", { status: 400 });
        }

        if (!course) {
            return new NextResponse("Not found", { status: 404 });
        }

        const newPurchase = await sql`
      INSERT INTO Purchase (userid, courseid, createdat, updatedat)
      VALUES (${user.id}, ${params.courseId}, NOW(), NOW())
      RETURNING *;
    `;

        return NextResponse.json({ url: `${process.env.VERCEL_URL}/courses/${course.rows[0].id}?success=1` });
    } catch (error) {
        console.log("[COURSE_ID_CHECKOUT]", error);
        return new NextResponse("Internal Error", { status: 500 })
    }
}