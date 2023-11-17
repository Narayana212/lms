import { IconBadge } from "@/components/icon-badge";
import { auth } from "@clerk/nextjs";
import { sql } from "@vercel/postgres";
import { File, LayoutDashboard, ListChecks } from "lucide-react";
import { redirect } from "next/navigation";
import { TitleForm } from "./_components/title-form";
import { DescriptionForm } from "./_components/description-form";
import { ImageForm } from "./_components/image-form";
import { CategoryForm } from "./_components/category-form";
import { AttachmentForm } from "./_components/attachment-form";
import { ChaptersForm } from "./_components/chapters-form";
import { Actions } from "./_components/actions";
import { Banner } from "@/components/banner";

const CourseIdPage = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = auth();
  if (!userId) {
    return redirect("/");
  }
  let course: any = await sql`
  SELECT *
FROM Course

WHERE id = ${params.courseId}

    `;

  let attachment = await sql`
  SELECT *
FROM attachment
WHERE courseId = ${params.courseId}
ORDER BY createdAt DESC;

  `;
  let chapter = await sql`
  SELECT *
FROM chapter
WHERE courseId = ${params.courseId}
ORDER BY position 

  `;

  const chapters = { chapters: chapter.rows };
  const attachments = { attachments: attachment.rows };

  let courseAttachmentsChapters = Object.assign(
    {},
    course.rows[0],
    attachments,
    chapters
  );
  console.log(course.rows[0].id)

  const categories = await sql`SELECT * FROM Category Order By name`;

  const requiredFields = [
    course.rows[0].title,
    course.rows[0].description,
    course.rows[0].imageurl,
    courseAttachmentsChapters.chapters.some(
      (chapter: any) => chapter.ispublished
    ),
  ];
  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;
  const completionText = `(${completedFields}/${totalFields}) `;
  const isComplete = requiredFields.every(Boolean);
  return (
    <>
     {!course.rows[0].ispublished && (
        <Banner
          label="This course is unpublished. It will not be visible to the students."
        />
      )}
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-y-2">
          <h1 className="text-2xl font-medium">Course setup</h1>
          <span className="text-sm text-slate-700">
            Complete all fields {completionText}
          </span>
          <Actions
            disabled={!isComplete}
            courseId={params.courseId}
            isPublished={course.rows[0].ispublished}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutDashboard} />
            <h2 className="text-xl">Customize your course</h2>
          </div>
          <TitleForm
            initialData={course.rows[0]}
            courseId={course.rows[0].id}
          />

          <DescriptionForm
            initialData={course.rows[0]}
            courseId={course.rows[0].id}
          />

          <ImageForm
            initialData={course.rows[0]}
            courseId={course.rows[0].id}
          />

          <CategoryForm
            initialData={course.rows[0]}
            courseId={course.rows[0].id}
            options={categories.rows.map((category) => ({
              label: category.name,
              value: category.id,
            }))}
          />
        </div>
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={ListChecks} />
              <h2 className="text-xl">Course chapters</h2>
            </div>
            <ChaptersForm
              initialData={courseAttachmentsChapters}
              courseId={course.rows[0].id}
            />
          </div>
          <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={File} />
              <h2 className="text-xl">Resources & Attachments</h2>
            </div>

            <AttachmentForm
              initialData={courseAttachmentsChapters}
              courseId={course.rows[0].id}
            />
          </div>
        </div>
      </div>
    </div></>
  );
};

export default CourseIdPage;
