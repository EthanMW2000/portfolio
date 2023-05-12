"use client";
import experiences from "../assets/experience.json";
import { motion } from "framer-motion";
import { useState } from "react";

export function Experience() {
  const [dragged, setDragged] = useState(false);

  return (
    <div id="experience" className="min-h-screen flex flex-row justify-center">
      <div className="flex flex-col justify-center items-center space-y-10">
        <h1 className="text-4xl">Experience</h1>
        <motion.button onDrag={() => setDragged(true)} drag className="text-sm font-bold">{dragged ? 'NOT ME!!' : '*try dragging*'}</motion.button>
        <div className="flex flex-row justify-center items-center space-x-6 text-lg">
          {experiences.work.map((work) => (
            <motion.div
              key={work.title}
              whileHover={{ scale: 1.1 }}
              drag
              dragConstraints={{
                top: -300,
                left: -300,
                right: 300,
                bottom: 300,
              }}
              className="flex flex-col justify-center items-center bg-gray-500 rounded-xl w-[500px] h-[400px] "
            >
              <h2 className="text-3xl text-white text-center py-4">
                {work.title}
              </h2>
              <div className="px-4 pt-4 h-full bg-gray-300 rounded-b-xl">
                <h3 className="text-2xl">{work.employer}</h3>
                <p className="text-lg">
                  {work.descriptions.map((desc) => {
                    return desc + "\n ";
                  })}
                </p>
                <p className="text-lg">
                  {work.technologies.map((tech) => {
                    return tech + " ";
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
