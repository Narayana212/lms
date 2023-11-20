import { sql } from "@vercel/postgres";



type PurchaseWithCourse = any & {
  course: any;
};

const groupByCourse = (purchases: PurchaseWithCourse[]) => {
  const grouped: { [courseTitle: string]: number } = {};
  
  purchases[1].forEach((purchase:any) => {
    const courseTitle = purchase.title;
    if (!grouped[courseTitle]) {
      grouped[courseTitle] = 0;
    }
    grouped[courseTitle] += purchase.price!;
  });

  return grouped;
};

export const getAnalytics = async (userId: string) => {
  try {

    const courses=await sql`SELECT *
    FROM course
    WHERE userId = ${userId};
    `
    console.log(courses.rows)
    const couresOfIds = courses.rows?.map(obj => obj.id);
    const purchase=await sql`SELECT * FROM purchase WHERE courseId IN (SELECT id
        FROM course
        WHERE userId = ${userId} 
        )`
    console.log(purchase.rows);
   

   
    const purchases = [{...purchase.rows},[...courses.rows]]
    console.log(purchases);

    const groupedEarnings = groupByCourse(purchases);
    const data = Object.entries(groupedEarnings).map(([courseTitle, total]) => ({
      name: courseTitle,
      total: total,
    }));

    const totalRevenue = data.reduce((acc, curr) => acc + curr.total, 0);
    const totalSales = purchases.length;

    return {
      data,
      totalRevenue,
      totalSales,
    }
  } catch (error) {
    console.log("[GET_ANALYTICS]", error);
    return {
      data: [],
      totalRevenue: 0,
      totalSales: 0,
    }
  }
}