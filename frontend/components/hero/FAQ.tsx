"use client";

import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is a virtual phone number?",
    answer:
      "A virtual phone number allows you to receive SMS verification codes online without using your personal SIM card.",
  },
  {
    question: "How quickly will I receive my SMS?",
    answer:
      "Most SMS messages arrive within a few seconds after the service sends the verification code.",
  },
  {
    question: "Which countries are supported?",
    answer:
      "JoshSecLogs supports numbers from more than 180 countries with thousands of available services.",
  },
  {
    question: "Which payment methods do you accept?",
    answer:
      "You can fund your wallet using Paystack, bank transfer, and other supported payment methods.",
  },
  {
    question: "Do you provide API access?",
    answer:
      "Yes. Developers can integrate directly with our REST API to automate virtual number purchases and SMS retrieval.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "If an order fails before a number is successfully assigned, the amount is automatically returned to your wallet.",
  },
];

export default function FAQ() {
  return (
    <section className="bg-white dark:bg-[#050816] py-28">
      <div className="mx-auto max-w-5xl px-6">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="uppercase tracking-[5px] font-semibold text-orange-500">
            Frequently Asked Questions
          </span>

          <h2 className="mt-4 text-5xl font-black text-gray-900 dark:text-white">
            Have Questions?
          </h2>

          <p className="mt-6 text-gray-500 dark:text-zinc-400">
            Everything you need to know before using JoshSecLogs.
          </p>
        </motion.div>

        <div className="mt-16 rounded-3xl border border-orange-500/10 bg-white dark:bg-[#111827] p-8">

          <Accordion type="single" collapsible className="space-y-5">

            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl border border-orange-500/10 px-5"
              >
                <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 dark:text-white hover:text-orange-500">
                  {faq.question}
                </AccordionTrigger>

                <AccordionContent className="text-gray-500 dark:text-zinc-400 leading-8">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}

          </Accordion>

        </div>

      </div>
    </section>
  );
}