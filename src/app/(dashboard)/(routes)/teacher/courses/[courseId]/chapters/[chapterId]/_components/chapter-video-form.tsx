"use client";

import * as z from "zod";
import axios from "axios";
import { Pencil, PlusCircle, ImageIcon, Video } from "lucide-react";
import {  useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import  FileUpload  from "@/components/file-upload";
import { Toaster,toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import MuxPlayer from "@mux/mux-player-react";
import VideoUpload from "@/components/video-uplaod";


type Chapter = {
    id: string;
    title: string;
    description: string | null;
    videourl: string | null;
    position: number;
    ispublished: boolean;
    isfree: boolean;
    courseId: string;
    createdAt: Date;
    updatedAt: Date;
}

type MuxData = {
    id: string;
    assetId: string;
    playbackId: string | null;
    chapterId: string;
}
interface ChapterVideoFormProps {
    initialData: Chapter & { muxData?: MuxData | null } ;
    courseId: string;
    chapterId: string;
  };
  





export const ChapterVideoForm = ({
    initialData,
    courseId,
    chapterId,
}: ChapterVideoFormProps) => {


  const formSchema = z.object({
    images: z.object({ url: z.string() }).array()
  });
  const defaultValues = {
    images: [],
  };
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const toggleEdit = () => setIsEditing((current) => !current);

  const router = useRouter();
  const { isSubmitting,isValid,isLoading} = form.formState;
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const {images}=values
      const value={videourl:images[0].url,type:"videourl"}
      await axios.patch(`/api/courses/${courseId}/chapters/${chapterId}`, value);
      toast.success("Chapter updated");
      toggleEdit();
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    }
  }

  
  
  return (
    <div className="mt-6 border bg-slate-100 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
Chapter Video
        <Button onClick={toggleEdit} variant="ghost">
          {isEditing && (
            <>Cancel</>
          )}
          {!isEditing && !initialData.videourl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add a video
            </>
          )}
          {!isEditing && initialData.videourl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit video
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        !initialData.videourl ? (
          <div className="flex items-center justify-center h-60 bg-slate-200 rounded-md">
            <Video className="h-10 w-10 text-slate-500" />
          </div>
        ) : (
          <div className="relative aspect-video mt-2">
             <MuxPlayer
             src={initialData.videourl}
            />
          </div>
        )
      )}
      {isEditing && (
        <div>
           
          <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-2/3 space-y-6"
          >
             <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video</FormLabel>
                  <FormControl>
                    <VideoUpload
                    type="images"
                      value={field.value.map((image) => image.url)}
                      disabled={isLoading}
                      onChange={(url) =>
                        field.onChange([...field.value, { url }])
                      }
                      onRemove={(url) =>
                        field.onChange([
                          ...field.value.filter(
                            (current) => current.url !== url
                          ),
                        ])
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
                disabled={!isValid || isSubmitting}
                type="submit"
              >
                Save
              </Button>
                

                  </form>
        </Form>
        <div className="text-xs text-muted-foreground mt-4">
           Upload this chapter&apos;s video
          </div>
        </div>
      )}
      {initialData.videourl && !isEditing && (
        <div className="text-xs text-muted-foreground mt-2">
          Videos can take a few minutes to process. Refresh the page if video does not appear.
        </div>
      )}
     
    </div>
  )
}