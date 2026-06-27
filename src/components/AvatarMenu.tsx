"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

interface AvatarMenuProps {
  user: {
    email: string;
  };
}

export function AvatarMenu({ user }: AvatarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const initial = user.email[0]?.toUpperCase() || "?";

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Do not close if click is on the avatar button itself (it has toggle logic)
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = (e: Event) => {
      // Do not close if scrolling inside the dropdown itself
      if (dropdownRef.current && dropdownRef.current.contains(e.target as Node)) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  // Close dropdown on navigation
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="avatar-menu-container" ref={containerRef}>
      <button
        type="button"
        className="avatar-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User account menu"
      >
        {initial}
      </button>

      {isOpen && (
        <div className="avatar-dropdown" ref={dropdownRef} role="menu">
          <div className="avatar-dropdown-header">
            <span className="avatar-dropdown-header-title">Signed in as</span>
            <span className="avatar-dropdown-email" title={user.email}>
              {user.email}
            </span>
          </div>

          <Link
            href="/account"
            className={`avatar-dropdown-item ${isActive("/account") ? "active" : ""}`}
            role="menuitem"
          >
            Account
          </Link>

          <div
            className="avatar-dropdown-item disabled"
            aria-disabled="true"
            role="menuitem"
          >
            <span>Settings</span>
            <span className="soon-tag">Soon</span>
          </div>

          <div
            className="avatar-dropdown-item disabled"
            aria-disabled="true"
            role="menuitem"
          >
            <span>Deep Research</span>
            <span className="soon-tag">Soon</span>
          </div>

          <div className="avatar-dropdown-divider" />

          <div className="avatar-dropdown-signout" role="menuitem">
            <SignOutButton variant="nav" />
          </div>
        </div>
      )}
    </div>
  );
}
