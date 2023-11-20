import { auth } from "@clerk/nextjs";
import Mux from "@mux/mux-node";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";


const {Video}=new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_SECRET_ID!,

);

export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await sql`
    SELECT md.*
FROM course c
JOIN chapter ch ON c.id = ch.courseid
LEFT JOIN muxdata md ON ch.id = md.chapterid
WHERE c.id = ${params.courseId} AND c.userId = ${userId};
`

  console.log(course.rows,"ko")
  

    if (course.rows?.length===0) {
      return new NextResponse("Not found", { status: 404 });
    }

    for (const chapter of course.rows) {
      if (chapter?.assetId) {
        await Video.Assets.del(chapter?.assetId);
      }
    }

    const deletedCourse = await sql `DELETE FROM course
    WHERE id = ${params.courseId};
    `

    return NextResponse.json({...deletedCourse.rows[0]});
  } catch (error) {
    console.log("[COURSE_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


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
    console.log(params.courseId,userId)
    const courseOwner = await sql `SELECT * FROM course WHERE id = ${params.courseId} AND userId =${userId};    `

    console.log('coua')
    if (courseOwner?.rows?.length===0) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    


    const { type } = value
    const title = value[type]
    

    let course;

    if (type === "title") {
      console.log( title)
      course = await sql`
      UPDATE Course
      SET
        title=  ${title}
      WHERE
        id = ${courseId}
        AND userId = ${userId}
      RETURNING *;
    `;

    } else if (type === "description") {
      course = await sql`
      UPDATE Course
      SET
        description = ${title}
      WHERE
        id = ${courseId}
        AND userId= ${userId}
      RETURNING *;
    `;
    } else if (type === "imageUrl") {
      console.log(title)
      course = await sql`
    UPDATE Course
    SET
      imageUrl = ${title}
    WHERE
      id = ${courseId}
      AND userId = ${userId}
    RETURNING *;
  `;

    }else if(type==="categoryId"){
      console.log(title)
      course = await sql`
    UPDATE Course
    SET
      categoryId = ${title}
    WHERE
      id = ${courseId}
      AND userId = ${userId}
    RETURNING *;
  `;

      
    }
    else if(type==="price"){
      console.log(title)
      course = await sql`
    UPDATE Course
    SET
      price = ${title}
    WHERE
      id = ${courseId}
      AND userId = ${userId}
    RETURNING *;
  `;
    }
    if (!course) {
      return new NextResponse("Internal Error", { status: 500 });
    }





    return NextResponse.json(course.rows[0]);
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
