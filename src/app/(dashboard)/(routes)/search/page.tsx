import { sql } from '@vercel/postgres'
import React from 'react'
import {Categories} from './_components/categories'
import { SearchInput } from '@/components/search-input'
import { auth } from '@clerk/nextjs'
import { redirect } from 'next/navigation'
import { getCourses } from '@/actions/get-courses'
import { CoursesList } from '@/components/courses-list'

interface SearchPageProps {
    searchParams: {
      title: string;
      categoryId: string;
    }
  };

export default async function SearchPage({
    searchParams
  }: SearchPageProps) {

    const { userId } = auth();
    if (!userId) {
        return redirect("/");
      }

    const categories=await sql`SELECT *
    FROM category
    ORDER BY name;
    `
    const courses = await getCourses({
        userId,
        ...searchParams,
      });


      console.log(courses)



  return (
   <>
   <div className='px-6 pt-6 md:hidden md:mb-0 block'>
    <SearchInput/>
   </div>
   <div className='p-6 space-y-4'>
        <Categories items={categories.rows}/>
        <CoursesList items={courses} />
    </div>
   </>
  )
}
