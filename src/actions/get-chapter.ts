import { sql } from "@vercel/postgres";


interface GetChapterProps {
    userId: string;
    courseId: string;
    chapterId: string;
};

export const getChapter = async ({
    userId,
    courseId,
    chapterId,

}: GetChapterProps) => {
    try {
        const purchase = await sql`
  SELECT *
  FROM Purchase
  WHERE userId = ${userId}
    AND courseId = ${courseId};
`;


        const course = await sql`
SELECT price
FROM Course
WHERE isPublished = true
  AND id = ${courseId};
`;


        const chapter = await sql`
SELECT *
FROM Chapter
WHERE id = ${chapterId}
  AND isPublished = true;
`;


        if (chapter.rows?.length === 0 || course.rows?.length === 0) {
            throw new Error("Chapter or course not found");
        }

        let muxData: any = null;
        let attachments: any = [];
        let nextChapter: any = null;

        if (purchase.rows?.length > 0) {
             attachments = await sql`
        SELECT *
        FROM Attachment
        WHERE courseId = ${courseId};
      `;

        }

        if (chapter.rows[0].isfree || purchase.rows?.length > 0) {
             muxData = await sql`
        SELECT *
        FROM Muxdata
        WHERE chapterid = ${chapterId};
      `;
             nextChapter = await sql`
  SELECT *
  FROM Chapter
  WHERE courseId = ${courseId}
    AND isPublished = true
    AND position > ${chapter.rows[0]?.position}
  ORDER BY position ASC
  LIMIT 1;
`;




        }
        
        const userProgress = await sql`
        SELECT *
        FROM UserProgress
        WHERE userId = ${userId}
          AND chapterId = ${chapterId};
      `;


    
                  
     
        return {
            chapter:chapter?.rows[0] ,
            course:course?.rows[0],
            attachments:attachments,
            muxData:muxData?.rows[0],
            nextChapter:nextChapter,
            purchase:purchase.rows[0],
            userProgress:userProgress.rows[0]

        };
    } catch (error) {
        console.log("[GET_CHAPTER]", error);
        return {
            chapter: null,
            course: null,
            muxData: null,
            attachments: [],
            nextChapter: null,
            userProgress: null,
            purchase: null,
        }
    }
}
