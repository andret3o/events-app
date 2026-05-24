import { Calendar, Home, Map, User } from "lucide-react";

// Home & Events tabs to be added later
export const NAV_TABS = [
  //   {
  //     id: "home",
  //     icon: Home,
  //     href: "/",
  //   },
  {
    id: "map",
    icon: Map,
    label: "Map",
    href: "/map",
  },
  {
    id: "events",
    icon: Calendar,
    label: "Events",
    href: "/events",
  },
  {
    id: "profile",
    icon: User,
    label: "Profile",
    href: "/profile",
  },
] as const;
