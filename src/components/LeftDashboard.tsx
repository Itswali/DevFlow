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
  { name: "Board", href: "/board", icon: Kanban },
  { name: "Projects", href: "/projects", icon: FolderDot },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Reviews", href: "/reviews", icon: MessageSquareText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function LeftDashboard() {
  return (
    <section className="flex flex-col h-[calc(100vh-2rem)] w-64 bg-white border border-slate-200 border-b-green-600 rounded-2xl shadow-sm">
      {/* Brand/Logo Area */}
      <div className="flex justify-center p-6">
        <Image
          src={myIcon}
          alt="Title Icon"
          width={130}
          height={40}
          className="object-contain hover:scale-105 transition-transform duration-200"
        />
      </div>

      {/* Search Bar Area */}
      <div className="px-4 mb-4">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-10 pr-4 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-green-500 rounded-lg"
          />
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-4 overflow-y-auto">
        <h4 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </h4>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-green-50 hover:text-green-700 transition-all duration-200 group"
            >
              <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span className="text-[14px] font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Optional: Bottom Profile or Support section */}
      <div className="p-4 border-t border-slate-100">
         <div className="bg-slate-50 p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors">
            <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs">JD</div>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-700">Need Help?</span>
                <span className="text-[10px] text-slate-500">Contact Support</span>
            </div>
         </div>
      </div>
    </section>
  )
}
