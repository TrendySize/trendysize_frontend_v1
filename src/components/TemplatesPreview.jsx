import { useNavigate } from "react-router-dom";

import menSuit from "../assets/images/suit.webp";
import senator from "../assets/images/senator.webp";
import agbada from "../assets/images/agbada.webp";
import womenGown from "../assets/images/gown.jpg";
import bridal from "../assets/images/wed.webp";
import children from "../assets/images/child.webp";

const templates = [
  {
    id: 1,
    title: "Men's Suit",
    measurements: "20+ Measurements",
    image: menSuit,
  },
  {
    id: 2,
    title: "Senator",
    measurements: "18+ Measurements",
    image: senator,
  },
  {
    id: 3,
    title: "Agbada",
    measurements: "24+ Measurements",
    image: agbada,
  },
  {
    id: 4,
    title: "Women's Gown",
    measurements: "25+ Measurements",
    image: womenGown,
  },
  {
    id: 5,
    title: "Bridal Dress",
    measurements: "30+ Measurements",
    image: bridal,
  },
  {
    id: 6,
    title: "Children's Wear",
    measurements: "15+ Measurements",
    image: children,
  },
];

export default function TemplatesPreview() {
  const navigate = useNavigate();

  return (
    <section className="bg-[#F8F7FF] text-slate-900 dark:bg-slate-950 dark:text-slate-100 py-24">
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="mx-auto max-w-3xl text-center">

          <h2 className="text-5xl font-bold text-[#241065] dark:text-white">
            Professional Measurement Templates
          </h2>

          <p className="mt-6 text-lg leading-8 text-[#6133DA] dark:text-slate-300">
            Start with professionally designed templates for every clothing
            style or create your own custom measurement template in minutes.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {templates.map((template) => (

            <div
              key={template.id}
              className="
              group
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-md
              transition
              duration-300
              hover:-translate-y-2
              hover:border-[#6133DA]
              hover:shadow-2xl
              dark:bg-slate-800
            "
            >

              {/* Image */}

              <div className="overflow-hidden">

                <img
                  src={template.image}
                  alt={template.title}
                  className="
                    h-72
                    w-full
                    object-cover
                    transition
                    duration-500
                    group-hover:scale-105
                  "
                />

              </div>

              {/* Content */}

              <div className="p-6">

                <h3 className="text-2xl font-bold text-[#241065] dark:text-white">
                  {template.title}
                </h3>

                <p className="mt-2 text-[#6133DA] dark:text-slate-300">
                  {template.measurements}
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="
                    mt-6
                    rounded-lg
                    border
                    border-[#6133DA]
                    px-5
                    py-3
                    font-semibold
                    text-[#6133DA]
                    transition
                    hover:bg-[#6133DA]
                    hover:text-white
                    dark:border-slate-600
                    dark:text-slate-200
                    dark:hover:bg-slate-700
                  "
                >
                  View Template →
                </button>

              </div>

            </div>

          ))}

        </div>

        {/* Browse */}

        <div className="mt-20 text-center">

          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="
              inline-flex
              items-center
              justify-center
              rounded-xl
              bg-[#6133DA]
              px-10
              py-4
              text-lg
              font-semibold
              text-white
              transition
              hover:bg-[#4C26C2]
            "
          >
            Browse All Templates
          </button>

        </div>

        {/* CTA Box */}

        <div className="mt-20 rounded-3xl bg-[#EBE9FE] p-12 text-center dark:bg-slate-800">

          <h3 className="text-3xl font-bold text-[#241065] dark:text-white">
            Need a Custom Template?
          </h3>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-[#6133DA]">
            Build unlimited measurement templates for native wear, suits,
            dresses, uniforms, bridal outfits, children's clothing, and more.
          </p>

          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="
              mt-8
              inline-flex
              rounded-xl
              bg-[#6133DA]
              px-10
              py-4
              text-lg
              font-semibold
              text-white
              transition
              hover:bg-[#4C26C2]
            "
          >
            Create Free Account
          </button>

        </div>

      </div>
    </section>
  );
}