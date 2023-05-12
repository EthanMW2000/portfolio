import experiences from "../assets/experience.json";

export function Experience() {
  return (
    <div id="experience" className="min-h-screen flex flex-row justify-center">
      <div className="flex flex-col justify-center items-center space-y-10">
        <h1 className="text-4xl">Experience</h1>
        <div className="flex flex-row justify-center items-center space-y-4 space-x-6 text-lg">
          {experiences.work.map((work) => (
            <div key={work.title} className="rounded-xl w-[500px] h-[400px] border-2">
              <h2 className="text-2xl text-center border-b-2 py-4">{work.title}</h2>
              <div className="p-4">
              <h3 className="text-xl">{work.employer}</h3>
              <p className="text-lg">{work.descriptions.map((desc) => {
                return desc + "\n ";
              })}</p>
              <p className="text-lg">{work.technologies.map((tech) => {
                return tech + " ";
              })}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
