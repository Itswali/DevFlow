import React from 'react'
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import myIcon from "../../public/title.png"
import Image from "next/image";
import {
  LayoutDashboard,
  Kanban,
  FolderDot,
  Users,
  MessageSquareText,
  Settings
} from "lucide-react";
import Link from "next/link";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Board", href: "/dashboard/board", icon: Kanban },
  { name: "Projects", href: "/dashboard/projects", icon: FolderDot },
  { name: "Teams", href: "/dashboard/teams", icon: Users },
  { name: "Reviews", href: "/dashboard/reviews", icon: MessageSquareText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function LeftDashboard() {
  return (
  <section className="min-h-150 w-64 bg-white border border-gray-200 border-b-green-600 rounded-xl shadow-sm">
  {/* Image Container */}
  <div className="flex justify-center p-4">
    <Image
      src={myIcon}
      alt="Title Icon"
      width={120}
      height={120}
      className="object-contain"
    />
  </div>

  {/* Search Bar Container */}
  <div className="px-4 pb-4">
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search projects..."
        className="pl-10 pr-4 bg-slate-50"
      />
    </div>
  </div>
    <h4 className='text-1xl'>Navigation</h4>
 <nav className="flex flex-col gap-2 p-4">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-green-600 transition-colors"
        >
          <item.icon className="h-5 w-5" />
          <span className="text-sm font-medium">{item.name}</span>
        </Link>
      ))}
    </nav>
</section>
  )
}
