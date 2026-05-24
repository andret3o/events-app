"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_TABS } from "@/constants/navigation";

export const BottomNavbar = () => {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 pointer-events-auto"
    >
      <ul className="glass-nav flex items-center gap-1 rounded-full p-1.5">
        {NAV_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;

          return (
            <li key={tab.id}>
              <Link
                href={tab.href}
                aria-label={tab.label}
                aria-current={isActive ? "page" : undefined}
                className={`
                  relative flex h-12 w-12 items-center justify-center rounded-full
                  transition-all duration-300
                  ${
                    isActive
                      ? "bg-foreground text-background shadow-md scale-105"
                      : "text-foreground/40 hover:text-foreground/80 hover:bg-foreground/8"
                  }
                `}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={isActive ? "currentColor" : "none"}
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <Icon />
                </svg>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
