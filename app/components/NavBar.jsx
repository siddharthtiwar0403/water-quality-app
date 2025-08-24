'use client'
import Link from "next/link";
import React, { useState } from "react";
import WeatherContaminationModal from "./WeatherContaminationButton";
import { Droplet, Menu, X } from "lucide-react";
import DiseaseScreen from "./DiseaseScreen";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = ({ turbidity, ph, tds }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-sky-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 text-2xl font-bold">
  <Droplet className="w-7 h-7 text-sky-400" />
  <span className="font-fancy">AquaCheck</span>
</div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="hover:text-sky-300 font-medium transition-colors">
            Home
          </Link>
          
          <Link href="/about" className="hover:text-sky-300 font-medium transition-colors">
            About
          </Link>

          <WeatherContaminationModal turbidity={turbidity} />
          <DiseaseScreen tds={tds} turbidity={turbidity} ph={ph} />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-sky-800 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Dropdown Menu with animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-sky-800 px-6 py-4 flex flex-col gap-4 overflow-hidden"
          >
            <Link
              href="/"
              className="hover:text-sky-300 font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
           
          
            <Link
              href="/about"
              className="hover:text-sky-300 font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>

           
            <WeatherContaminationModal turbidity={turbidity} />
            <DiseaseScreen tds={tds} turbidity={turbidity} ph={ph} />
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
