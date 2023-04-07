import { Intro } from "@/components/Intro";
import { About } from "@/components/About";
import { Experience } from "@/components/Experience";

export default function Home() {
  return (
    <main className="p-4 flex flex-col bg-third-blue">
      <Intro />
      <About />
      <Experience />
    </main>
  )
}
