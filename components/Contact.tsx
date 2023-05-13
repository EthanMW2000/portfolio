
export function Contact() {
  return (
    <div id="contact" className="flex flex-row justify-center min-h-screen">
      <div className="flex flex-col justify-center items-center space-y-10">
        <h1 className="text-4xl">Contact</h1>
        <h1 className="text-8xl">WORK IN PROGRESS</h1>
        <div className="flex flex-col xl:flex-row justify-center items-center space-y-6 xl:space-y-0 xl:space-x-6 text-lg">
          <div className="flex flex-col bg-neutral-50/15 rounded-xl w-[300px] h-full md:w-[500px] xl:w-[550px] md:h-[400px] px-4 backdrop-blur-sm shadow">
            <h2 className="text-xl md:text-3xl text-center py-4">{`Let's Talk`}</h2>
            <p className="text-md md:text-lg">
              I am currently looking for new opportunities. If you have any
              questions or would like to get in touch, please feel free to
              contact me.
            </p>
            <div className="flex flex-row justify-center items-center space-x-4">
              <a
                href="mailto:ethanmw2000@gmail.com"
                className="text-md md:text-lg text-blue-500"
              >
                Email
              </a>
              <a
                href="https://www.linkedin.com/in/ethan-wells00/"
                className="text-md md:text-lg text-blue-500"
              >
                LinkedIn
              </a>
              <a
                href={"Wells-Ethan.pdf"}
                target={"_blank"}
                rel="noreferrer"
                className="text-md md:text-lg text-blue-500"
              >
                Resume
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
