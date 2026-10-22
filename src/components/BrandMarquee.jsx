import MarqueeModule from "react-fast-marquee";

const Marquee = MarqueeModule.default ?? Marquee;

const brandImages = import.meta.glob(
  "../assets/brand/*.{png,jpg,jpeg,svg,webp}",
  {
    eager: true,
    query: "?url",
    import: "default",
  }
);

const getBrandImage = (filename) => {
  const path = Object.keys(brandImages).find((itemPath) =>
    itemPath.endsWith(`/${filename}`)
  );

  return path ? brandImages[path] : "";
};

const brands = [
  { name: "Nike", logo: getBrandImage("tt.png") },
  { name: "Adidas", logo: getBrandImage("cc.png") },
  { name: "Gucci", logo: getBrandImage("clo.png") },
  { name: "Louis Vuitton", logo: getBrandImage("fb.png") },
  { name: "Zara", logo: getBrandImage("bt2.png") },
  { name: "Independent", logo: getBrandImage("id.png") },
  { name: "Tailors", logo: getBrandImage("tt.png") },
  { name: "Clothing brands", logo: getBrandImage("cb.png") },
  { name: "Dior", logo: getBrandImage("bt.png") },
  { name: "Puma", logo: getBrandImage("fs.png") },
  { name: "Northern", logo: getBrandImage("nl.png") },
  { name: "Orange Culture", logo: getBrandImage("mm.png") },
  { name: "Online vendors", logo: getBrandImage("ol.png") },
];

export default function BrandMarquee() {
  return (
    <section className="overflow-x-hidden bg-white py-12 text-slate-900 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[24px] font-bold text-[#241065] sm:text-[28px]">
            Designed for Fashion. Built for Fit.
          </h2>
          <p className="mt-3 text-sm font-medium text-[#6B7280] sm:text-base">
            From independent tailors to growing fashion brands, TrendySize
            makes measurements simple, digital, and effortless.
          </p>
        </div>

        <div className="mt-10">
          <Marquee
            speed={55}
            pauseOnHover
            autoFill
            gradient
            gradientColor={[255, 255, 255]}
            gradientWidth={80}
          >
            {brands.map((brand) => (
              <div
                key={brand.name}
                className="mx-3 flex h-28 w-36 shrink-0 items-center justify-center sm:mx-5 sm:h-32 sm:w-44"
              >
                <img
                  src={brand.logo}
                  alt={brand.name}
                  loading="lazy"
                  decoding="async"
                  className="h-24 w-auto max-w-[190px] object-contain transition duration-300 hover:scale-110 grayscale hover:grayscale-0"
                />
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
