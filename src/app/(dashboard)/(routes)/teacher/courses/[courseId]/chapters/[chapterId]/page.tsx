import { IconBadge } from "@/components/icon-badge";
import { auth } from "@clerk/nextjs";
import { sql } from "@vercel/postgres";
import { ArrowLeft, Eye, LayoutDashboard, Video } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";
import { ChapterTitleForm } from "./_components/chapter-title-form";
import { ChapterDescriptionForm } from "./_components/chapter-description-form";
import { ChapterAccessForm } from "./_components/chapter-access";
import { ChapterVideoForm } from "./_components/chapter-video-form";
import { Banner } from "@/components/banner";
import { Toaster } from "sonner";
import { ChapterActions } from "./_components/chapter-actions";

const ChapterIdPage = async ({
  params,
}: {
  params: { courseId: string; chapterId: string };
}) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }
  

  let chapter:any=await sql`SELECT * FROM chapter WHERE id = ${params.chapterId} AND courseId = ${params.courseId}`
  let muxData = await sql`SELECT * FROM muxData WHERE chapterId = ${params.chapterId}`;

  const chapters = { ...chapter.rows["0"] };
  const mux = { muxData: muxData.rows };

  let chaptersMux = Object.assign(
    {},
    mux,
    chapters
  );


  if (chapter?.rows?.length === 0) {
    return redirect("/");
  }

  const requiredFields = [
    chapter.rows[0].title,
    chapter.rows[0].description,
    chapter.rows[0].videourl,
  ];

  const totalFields = requiredFields.length;
  const completedFields = requiredFields.filter(Boolean).length;

  const completionText = `(${completedFields}/${totalFields})`;

  const isComplete = requiredFields.every(Boolean);
  console.log(chapter.rows[0])

  return (
    <>
    {!chapter.rows[0].ispublished && (
        <Banner
          variant="warning"
          label="This chapter  is unpublished. It will not be visible in the course"
        />
      )}
      <div className="p-6">
        <div className="flex items-center justify-between">
            <div className="w-full">
            <Link
              href={`/teacher/courses/${params.courseId}`}
              className="flex items-center text-sm hover:opacity-75 transition mb-6"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to course setup
            </Link>
            <div className="flex items-center justify-between w-full">
                <div className="flex flex-col gap-y-2">
                <h1 className="text-2xl font-medium">
                  Chapter Creation
                </h1>
                <span className="text-sm text-slate-700">
                  Complete all fields {completionText}
                </span>
                </div>
                <ChapterActions
                disabled={!isComplete}
                courseId={params.courseId}
                chapterId={params.chapterId}
                isPublished={chapter.rows[0].ispublished}/>
            </div>
            </div>
            
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-16">
            <div className="space-y-4">
                <div>
                <div className="flex items-center gap-x-2">
                <IconBadge icon={LayoutDashboard} />
                <h2 className="text-xl">
                  Customize your chapter
                </h2>
              </div>
              <ChapterTitleForm
                initialData={chapter.rows[0]}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
              <ChapterDescriptionForm
                initialData={chapter.rows[0]}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />

                </div>
            </div>
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={Eye} />
                <h2 className="text-xl">
                  Access Settings
                </h2>
              </div>
              <ChapterAccessForm
                initialData={chapter.rows[0]}
                courseId={params.courseId}
                chapterId={params.chapterId}
              />
            </div>
            <div>
            <div className="flex items-center gap-x-2">
              <IconBadge icon={Video} />
              <h2 className="text-xl">
                Add a video
              </h2>
            </div>
            <ChapterVideoForm
              initialData={chaptersMux}
              chapterId={params.chapterId}
              courseId={params.courseId}
            />
          </div>
        </div>

      </div> 
      <Toaster richColors position="top-center"/>
    </>
  );
};

export default ChapterIdPage;
