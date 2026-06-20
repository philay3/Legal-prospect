"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AvatarMenu } from "@/components/AvatarMenu";

interface NavBarProps {
  user: {
    email: string;
  } | null;
}

export function NavBar({ user }: NavBarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link href="/" className="navbar-logo">
          <span className="navbar-logo-dot"></span>
          <span>Legal Prospector</span>
        </Link>
        <div className="navbar-links">
          <Link
            href="/"
            className={`navbar-link ${isActive("/") ? "active" : ""}`}
          >
            Search
          </Link>
          {user ? (
            <AvatarMenu user={user} />
          ) : (
            <Link
              href="/login"
              className={`navbar-link ${isActive("/login") ? "active" : ""}`}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
