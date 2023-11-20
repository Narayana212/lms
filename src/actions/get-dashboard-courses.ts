import { sql } from "@vercel/postgres";
import { getProgress } from "./get-progress";

type CourseWithProgressWithCategory = any& {
    category: any;
    chapters: any[];
    progress: number | null;
  };
  
  


  export const getDashboardCourses = async (userId: string) => {
    try {
        const  purchasedCourses = await sql`
      SELECT
        c.*,
        cat.*,
        ch.*
      FROM
        Purchase p
      JOIN
        Course c ON p.courseid = c.id
      LEFT JOIN
        Category cat ON c.categoryid = cat.id
      LEFT JOIN
        Chapter ch ON c.id = ch.courseid AND ch.ispublished = true
      WHERE
        p.userid = ${userId};
    `;

    console.log(purchasedCourses.rows)
    const courses = purchasedCourses.rows.map((purchase) => purchase.course)

    for (let course of courses) {
        const progress = await getProgress(userId, course.id);
        course["progress"] = progress;
      }

      const completedCourses = courses.filter((course) => course.progress === 100);
      const coursesInProgress = courses.filter((course) => (course.progress ?? 0) < 100);
  
      return {
        completedCourses,
        coursesInProgress,
      }      
    } catch (error) {

        console.log("[GET_DASHBOARD_COURSES]", error);
    return {
      completedCourses: [],
      coursesInProgress: [],
    }
        
    }
  }
