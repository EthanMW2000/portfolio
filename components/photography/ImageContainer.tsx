import Image from "next/image"

export function ImageContainer(props: { url: string }) {
  return (
    <div className="w-[300px] h-[200px] drop-shadow-xl rounded-lg bg-gray-500">
      <img src={props.url} width={300} height={200} alt="A photograph" />
      <div className="w-full h-[30px] absolute bottom-0 bg-secondary/80 px-2 flex flex-row items-center">
        <h1 className="text-lg text-primary">Date</h1>
      </div>
    </div>
  );
}
