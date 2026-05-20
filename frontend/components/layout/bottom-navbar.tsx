"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Home, Map, User } from "lucide-react";

export const BottomNavbar = () => {
  const pathname = usePathname();
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/10 p-2 backdrop-blur-2xl shadow-xl w-fit mx-auto">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              className={`relative flex h-14 w-14 items-center justify-center rounded-full transition-all duration-500 ${
                isActive
                  ? "bg-white text-neutral-900 scale-105 shadow-md"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill={isActive ? "currentColor" : "none"}
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                {tab.icon}
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const tabs = [
  //   {
  //     id: "home",
  //     icon: <Home />,
  //     href: "/",
  //   },
  {
    id: "map",
    icon: <Map />,
    href: "/map",
  },
  //   {
  //     id: "events",
  //     icon: <Calendar />,
  //     href: "/events",
  //   },
  {
    id: "account",
    icon: <User />,
    href: "/account",
  },
];
