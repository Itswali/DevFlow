"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Kanban,
  FolderDot,
  Users,
  MessageSquareText,
  Settings
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import myIcon from "../../public/title.png";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Board", href: "/board", icon: Kanban },
  { name: "Projects", href: "/projects", icon: FolderDot },
  { name: "Teams", href: "/teams", icon: Users },
  { name: "Reviews", href: "/reviews", icon: MessageSquareText },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function LeftDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <section
      className={cn(
        "relative flex flex-col h-[calc(100vh-2rem)] bg-white border border-slate-200 border-b-green-600 rounded-2xl shadow-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1 hover:bg-green-50 text-slate-500 hover:text-green-600 shadow-sm z-10"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Brand/Logo Area */}
      <div className={cn("flex justify-center transition-all", isCollapsed ? "p-4" : "p-6")}>
        {isCollapsed ? (
          <div className="h-10 w-10 bg-green-600 rounded-lg flex items-center justify-center text-white font-bold">
            T
          </div>
        ) : (
          <Image
            src={myIcon}
            alt="Title Icon"
            width={130}
            height={40}
            className="object-contain hover:scale-105 transition-transform duration-200"
          />
        )}
      </div>

      {/* Search Bar Area */}
      <div className="px-4 mb-4">
        <div className="relative group flex justify-center">
          <Search
            className={cn(
              "absolute top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-green-600 transition-colors",
              isCollapsed ? "left-1/2 -translate-x-1/2" : "left-3"
            )}
          />
          {!isCollapsed && (
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 pr-4 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-green-500 rounded-lg"
            />
          )}
          {isCollapsed && <div className="h-10 w-10 bg-slate-50 rounded-lg" />}
        </div>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 px-4 overflow-y-auto">
        {!isCollapsed && (
          <h4 className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Main Menu
          </h4>
        )}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              title={isCollapsed ? item.name : ""}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:bg-green-50 hover:text-green-700 transition-all duration-200 group",
                isCollapsed ? "justify-center px-0" : ""
              )}
            >
              <item.icon className="h-5 w-5 transition-transform group-hover:scale-110 shrink-0" />
              {!isCollapsed && (
                <span className="text-[14px] font-medium whitespace-nowrap opacity-100 transition-opacity">
                  {item.name}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Profile section */}
      <div className="p-4 border-t border-slate-100">
        <div
          className={cn(
            "bg-slate-50 p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-slate-100 transition-colors",
            isCollapsed ? "justify-center p-2" : ""
          )}
        >
          <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center text-white text-xs shrink-0">
            JD
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-700">Need Help?</span>
              <span className="text-[10px] text-slate-500">Contact Support</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
