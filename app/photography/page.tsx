import { ChevronRight } from "@/components/icons/ChevronRight";
import { ImageContainer } from "@/components/photography/ImageContainer";
import Sidebar from "@/components/photography/Sidebar";
import { _Object } from "@aws-sdk/client-s3";


export default async function Photography() {
  // const images:_Object[] = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/photography`).then((res) => res.json());

  return (
    <main>
      <Sidebar />
      <div className="flex flex-col justify-center items-center mt-10">
        <h1 className="text-4xl text-primary">
          My photography showcase is currently being built!
        </h1>
        <h3 className="text-xl text-primary-button mt-10">Check back soon</h3>
        <div className="flex flex-row">
          <a
            href={"/"}
            className="text-md md:text-lg bg-secondary-button rounded-lg pl-4 pr-2 py-2 text-primary flex flex-row justify-center items-center hover:bg-primary-button transition duration-300 ease-in-out"
          >
            Home
            <ChevronRight width={24} height={24} fill="#1b2541" />
          </a>
        </div>
        {/* {images.map((image, index) => {
          return (
            <ImageContainer
              key={index}
              url={`https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${image}`}
            />
          );
        })} */}
      </div>
    </main>
  );
}
