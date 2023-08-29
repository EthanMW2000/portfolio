"use client";
import skills from "../../assets/skills.json";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import "/app/globals.css";
import { initialTabs as tabs } from "./tabs";

export function About() {
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  return (
    <div
      id="about"
      className="flex flex-row justify-center min-h-screen pt-24 xl:pt-16"
    >
      <div className="flex flex-col justify-center content-center space-y-8">
        <h1 className="text-left text-4xl">About Me</h1>
        <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:space-x-24 justify-between">
          <div className="flex flex-col justify-center max-w-xs md:max-w-lg">
            <div className="flex flex-col space-y-4 text-lg text-justify">
              <p>
                Hello! My name is Ethan Wells and I am a software engineer. For
                a long time I have been interested in programming and over the
                course of my college career I have found myself most interested
                in web and app development.
              </p>
              <p>
                Currently I am working as a software engineer with Invista. With
                them I am helping innovate within their operations. At the same
                time I am completeing my senior year at Wichita State
                University, after which I will have received a B.S. in Computer
                Science.
              </p>
              <p>
                During my spare moments I have been devoting my time to working
                with
                <b> Go</b> and <b>Swift</b>. Outside of programming I enjoy
                <a href="/photography" className="text-primary-button font-bold hover:underline animate-pulse"> photography</a>, anime, and games.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center align-center">
            <Image
              className="rounded-xl border-accent border-2 shadow-xl backdrop-blur-lg hover:shadow-2xl transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-110"
              alt="A headshot of Ethan Wells"
              src="/professional-headshot.jpeg"
              width={275}
              height={275}
            />
          </div>
        </div>
        <div className="flex flex-col lg:flex-row mb-24 lg:space-x-8 justify-between items-center">
          <div className="flex flex-col justify-between max-w-xs md:max-w-lg">
            <div className="flex flex-col space-y-4 text-lg">
              <Marquee speed={65} pauseOnHover={true} autoFill={true}>
                {skills.languages.map((skill) => (
                  <div key={skill} className=" m-2 p-2 rounded-lg">
                    <h2 className="text-2xl">{skill}</h2>
                  </div>
                ))}
              </Marquee>
              <Marquee
                direction="right"
                speed={65}
                pauseOnHover={true}
                autoFill={true}
              >
                {skills.frontend.map((skill) => (
                  <div key={skill} className=" m-2 p-2 rounded-lg">
                    <h2 className="text-2xl">{skill}</h2>
                  </div>
                ))}
              </Marquee>
              <Marquee speed={65} pauseOnHover={true} autoFill={true}>
                {skills.backend.map((skill) => (
                  <div key={skill} className=" m-2 p-2 rounded-lg">
                    <h2 className="text-2xl">{skill}</h2>
                  </div>
                ))}
              </Marquee>
              <Marquee
                direction="right"
                speed={65}
                pauseOnHover={true}
                autoFill={true}
              >
                {skills.database.map((skill) => (
                  <div key={skill} className=" m-2 p-2 rounded-lg">
                    <h2 className="text-2xl">{skill}</h2>
                  </div>
                ))}
              </Marquee>
              <Marquee speed={65} pauseOnHover={true} autoFill={true}>
                {skills.devops.map((skill) => (
                  <div key={skill} className=" m-2 p-2 rounded-lg">
                    <h2 className="text-2xl">{skill}</h2>
                  </div>
                ))}
              </Marquee>
            </div>
          </div>
          <div className="flex flex-col h-fit shadow-md backdrop-blur-md w-full rounded-lg overflow-hidden">
            <nav className="backdrop-blur-sm">
              <ul className="backdrop-blur-sm">
                {tabs.map((item) => (
                  <li
                    key={item.label}
                    className={item === selectedTab ? "selected" : ""}
                    onClick={() => setSelectedTab(item)}
                  >
                    {`${item.icon} ${item.label}`}
                    {item === selectedTab ? (
                      <motion.div className="underline" layoutId="underline" />
                    ) : null}
                  </li>
                ))}
              </ul>
            </nav>
            <main>
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedTab ? selectedTab.label : "empty"}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -10, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {selectedTab
                    ? selectedTab.list.map((info) => {
                        return selectedTab.label === "Games" ? (
                          <div
                            key={info.label}
                            className="flex flex-row w-full items-center text-left justify-between h-[75px] border-b-2 border-accent"
                          >
                            <Image
                              alt={info.label}
                              src={info.icon}
                              height={100}
                              width={75}
                              loading="eager"
                            />
                            <p className="md:text-lg text-left text-sm">
                              {info.label}
                            </p>
                          </div>
                        ) : (
                          <div
                            key={info.label}
                            className="flex flex-row w-full items-center justify-between h-[75px] border-b-2 border-accent"
                          >
                            <Image
                              alt={info.label}
                              src={info.icon}
                              height={75}
                              width={140}
                              loading="eager"
                            />
                            <p className="md:text-lg text-left text-sm">
                              {info.label}
                            </p>
                          </div>
                        );
                      })
                    : ""}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
