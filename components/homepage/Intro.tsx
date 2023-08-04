import { ChevronRight } from "../ChevronRight";


export function Intro() {
  return (
    <div id="home" className="flex flex-row justify-center">
      <div className="flex flex-col justify-center min-h-screen">
        <div className="pb-4">
          <h2 className="text-2xl">
            Welcome
            <br />
            my name is
          </h2>
          <h1 className="text-6xl font-medium">Ethan.</h1>
        </div>
        <div className="pb-4">
          <h2 className="text-2xl">I am a</h2>
          <h1 className="text-6xl font-medium">Software Engineer.</h1>
        </div>
        <p className="text-lg">
          I specialize in
          <span className="font-bold"> full stack </span> development with
          <span className="font-bold"> web</span> and
          <span className="font-bold"> mobile</span> applications.
        </p>
        <div className="flex flex-col xs:flex-row gap-4 mt-6">
          <div className="flex flex-row">
            <a
              href={"#about"}
              className="text-md md:text-lg bg-primary-button rounded-lg pl-4 pr-2 py-2 text-secondary flex flex-row justify-center items-center"
            >
              Discover More
              <ChevronRight width={24} height={24} fill="#f1f1ef" />
            </a>
          </div>

          <div className="flex flex-row">
            <a
              href={"/photography"}
              className="text-md md:text-lg bg-secondary-button rounded-lg pl-4 pr-2 py-2 text-primary flex flex-row justify-center items-center"
            >
              Photography Portfolio
              <ChevronRight width={24} height={24} fill="#1b2541" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
