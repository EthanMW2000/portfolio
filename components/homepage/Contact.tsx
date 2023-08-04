import { ChevronRight } from "../ChevronRight";

export function Contact() {
  return (
    <div
      id="contact"
      className="flex flex-row justify-center w-full min-h-screen"
    >
      <div className="flex flex-col justify-center items-center w-full space-y-10">
        <div className="flex flex-col xl:flex-row w-11/12 justify-center items-center space-y-6 xl:space-y-0 xl:space-x-6 text-lg">
          <div className="flex flex-col rounded-xl px-4 space-y-6">
            <h2 className="text-xl md:text-3xl text-center py-4">{`Let's Talk`}</h2>
            <p className="text-md md:text-lg">
              If you have any questions or would like to get in touch, please
              feel free to contact me using any of these links and connect with
              me.
            </p>
            <div className="flex flex-row justify-center items-center space-x-4 text-secondary-button">
              <a
                href="mailto:ethanmw2000@gmail.com"
                className="text-md md:text-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                  <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/ethan-wells00/"
                className="text-md md:text-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 30 30"
                  className="w-8 h-8"
                >
                  <path d="M24,4H6C4.895,4,4,4.895,4,6v18c0,1.105,0.895,2,2,2h18c1.105,0,2-0.895,2-2V6C26,4.895,25.105,4,24,4z M10.954,22h-2.95 v-9.492h2.95V22z M9.449,11.151c-0.951,0-1.72-0.771-1.72-1.72c0-0.949,0.77-1.719,1.72-1.719c0.948,0,1.719,0.771,1.719,1.719 C11.168,10.38,10.397,11.151,9.449,11.151z M22.004,22h-2.948v-4.616c0-1.101-0.02-2.517-1.533-2.517 c-1.535,0-1.771,1.199-1.771,2.437V22h-2.948v-9.492h2.83v1.297h0.04c0.394-0.746,1.356-1.533,2.791-1.533 c2.987,0,3.539,1.966,3.539,4.522V22z" />
                </svg>
              </a>
              <a
                href="https://github.com/EthanMW2000"
                className="text-md md:text-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-8 h-8"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
            <div className="flex flex-row justify-center gap-4">
              <div className="flex flex-row justify-center">
                <a
                  href={"Wells-Ethan.pdf"}
                  target={"_blank"}
                  rel="noreferrer"
                  className="text-md md:text-lg bg-primary-button rounded-lg px-4 py-2 text-neutral-50"
                >
                  Resume
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
      </div>
    </div>
  );
}
