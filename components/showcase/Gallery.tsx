import Image from "next/image";

export function Gallery({ images, businessName }: { images: string[]; businessName: string }) {
  if (!images.length) return null;

  const featured = images[0];
  const rest = images.slice(1, 5);

  return (
    <section className="container-app py-12 sm:py-16">
      <h2 className="mb-6 text-2xl font-black text-emerald-950 sm:text-3xl">Vitrin Görselleri</h2>
      <div className="grid gap-3 sm:gap-4 md:grid-cols-4 md:grid-rows-2">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-md md:col-span-2 md:row-span-2 md:aspect-auto">
          <Image
            src={featured}
            alt={`${businessName} öne çıkan görsel`}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
        {rest.map((src, index) => (
          <div
            key={src}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-md md:aspect-auto"
          >
            <Image
              src={src}
              alt={`${businessName} vitrin görseli ${index + 2}`}
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
