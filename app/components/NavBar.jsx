import Link from "next/link";
import React from "react";
import WeatherContaminationModal from "./WeatherContaminationButton";
import { Droplet } from "lucide-react";

const Navbar = ({ turbidity }) => {
  return (
    <nav className="flex justify-between items-center px-6 py-3 bg-sky-900 text-white shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-2 text-2xl font-bold">
        <Droplet className="w-7 h-7 text-sky-400" />
        <span>AquaCheck</span>
      </div>

      {/* Nav Links + Button */}
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="hover:text-sky-300 font-medium transition-colors"
        >
          Home
        </Link>
        <Link
          href="/charts"
          className="hover:text-sky-300 font-medium transition-colors"
        >
          Charts
        </Link>
        <Link
          href="/ai"
          className="hover:text-sky-300 font-medium transition-colors"
        >
          AI Analysis
        </Link>
        <Link
          href="/about"
          className="hover:text-sky-300 font-medium transition-colors"
        >
          About
        </Link>

        {/* Contamination Modal Trigger */}
        <WeatherContaminationModal turbidity={turbidity} />
      </div>
    </nav>
  );
};

export default Navbar;
