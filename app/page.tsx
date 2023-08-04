import { Intro } from "@/components/homepage/Intro";
import { About } from "@/components/homepage/About";
import { Experience } from "@/components/homepage/Experience";
import { Contact } from "@/components/homepage/Contact";
import { NavBar } from "@/components/homepage/NavBar";

export default function Home() {
  return (
    <div>
      <div className="flex w-full fixed top-0 z-10">
        <NavBar />
      </div>
      <div className="p-4 flex flex-col text-primary bg-secondary bg-noise font-sans">
        <Intro />
        <About />
        <Experience />
        <Contact />
      </div>
    </div>
  );
}
