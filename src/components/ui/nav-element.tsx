"use client";

import { FC } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavElementProps {
  label: string;
  href: string;
  navigationStarts?: () => void;
  className?: string;
}

const NavElement: FC<NavElementProps> = ({ label, href, navigationStarts, className = '' }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`text-lg font-semibold hover:text-white transition-colors duration-200 ${
        isActive ? 'text-white' : 'text-gray-300'
      } ${className}`}
      onClick={navigationStarts}
    >
      {label}
    </Link>
  );
};

export default NavElement; 