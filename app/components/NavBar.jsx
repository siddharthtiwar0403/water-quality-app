import Link from "next/link";
import React from "react";
import WeatherContaminationModal from "./WeatherContaminationButton";

const Navbar = ({turbidity}) => {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 24px",
        backgroundColor: "#01579b",
        color: "white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Water Dashboard</div>
      <div style={{ display: "flex", gap: "20px" }}>
        <Link href="/" style={{ color: "white", textDecoration: "none", fontWeight: 500 }}>
          Home
        </Link>
        <Link href="/charts" style={{ color: "white", textDecoration: "none", fontWeight: 500 }}>
          Charts
        </Link>
        <Link href="/ai" style={{ color: "white", textDecoration: "none", fontWeight: 500 }}>
          AI Analysis
        </Link>
        <Link href="/about" style={{ color: "white", textDecoration: "none", fontWeight: 500 }}>
          About
        </Link>
        <div>
            <WeatherContaminationModal turbidity={turbidity}/>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
