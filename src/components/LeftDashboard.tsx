import React from 'react'
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import myIcon from "../../public/title.png"
import Image from "next/image";

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
</section>
  )
}
