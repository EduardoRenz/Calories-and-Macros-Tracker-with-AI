'use client';

import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { ChevronDownIcon } from '../icons';

export const LandingFAQ: React.FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems = [
    {
      question: t('landing.faq.q1'),
      answer: t('landing.faq.a1'),
    },
    {
      question: t('landing.faq.q2'),
      answer: t('landing.faq.a2'),
    },
    {
      question: t('landing.faq.q3'),
      answer: t('landing.faq.a3'),
    },
    {
      question: t('landing.faq.q4'),
      answer: t('landing.faq.a4'),
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="py-24 bg-surface relative overflow-hidden" id="faq">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-secondary font-label font-bold tracking-wider uppercase text-sm mb-2 block">
            {t('landing.faq.badge')}
          </span>
          <h2 className="text-3xl md:text-4xl font-headline-landing font-bold text-primary mb-4">
            {t('landing.faq.title')}
          </h2>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            {t('landing.faq.subtitle')}
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const questionId = `faq-question-${index}`;
            const answerId = `faq-answer-${index}`;

            return (
              <div
                key={index}
                data-testid="faq-item"
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-surface-container-lowest border-primary/40 shadow-sm'
                    : 'bg-surface-container-lowest/50 border-outline-variant/30 hover:border-outline-variant'
                }`}
              >
                <button
                  type="button"
                  id={questionId}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                >
                  <span className="font-headline-landing font-semibold text-lg text-on-surface">
                    {item.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                      isOpen
                        ? 'bg-primary/10 text-primary rotate-180'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    <ChevronDownIcon className="w-5 h-5 transition-transform duration-200" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={answerId}
                    role="region"
                    aria-labelledby={questionId}
                    className="px-6 pb-6 pt-1 text-on-surface-variant leading-relaxed border-t border-outline-variant/10"
                  >
                    <p>{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
