"use client";

import Image from "next/image";

interface SuccessCase {
  image: string;
  quote: string;
  owner: string;
  store: string;
  city: string;
}

// ponytail: seção oculta até o cliente confirmar casos reais e autorizados. Preencher para publicar.
const successCases: SuccessCase[] = [];

const SuccessCases = () => {
  if (successCases.length === 0) return null;

  return (
    <section id="casos" className="scroll-mt-24 py-16 md:py-24 bg-[#FFFDF6]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-tomato text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1B1B1B] tracking-tight mb-4">
            Açougues que já usam o VersaDelivery
          </h2>
          <p className="text-lg text-[#474747] max-w-2xl mx-auto">
            Veja como o Versa funciona na prática, com experiências reais de
            quem utiliza a plataforma.
          </p>
        </div>

        <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
          {successCases.map((item) => (
            <figure
              key={`${item.store}-${item.owner}`}
              className="snap-start shrink-0 w-[85%] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] bg-white rounded-2xl overflow-hidden"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={item.image}
                  alt={item.store}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 85vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="p-6">
                <blockquote className="text-[#1B1B1B] mb-4 leading-relaxed">
                  “{item.quote}”
                </blockquote>
                <p className="text-sm text-[#474747]">
                  <span className="font-semibold">{item.owner}</span> ·{" "}
                  {item.store} · {item.city}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SuccessCases;
