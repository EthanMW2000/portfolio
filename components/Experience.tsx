"use client";
import experiences from "../assets/experience.json";
import { motion } from "framer-motion";
import { use, useEffect, useState } from "react";

export function Experience() {
  const [dragged, setDragged] = useState(false);

  return (
    <div id="experience" className="overscroll-none min-h-screen flex flex-row justify-center items-center">
      <div className="flex flex-col justify-center items-center space-y-10">
        <h1 className="text-4xl">Experience</h1>
        <motion.button onDrag={() => setDragged(true)} drag className="invisible md:visible md:h text-sm font-bold">{dragged ? 'NOT ME!!' : '*try dragging*'}</motion.button>
        <div className="flex flex-col lg:flex-row justify-center items-center space-y-6 lg:space-x-6 text-lg">
          {experiences.work.map((work) => (
            <motion.div
              key={work.title}
              whileHover={{ scale: 1.1 }}
              drag
              dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
              className="flex flex-col justify-center items-center bg-gray-500 rounded-xl w-[300px] h-full md:w-[500px] md:h-[400px]"
            >
              <h2 className="text-xl md:text-3xl text-white text-center py-4">
                {work.title}
              </h2>
              <div className="px-4 pt-4 w-full h-full bg-gray-300 space-y-2 rounded-b-xl pb-4">
                <h3 className="text-lg md:text-2xl">{work.employer}</h3>
                  {work.descriptions.map((desc) => {
                    return <p key={desc} className="text-md md:text-lg">{`- ${desc}`}</p>
                  })}
                  <div className="flex flex-wrap flex-row justify-center space-x-2 ">
                  {work.technologies.map((tech) => {
                    return <p key={tech} className="text-md md:text-lg">{tech}</p>
                  })}
                  </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
