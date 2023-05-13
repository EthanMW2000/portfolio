import Image from "next/image";
export function NavBar() {
  const routes = ["About", "Experience", "Contact"];

  return (
    <div className="flex flex-row w-full justify-between backdrop-blur-md items-center px-4 md:px-8 shadow-md text-primary">
      <a href="#home">
        <Image alt='logo' src='/logo.svg' width={48} height={48} className='my-auto ml-4' />
      </a>
      <div className="flex-1 flex flex-row-reverse w-full h-20">
        {routes.reverse().map((route) => (
          <div className="mx-2 my-auto" key={route}>
            <a
              href={`#${route.toLowerCase()}`}
              className="group transition duration-300 hover:text-primary-button text-lg font-semibold"
            >
              {route}
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-primary-button"></span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
