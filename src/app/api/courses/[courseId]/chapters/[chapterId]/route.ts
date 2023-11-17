import { auth } from "@clerk/nextjs";
import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";
import Mux from '@mux/mux-node'


const {Video}=new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_SECRET_ID!,

);


export async function DELETE(
  req: Request,
  { params }: { params: { courseId: string; chapterId: string } }
){
  try {
    
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    console.log("start")

    const courseOwner = await sql `SELECT * FROM course WHERE id = ${params.courseId} AND userId =${userId}; `
      if (courseOwner?.rows?.length===0) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

    const chapter=await sql `SELECT * FROM chapter WHERE id = ${params.chapterId} AND courseid=${params.courseId}`
    if (chapter?.rows[0]?.length===0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    if(chapter.rows[0]?.videourl){
      const existingMuxData=await sql`SELECT * FROM muxdata WHERE chapterid = ${params.chapterId} `
      if(existingMuxData?.rows?.length > 0){
        await Video.Assets.del(existingMuxData.rows[0].assetid)
        await sql`DELETE FROM muxdata WHERE id = ${existingMuxData.rows[0].id}`
      }
    }

    const deletedChapter=await sql`DELETE FROM chapter
    WHERE id = ${params.chapterId};
    `
    const publishedChaptersInCourse = await sql`SELECT * FROM chapter
    WHERE courseId = ${params.courseId} AND isPublished = true;`

    if(publishedChaptersInCourse?.rows[0]?.length>0){
      await sql `UPDATE course
      SET isPublished = false
      WHERE id = ${params.courseId};
      `

    }
    return NextResponse.json({...deletedChapter.rows[0]});
    
  } catch (error) {
    console.log("[CHAPTER_ID_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
    
  }

}

export async function PATCH(request:Request,{ params }: { params: { courseId: string; chapterId: string } }){
    try{
        const { userId } = auth();
    const value = await request.json();
    if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }
      const courseOwner = await sql `SELECT * FROM course WHERE id = ${params.courseId} AND userId =${userId}; `
      if (courseOwner?.rows?.length===0) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

    const { type } = value
    const title =   type==="access"?value["isFree"]:value[type]
    const {courseId,chapterId}=params
    console.log(courseId)

    let course=await sql`select * from chapter where id=${params.chapterId}`
    if (type === "title") {
        console.log( title)
        course = await sql`
        UPDATE Chapter
        SET
          title=  ${title}
        WHERE
          courseid = ${courseId}
          AND Id = ${chapterId}
        RETURNING *;
      `;
  
      } else if (type === "description") {
        course = await sql`
        UPDATE Chapter
        SET
          description = ${title}
        WHERE
          courseId = ${courseId}
          AND Id= ${chapterId}
        RETURNING *;
      `;
      }else if (type === "access") {
       
        course = await sql`
        UPDATE Chapter
        SET
          isfree = ${title}
        WHERE
          courseid = ${courseId}
          AND Id= ${chapterId}
        RETURNING *;
      `;
      }else if (type === "videourl"){

      

        course = await sql`
        UPDATE Chapter
        SET
          videourl = ${title}
        WHERE
          courseid = ${courseId}
          AND Id= ${chapterId}
        RETURNING *;
      `;

        const existingMuxData=await sql`SELECT * FROM muxdata WHERE chapterid = ${chapterId} `
        console.log(existingMuxData?.rows)
        if(existingMuxData?.rows?.length > 0){
          await Video.Assets.del(existingMuxData.rows[0].assetid)
          await sql`DELETE FROM muxdata WHERE id = ${existingMuxData.rows[0].id}`
        }

        const asset = await Video.Assets.create({
          input: title,
          playback_policy: "public",
          test: false,
        });

        await sql`INSERT INTO muxdata (chapterId, assetId, playbackId)
        VALUES (${params.chapterId}, ${asset.id}, ${asset.playback_ids?.[0]?.id})`

      }

      
      
      //@ts-ignore
      return NextResponse.json(course.rows[0]);
    }catch(error){
        console.log(error);
        return new NextResponse("Internal Error", { status: 500 });
    }


}