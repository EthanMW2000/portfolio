import skills from '../assets/skills.json'

export function About() {
  return (
    <div className="flex flex-row justify-center">
      <div className="flex flex-col justify-center max-w-lg">
        <h1 className="text-4xl">About Me</h1>
        <div className="flex flex-col space-y-4 text-lg pb-24">
          <p>
            Hello! My name is Ethan Wells and I am a software engineer. For a long 
            time I have been interested in programming and over the course of my college 
            career I have found myself most interested in web and app development. 
          </p>
          <p>
            Currently I am working as a software engineer with StaffWise. With them I 
            am developing a web application that wll give hospitals the proper budgetting
            tools. At the same time I am completeing my senior year at Wichita State 
            University, after which I will have received a B.S. in Computer Science.
          </p>
          <p>
            During my spare moments I have been devoting my time to working with 
            <b> Go</b> and <b>Swift</b>. Outside of programming I enjoy photography,
            anime, and League.
          </p>
        </div>
        <h1 className="text-4xl">Skills</h1>
        <div id="scroll-container">
          <div id="scroll-text" className='flex flex-row-reverse'>
            {skills.languages.map(skill => (
            <div key={skill} className='bg-gray-400 mr-6 m-2 p-2 rounded-lg'>
                <h2 className="text-2xl">{skill}</h2>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}