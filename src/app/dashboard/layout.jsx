import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";
import Link from 'next/link';

const DashboardLayout = async ({ children }) => {
  const session = await auth();
  console.log({ session });

  if (!session) redirect("/auth/login");

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-bold mb-4">Dashboard</h2>
        <nav className="flex flex-col space-y-2">
          <Link href="/dashboard" className="hover:text-blue-600 border-b border-black pb-2">
            Home
          </Link>
          <Link href="/dashboard/make-quiz" className="hover:text-blue-600 border-b border-black pb-2">
            Make Quiz
          </Link>
          <Link href="/dashboard/create-test" className="hover:text-blue-600 border-b border-black pb-2">
            Create Test
          </Link>
          <Link href="/dashboard/assign-test" className="hover:text-blue-600 border-b border-black pb-2">
            Assign Test
          </Link>
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
};

export default DashboardLayout;
