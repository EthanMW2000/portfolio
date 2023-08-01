"use client";
import experiences from "../../assets/experience.json";
import { motion, useTransform, useScroll, animate } from "framer-motion";
import { useState } from "react";

export function Experience() {
  const [dragged, setDragged] = useState(false);
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div
      id="experience"
      className="min-h-screen flex flex-row justify-center items-center pt-24"
    >
      <div className="flex flex-col justify-center items-center space-y-10">
        <h1 className="text-4xl text-left">Experience</h1>
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
              className="flex flex-col rounded-xl w-[300px] h-full md:w-[500px] xl:w-[550px] md:h-[400px] px-4 backdrop-blur-sm shadow-md"
            >
              <h2 className="text-xl md:text-3xl text-center py-4">
                {work.title}
              </h2>

              <h3 className="text-lg md:text-2xl">{work.employer}</h3>
              {work.descriptions.map((desc) => {
                return (
                  <p key={desc} className="text-md md:text-lg">{`- ${desc}`}</p>
                );
              })}
              <div className="flex flex-wrap flex-row justify-stretch">
                {work.technologies.map((tech) => {
                  return (
                    <motion.p
                      transition={{
                        duration: 2,
                        ease: "easeInOut",
                        times: [0, 0.2, 0.5, 0.8, 1],
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                      animate={{
                        scale: [1, 1.25, 1.25, 1, 1],
                      }}
                      key={tech}
                      className="text-md md:text-lg px-2 my-1 mx-3 bg-secondary-button rounded-lg"
                    >
                      {tech}
                    </motion.p>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
        <h1 className="text-4xl">Projects</h1>
        <div className="flex flex-col xl:flex-row flex-wrap justify-center items-center space-y-6 xl:space-y-0 text-lg">
          {experiences.projects.map((project) => (
            <motion.div
              whileHover={{ scale: 1.1 }}
              drag
              dragConstraints={{
                left: -300,
                right: 300,
                top: -300,
                bottom: 300,
              }}
              key={project.name}
              className="flex flex-col rounded-xl w-[300px] h-full md:w-[500px] 2xl:w-[700px] xl:w-[600px] md:h-[300px] xl:h-[275px] px-4 m-3 backdrop-blur-sm shadow-md"
            >
              <h2 className="text-xl md:text-3xl text-center py-4">
                {project.name}
              </h2>
              <h3 className="text-lg md:text-2xl">{project.type}</h3>
              <p className="text-md md:text-lg">{project.description}</p>
              <div className="flex flex-wrap flex-row justify-stretch">
                {project.technologies.map((tech) => {
                  return (
                    <motion.p
                      transition={{
                        duration: 2,
                        ease: "easeInOut",
                        times: [0, 0.2, 0.5, 0.8, 1],
                        repeat: Infinity,
                        repeatDelay: 2,
                      }}
                      animate={{
                        scale: [1, 1.25, 1.25, 1, 1],
                      }}
                      key={tech}
                      className="text-md md:text-lg px-2 my-1 mx-3 bg-secondary-button rounded-lg"
                    >
                      {tech}
                    </motion.p>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
