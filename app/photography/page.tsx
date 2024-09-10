import { ChevronRight } from "@/components/icons/ChevronRight";
import { ImageContainer } from "@/components/photography/ImageContainer";
import Sidebar from "@/components/photography/Sidebar";
import { S3Object } from "@/types";

export default async function Photography() {
  const retrieveImages = async () => {
    const imagesUrls: S3Object[] = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/api/photography`,
      { next: { revalidate: 3600 } }
    )
      .then((res) =>
        res
          .json()
          .then((data: any[]) =>
            data.map((d) => new S3Object(d.url, d.metadata))
          )
      )
      .catch((err) => {
        console.error(err);
        return [];
      });

    imagesUrls.sort((a, b) => {
      if(!a.metadata.DateTimeOriginal || !b.metadata.DateTimeOriginal) return 0;
      return (
        Number(new Date(b.metadata.DateTimeOriginal)) -
        Number(new Date(a.metadata.DateTimeOriginal))
      );
    });

    return imagesUrls;
  };

  const imagesUrls = await retrieveImages();

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
        {imagesUrls.map((image, index) => {
          return (
            <ImageContainer key={`${index}-${image.url}`} s3Object={image} />
          );
        })}
      </div>
    </main>
  );
}
