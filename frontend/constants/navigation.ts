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
    href: "/map",
  },
  {
    id: "events",
    icon: Calendar,
    href: "/events",
  },
  {
    id: "profile",
    icon: User,
    href: "/profile",
  },
] as const;
