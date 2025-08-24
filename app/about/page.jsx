// components/AboutSection.js
"use client";
import React from "react";
import Navbar from "../components/NavBar";

const AboutSection = () => {
  const stats = [
    { value: "10K+", label: "Users Empowered" },
    { value: "97%", label: "Accuracy Rate" },
    { value: "24/7", label: "Monitoring" },
  ];

  const features = [
    {
      title: "Real-Time Monitoring",
      desc: "Track critical water quality parameters with intuitive sliders and receive instant analysis with visualizations that make complex data understandable.",
      color: "from-blue-50 to-white border-blue-100 text-blue-600",
      icon: "🔬",
    },
    {
      title: "AI-Powered Insights",
      desc: "Get personalized prevention strategies, filtration recommendations, and cost analysis powered by advanced machine learning algorithms.",
      color: "from-purple-50 to-white border-purple-100 text-purple-600",
      icon: "🤖",
    },
    {
      title: "Sustainable Future",
      desc: "Promote water conservation, reduce plastic waste from bottled water, and support global sustainability goals through informed water management.",
      color: "from-green-50 to-white border-green-100 text-green-600",
      icon: "🌍",
    },
  ];

  return (
    <>
    <Navbar/>
    <section
      id="about"
      className="relative flex items-center justify-center min-h-screen px-6 py-20 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden"
    >
      {/* Decorative circles */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-gradient-to-br from-cyan-200/30 to-blue-400/30"></div>
      <div className="absolute bottom-[-60px] left-[-60px] w-44 h-44 rounded-full bg-gradient-to-br from-cyan-100/30 to-cyan-300/30"></div>

      <div className="relative z-10 max-w-5xl w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-xl px-8 md:px-16 py-12 text-center border border-white/50">
        {/* Logo */}
        <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-blue-900 shadow-lg">
          <span className="text-4xl text-white">💧</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-900 to-cyan-600 bg-clip-text text-transparent mb-6">
          About Smart Water Quality Advisor
        </h2>

        {/* Description */}
        <p className="max-w-2xl mx-auto text-gray-700 text-lg leading-relaxed mb-12">
          Smart Water Quality Advisor is an advanced AI-powered platform designed
          to revolutionize how individuals and communities monitor and analyze
          essential water parameters. Our mission is to empower everyone with the
          tools needed to ensure{" "}
          <span className="font-semibold text-cyan-600">
            clean, safe, and affordable drinking water
          </span>
          .
        </p>

        {/* Features */}
        <div className="grid gap-8 md:grid-cols-3 mb-12">
          {features.map((f, i) => (
            <div
              key={i}
              className={`relative p-6 rounded-2xl border shadow-md bg-gradient-to-br ${f.color} hover:shadow-lg hover:-translate-y-1 transition-all`}
            >
              <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full flex items-center justify-center bg-gray-100 text-2xl shadow-sm">
                {f.icon}
              </div>
              <h3 className="text-lg font-semibold mb-3">{f.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Impact Stats */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-cyan-100 rounded-xl py-8 px-6">
          <h3 className="text-xl font-semibold text-blue-900 mb-8">
            Our Impact
          </h3>
          <div className="flex flex-wrap justify-center gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-cyan-600">
                  {s.value}
                </div>
                <div className="text-gray-700 mt-2">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default AboutSection;
