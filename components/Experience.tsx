"use client";
import experiences from "../assets/experience.json";
import { motion, useTransform, useScroll } from "framer-motion";
import { use, useEffect, useState } from "react";
import Marquee from "react-fast-marquee";

export function Experience() {
  const [dragged, setDragged] = useState(false);
  const { scrollYProgress } = useScroll();

  return (
    <div
      id="experience"
      className="overscroll-none min-h-screen flex flex-row justify-center items-center"
    >
      <div className="flex flex-col justify-center items-center space-y-10">
        <h1 className="text-4xl">Experience</h1>
        <motion.button
          onDrag={() => setDragged(true)}
          drag
          className="invisible md:visible md:h text-sm font-bold"
        >
          {dragged ? "NOT ME!!" : "*try dragging*"}
        </motion.button>
        <div className="flex flex-col xl:flex-row justify-center items-center space-y-6 xl:space-y-0 xl:space-x-6 text-lg">
          {experiences.work.map((work) => (
            <motion.div
              key={work.title}
              whileHover={{ scale: 1.1 }}
              drag
              dragConstraints={{
                left: -300,
                right: 300,
                top: -300,
                bottom: 300,
              }}
              className="flex flex-col justify-center items-center bg-gray-500 rounded-xl w-[300px] h-full md:w-[500px] xl:w-[550px] md:h-[400px]"
            >
              <h2 className="text-xl md:text-3xl text-white text-center py-4">
                {work.title}
              </h2>
              <div className="px-4 pt-4 w-full h-full bg-gray-300 space-y-2 rounded-b-xl pb-4">
                <h3 className="text-lg md:text-2xl">{work.employer}</h3>
                {work.descriptions.map((desc) => {
                  return (
                    <p
                      key={desc}
                      className="text-md md:text-lg"
                    >{`- ${desc}`}</p>
                  );
                })}
                <div className="flex flex-wrap flex-row justify-stretch space-x-2 ">
                  {work.technologies.map((tech) => {
                    return (
                      <motion.p key={tech} className="text-md md:text-lg">
                        {tech}
                      </motion.p>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex flex-col xl:flex-row flex-wrap justify-center items-center space-y-6 xl:space-y-0 text-lg">
          {experiences.projects.map((project) => (
            <div
              key={project.name}
              className="flex flex-col justify-center items-center bg-gray-500 rounded-xl w-[300px] h-full md:w-[500px] xl:w-[550px] md:h-[400px] m-4"
            >
              <h2 className="text-xl md:text-3xl text-white text-center py-4">
                {project.name}
              </h2>
              <div className="px-4 pt-4 w-full h-full bg-gray-300 space-y-2 rounded-b-xl pb-4">
                <h3 className="text-lg md:text-2xl">{project.type}</h3>
                <p className="text-md md:text-lg">{project.description}</p>
                <div className="flex flex-wrap flex-row justify-stretch space-x-2 ">
                  {project.technologies.map((tech) => {
                    return (
                      <motion.p key={tech} className="text-md md:text-lg">
                        {tech}
                      </motion.p>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
