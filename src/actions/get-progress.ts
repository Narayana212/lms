import { sql } from "@vercel/postgres";


export const getProgress = async (
  userId: string,
  courseId: string,
): Promise<number> => {
  try {
    console.log("called")
    const publishedChapters = await sql`SELECT
    id
  FROM
    Chapter
  WHERE
    courseid = ${courseId}
    AND ispublished = true;
  `

    const publishedChapterIds:any = publishedChapters.rows.map(chapter=>chapter.id)
    const validCompletedChapters = await sql`
  SELECT COUNT(*)
  FROM UserProgress
  WHERE userid = ${userId}
    AND chapterid IN (
      SELECT id
      FROM Chapter
      WHERE courseid = ${courseId} AND ispublished = true
    )
    AND isCompleted = true;
`;


    const progressPercentage = (validCompletedChapters.rows[0].count / publishedChapterIds.length) * 100;

    return progressPercentage;
  } catch (error) {
    console.log("[GET_PROGRESS]", error);
    return 0;
  }
}