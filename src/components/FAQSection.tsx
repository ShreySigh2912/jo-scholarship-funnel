import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: "Is the degree recognized?",
    answer: "Yes, JAIN Online is UGC-DEB approved and NAAC A+ rated. The degree is equivalent to regular MBA and recognized by employers, government, and for higher education."
  },
  {
    question: "Can I study while working full-time?",
    answer: "Absolutely! Our program is designed for working professionals with flexible timings, recorded lectures, and weekend doubt sessions. You can study at your own pace."
  },
  {
    question: "Is the scholarship guaranteed?",
    answer: "The ₹25,000 scholarship is merit-based and available for qualified candidates. During your free consultation, our counselor will assess your eligibility and confirm your scholarship status."
  },
  {
    question: "What if I miss the deadline?",
    answer: "Don't worry! While this offer is time-limited, we regularly have scholarship programs. Book your consultation to learn about current and upcoming opportunities."
  },
  {
    question: "What are the specializations available?",
    answer: "We offer MBA in 12+ specializations including Marketing, Finance, HR, Operations, Data Science, Digital Marketing, AI & Machine Learning, and more."
  },
  {
    question: "How do placements work?",
    answer: "We have dedicated placement support with 85% placement rate. Our team helps with resume building, interview preparation, and connects you with 500+ hiring partners."
  },
  {
    question: "What is the program fee post scholarship?",
    answer: "After the ₹25,000 scholarship and 50% admission fee waiver, the total program fee becomes very affordable. Exact details will be shared during your consultation call."
  },
  {
    question: "Who do I contact for help?",
    answer: "Our dedicated student support team is available 24/7. You can reach out via the consultation form, or our counselors will contact you within 24 hours of registration."
  }
];

export default function FAQSection() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Got questions? We've got answers to help you make the right decision.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="border border-border rounded-lg px-6 py-2 bg-card"
            >
              <AccordionTrigger className="text-left hover:no-underline py-4">
                <span className="font-semibold text-primary">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-8">
          <p className="text-sm text-muted-foreground">
            Still have questions? Our counselors are here to help!
          </p>
        </div>
      </div>
    </section>
  );
}