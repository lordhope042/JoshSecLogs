"use client";

import CountUp from "react-countup";

const stats = [
  {
    number: 180,
    suffix: "+",
    title: "Countries",
  },
  {
    number: 500,
    suffix: "+",
    title: "Supported Services",
  },
  {
    number: 2800000,
    suffix: "+",
    title: "SMS Delivered",
  },
  {
    number: 48000,
    suffix: "+",
    title: "Happy Users",
  },
];

export default function Stats() {
  return (
    <section className="relative bg-gray-50 dark:bg-[#070b17] py-20">
      <div className="mx-auto max-w-7xl px-6">

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {stats.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-orange-500/10 bg-white dark:bg-[#111827] p-10 transition duration-300 hover:-translate-y-2 hover:border-orange-500/40 hover:shadow-[0_0_40px_rgba(249,115,22,0.25)]"
            >
              <h2 className="text-5xl font-black text-orange-500">
                <CountUp
                  end={item.number}
                  duration={3}
                  separator=","
                />
                {item.suffix}
              </h2>

              <p className="mt-4 text-lg text-gray-700 dark:text-zinc-300">
                {item.title}
              </p>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}