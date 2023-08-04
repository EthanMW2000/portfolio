import { ChevronRight } from "../icons/ChevronRight";
import { EmailIcon } from "../icons/EmailIcon";
import { GithubIcon } from "../icons/GithubIcon";
import { LinkedInIcon } from "../icons/LinkedInIcon";

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
              <EmailIcon />
              <LinkedInIcon />
              <GithubIcon />
            </div>
            <div className="flex flex-row justify-center gap-4">
              <div className="flex flex-row justify-center">
                <a
                  href={"Wells-Ethan.pdf"}
                  target={"_blank"}
                  rel="noreferrer"
                  className="text-md md:text-lg bg-primary-button rounded-lg px-4 py-2 text-neutral-50 transition duration-300 ease-in-out hover:bg-secondary-button"
                >
                  Resume
                </a>
              </div>
              <div className="flex flex-row">
                <a
                  href={"/photography"}
                  className="text-md md:text-lg bg-secondary-button rounded-lg pl-4 pr-2 py-2 text-primary flex flex-row justify-center items-center hover:bg-primary-button transition duration-300 ease-in-out"
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
