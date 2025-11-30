"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

export default function MaybeNavbar() {
  const pathname = usePathname() || "/";

  // hide client navbar for admin routes
  if (pathname.startsWith("/admin")) return null;

  return <Navbar />;
}
