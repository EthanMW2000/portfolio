import skills from "../assets/skills.json";
import Marquee from "react-fast-marquee";
import Image from "next/image";
import motion from "framer-motion";

export function About() {
  return (
    <div id="about" className="flex flex-row justify-center min-h-screen pt-24 lg:pt-0">
      <div className="flex flex-col justify-center content-center space-y-8">
      <h1 className="text-center text-4xl">About Me</h1>
      <div className="flex flex-row justify-center">
        <Image
          className="rounded-xl"
          alt="my photo"
          src="/my-photo.jpg"
          width={275}
          height={275}
        />
      </div>
      <div className="flex flex-col lg:flex-row">
        <div className="flex flex-col justify-center max-w-lg">
          <div className="flex flex-col space-y-4 text-lg pb-24">
            <p>
              Hello! My name is Ethan Wells and I am a software engineer. For a
              long time I have been interested in programming and over the
              course of my college career I have found myself most interested in
              web and app development.
            </p>
            <p>
              Currently I am working as a software engineer with StaffWise. With
              them I am developing a web application that wll give hospitals the
              proper budgetting tools. At the same time I am completeing my
              senior year at Wichita State University, after which I will have
              received a B.S. in Computer Science.
            </p>
            <p>
              During my spare moments I have been devoting my time to working
              with
              <b> Go</b> and <b>Swift</b>. Outside of programming I enjoy
              photography, anime, and League.
            </p>
          </div>
        </div>
        <div className="flex flex-col justify-center max-w-lg">
          <div className="flex flex-col space-y-4 text-lg pb-24">
            <Marquee
              speed={65}
              gradient={true}
              gradientWidth={100}
              pauseOnHover={true}
              autoFill={true}
            >
              {skills.languages.map((skill) => (
                <div key={skill} className=" m-2 p-2 rounded-lg">
                  <h2 className="text-2xl">{skill}</h2>
                </div>
              ))}
            </Marquee>
            <Marquee
              direction="right"
              speed={65}
              gradient={true}
              gradientWidth={100}
              pauseOnHover={true}
              autoFill={true}
            >
              {skills.frontend.map((skill) => (
                <div key={skill} className=" m-2 p-2 rounded-lg">
                  <h2 className="text-2xl">{skill}</h2>
                </div>
              ))}
            </Marquee>
            <Marquee
              speed={65}
              gradient={true}
              gradientWidth={100}
              pauseOnHover={true}
              autoFill={true}
            >
              {skills.backend.map((skill) => (
                <div key={skill} className=" m-2 p-2 rounded-lg">
                  <h2 className="text-2xl">{skill}</h2>
                </div>
              ))}
            </Marquee>
            <Marquee
              direction="right"
              speed={65}
              gradient={true}
              gradientWidth={100}
              pauseOnHover={true}
              autoFill={true}
            >
              {skills.database.map((skill) => (
                <div key={skill} className=" m-2 p-2 rounded-lg">
                  <h2 className="text-2xl">{skill}</h2>
                </div>
              ))}
            </Marquee>
            <Marquee
              speed={65}
              gradient={true}
              gradientWidth={100}
              pauseOnHover={true}
              autoFill={true}
            >
              {skills.devops.map((skill) => (
                <div key={skill} className=" m-2 p-2 rounded-lg">
                  <h2 className="text-2xl">{skill}</h2>
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
