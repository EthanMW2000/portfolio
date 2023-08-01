import { Intro } from "@/components/homepage/Intro";
import { About } from "@/components/homepage/About";
import { Experience } from "@/components/homepage/Experience";
import { Contact } from "@/components/homepage/Contact";

export default function Home() {
  return (
    <main className="p-4 flex flex-col text-primary bg-secondary bg-noise font-sans">
      <Intro />
      <About />
      <Experience />
      <Contact />
    </main>
  );
}
