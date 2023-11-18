
import { sql } from "@vercel/postgres";
import { getProgress } from "./get-progress";


type CourseWithProgressWithCategory = any & {
  category: any | null;
  chapters: { id: string }[];
  progress: number | null;
};

type GetCourses = {
  userId: string;
  title?: string;
  categoryId?: string;
};

export const getCourses = async ({
  userId,
  title = "",
  categoryId = "1152f67c-e9e2-4fe1-bc72-46c9c0036d56"
}: GetCourses): Promise<CourseWithProgressWithCategory[]> => {
  try {
    console.log(title, categoryId, userId)
    const courses=await sql `
    SELECT
  c.id AS id,
  c.userId,
  c.title,
  c.description,
  c.imageUrl,
  c.price,
  c.isPublished,
  c.categoryId,
  c.createdAt,
  c.updatedAt,
  cat.id AS categoryId,
  cat.name AS categoryName,
  ch.id AS chapterId,
  ch.title AS chapterTitle,
  ch.description AS chapterDescription,
  ch.videoUrl AS chapterVideoUrl,
  ch.position AS chapterPosition,
  ch.isPublished AS chapterIsPublished,
  ch.isFree AS chapterIsFree,
  ch.courseId AS chapterCourseId,
  ch.createdAt AS chapterCreatedAt,
  ch.updatedAt AS chapterUpdatedAt,
  md.id AS muxDataId,
  md.assetId AS muxDataAssetId,
  md.playbackId AS muxDataPlaybackId,
  md.chapterId AS muxDataChapterId,
  up.id AS userProgressId,
  up.userId AS userProgressUserId,
  up.chapterId AS userProgressChapterId,
  up.isCompleted AS userProgressIsCompleted,
  up.createdAt AS userProgressCreatedAt,
  up.updatedAt AS userProgressUpdatedAt,
  p.id AS purchaseId,
  p.userId AS purchaseUserId,
  p.courseId AS purchaseCourseId,
  p.createdAt AS purchaseCreatedAt,
  p.updatedAt AS purchaseUpdatedAt,
  COUNT(ch.id) AS chaptersLength
FROM
  Course c
LEFT JOIN
  Category cat ON c.categoryId = cat.id
LEFT JOIN
  Chapter ch ON c.id = ch.courseId AND ch.isPublished = true
LEFT JOIN
  MuxData md ON ch.id = md.chapterId
LEFT JOIN
  UserProgress up ON ch.id = up.chapterId
LEFT JOIN
  Purchase p ON c.id = p.courseId
WHERE
  c.isPublished = true
  AND c.title ILIKE '%' || ${title} || '%'
  AND (c.categoryId = ${categoryId} OR c.categoryId IS NULL)
  AND (p.userId = ${userId} OR p.userId IS NULL)
  GROUP BY
  c.id, c.userId, c.title, c.description, c.imageUrl, c.price,
  c.isPublished, c.categoryId, c.createdAt, c.updatedAt,
  cat.id, cat.name,
  ch.id, ch.title, ch.description, ch.videoUrl, ch.position,
  ch.isPublished, ch.isFree, ch.courseId, ch.createdAt, ch.updatedAt,
  md.id, md.assetId, md.playbackId, md.chapterId,
  up.id, up.userId, up.chapterId, up.isCompleted, up.createdAt, up.updatedAt,
  p.id, p.userId, p.courseId, p.createdAt, p.updatedAt

ORDER BY
  c.createdAt DESC;
`

    const coursesWithProgress: CourseWithProgressWithCategory[] = await Promise.all(
      courses.rows.map(async course => {
        if (!course.purchase_userid) {
          return {
            ...course,
            progress: null,
          }
        }else{
          const progressPercentage: any = await getProgress(userId, course.rows[0].course_id);
          return {
            ...course,
            progress: progressPercentage,
          };
          
        }

       
      })
    );





    return coursesWithProgress
  } catch (error) {
    console.log("[GET_COURSES]", error);
    return [];
  }
}