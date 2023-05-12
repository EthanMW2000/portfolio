import Image from "next/image";
export function NavBar() {
  const routes = ["About", "Experience", "Contact"];

  return (
    <div className="flex flex-row w-full justify-between bg-gray-500 items-center px-8">
      <a href="#home">
        {/*<Image alt='logo' src='/logo.svg' width={64} height={64} className='my-auto ml-4' />*/}
      </a>
      <div className="flex-1 flex flex-row-reverse w-full h-20">
        {routes.reverse().map((route) => (
          <div className="mx-2 my-auto" key={route}>
            <a
              href={`#${route.toLowerCase()}`}
              className="group transition duration-300 hover:text-gray-400 text-lg font-semibold text-white"
            >
              {route}
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-gray-400"></span>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
