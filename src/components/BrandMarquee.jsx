import MarqueeModule from "react-fast-marquee";

const Marquee = MarqueeModule.default ?? MarqueeModule;

const brands = [
  {
    name: "Nike",
    logo: "https://uxwing.com/wp-content/themes/uxwing/download/brands-and-social-media/nike-icon.png",
  },
  {
    name: "Adidas",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg",
  },
  {
    name: "Gucci",
    logo: "https://th.bing.com/th/id/OIP.D9HPjW2IuHtsV3LnKJiPvwHaHa?r=0&o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    name: "Louis Vuitton",
    logo: "https://images.seeklogo.com/logo-png/8/1/louis-vuitton-logo-png_seeklogo-85807.png",
  },
  {
    name: "Zara",
    logo: "https://staging.svgrepo.com/show/303605/zara-logo.svg",
  },
  {
    name: "Prada",
    logo: "https://tse2.mm.bing.net/th/id/OIP.vaUCZFBCj3uq3tVopjX3dwHaGB?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    name: "Versace",
    logo: "https://th.bing.com/th/id/R.653a3249594afad4fc2308e0b3ed872c?rik=ISdzYfEvlz5OYQ&pid=ImgRaw&r=0",
  },
  {
    name: "Chanel",
    logo: "https://th.bing.com/th/id/R.5b724927e3ca65aa38ffc1a824c1c341?rik=Q0UT1Tr6QUsm5Q&pid=ImgRaw&r=0",
  },
  {
    name: "Dior",
    logo: "https://th.bing.com/th/id/OIP.JYlTa_Eng10wR31kcbbbAAHaGB?r=0&o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    name: "Puma",
    logo: "https://th.bing.com/th/id/OIP.0z2kSI_ehJizOeLLUL77dQHaEK?r=0&o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    name: "Burberry",
    logo: "https://th.bing.com/th/id/R.a204ae2b19ff675ccea3773b9ee639d1?rik=BNBLTI19jY3SRQ&pid=ImgRaw&r=0",
  },
  {
    name: "Orange Culture",
    logo: "https://orangeculture.com.ng/cdn/shop/files/Orange_logo.png?v=1684261509&width=500",
  },
  {
    name: "Tubo",
    logo: "https://tubowoman.com/cdn/shop/files/TUBO_logo-new_180x.png?v=1718633250",
  },
];

const BrandMarquee = () => {
  return (
    <section className="overflow-x-hidden bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        <h2 className="mb-8 text-center text-[24px] font-bold text-[#241065] dark:text-white sm:mb-12 sm:text-[28px]">
          Trusted by Fashion Brands Worldwide
        </h2>

        <Marquee speed={65} pauseOnHover autoFill gradient gradientColor={[255, 255, 255]} gradientWidth={120}>
          {brands.map((brand, index) => (
            <div key={index} className="mx-6 flex h-20 w-32 items-center justify-center sm:mx-10 sm:h-24 sm:w-44">
              <img src={brand.logo} alt={brand.name} className="max-h-12 max-w-[110px] object-contain transition duration-300 hover:scale-110 grayscale hover:grayscale-0" />
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
};

export default BrandMarquee;