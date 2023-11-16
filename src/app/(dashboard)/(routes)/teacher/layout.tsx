
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";

const TeacherLayout = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const { userId } = auth();


  return <>{children}</>
}
 
export default TeacherLayout;