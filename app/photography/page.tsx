import { ChevronRight } from "@/components/ChevronRight";
import Sidebar from "@/components/photography/Sidebar";

export default function Photography() {
  return (
    <main>
      <Sidebar />
      <div className="flex flex-col justify-center items-center mt-10">
        <h1 className="text-4xl text-primary">
          My photography showcase is currently being built!
        </h1>
        <h3 className="text-xl text-primary-button mt-10">
          Check back soon
        </h3>
        <div className="flex flex-row">
          <a
            href={"/"}
            className="text-md md:text-lg bg-secondary-button rounded-lg pl-4 pr-2 py-2 text-primary flex flex-row justify-center items-center"
          >
            Home
            <ChevronRight width={24} height={24} fill="#1b2541" />
          </a>
        </div>
      </div>
    </main>
  );
}
