"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    name: "John David",
    role: "Software Developer",
    image: "/images/users/user1.jpg",
    review:
      "JoshSecLogs has become my go-to platform for SMS verification. The delivery speed is amazing and the API is easy to integrate.",
  },
  {
    name: "Aisha Bello",
    role: "Digital Marketer",
    image: "/images/users/user2.jpg",
    review:
      "I've used many virtual number providers, but this is by far the fastest and most reliable. Highly recommended.",
  },
  {
    name: "Michael James",
    role: "Business Owner",
    image: "/images/users/user3.jpg",
    review:
      "Excellent pricing, premium support and thousands of available numbers. Exactly what my business needed.",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#08111d] py-28">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">

          <span className="uppercase tracking-[5px] font-semibold text-orange-500">
            Testimonials
          </span>

          <h2 className="mt-4 text-5xl font-black text-white">
            What Our Customers Say
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-zinc-400">
            Thousands of customers trust JoshSecLogs every day.
          </p>

        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * .2 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-orange-500/10 bg-[#111827] p-8 transition hover:-translate-y-2 hover:border-orange-500 hover:shadow-[0_0_40px_rgba(249,115,22,.25)]"
            >
              <div className="flex">

                {[1,2,3,4,5].map((star)=>(
                  <Star
                    key={star}
                    size={18}
                    className="fill-orange-500 text-orange-500"
                  />
                ))}

              </div>

              <p className="mt-6 leading-8 text-zinc-300">
                "{item.review}"
              </p>

              <div className="mt-8 flex items-center gap-4">

                <Image
                  src={item.image}
                  width={60}
                  height={60}
                  alt={item.name}
                  className="rounded-full border-2 border-orange-500 object-cover"
                />

                <div>

                  <h3 className="font-bold text-white">
                    {item.name}
                  </h3>

                  <p className="text-sm text-orange-400">
                    {item.role}
                  </p>

                </div>

              </div>

            </motion.div>
          ))}

        </div>

      </div>
    </section>
  );
}