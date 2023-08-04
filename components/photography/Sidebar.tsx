import Image from "next/image";

export default function Sidebar() {
  return (
    <div className="fixed top-0 left-0 h-screen w-14 bg-secondary border-2 border-[#d4d4cf] z-10 hover:w-52">
      <div className="flex flex-col h-full p-2">
        <a href="/">
          <Image
            alt="logo"
            src="/logo.svg"
            width={36}
            height={36}
            className="my-auto"
          />
        </a>
      </div>
    </div>
  );
}
