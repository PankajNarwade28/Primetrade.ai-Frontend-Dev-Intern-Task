"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function Navbar({ isLoggedIn, userEmail }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">TaskApp</h1>
        
        {/* Mobile Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          ☰
        </button>

        <div className={`${isOpen ? 'block' : 'hidden'} md:flex space-x-6 items-center`}>
          <Link href="/">Home</Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <span className="bg-blue-800 px-3 py-1 rounded text-sm">
                Logged in: {userEmail}
              </span>
              <button className="bg-red-500 px-4 py-2 rounded">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup" className="bg-white text-blue-600 px-4 py-2 rounded">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}