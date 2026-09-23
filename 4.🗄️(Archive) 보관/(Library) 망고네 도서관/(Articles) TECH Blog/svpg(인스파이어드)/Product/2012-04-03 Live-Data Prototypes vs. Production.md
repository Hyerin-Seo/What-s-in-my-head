---
title: "Live-Data Prototypes vs. Production"
url: https://www.svpg.com/live-data-prototypes-vs-production/
date: 2012-04-03
author: Marty Cagan
category: Product
tags: [minimum-viable-product, product-discovery, prototypes]
source: SVPG (svpg.com)
유형: 책
구역: 4.archive
분류:
  - (Library) 망고네 도서관
주제:
상태:
요약:
작성일: 2026-09-23
마감:
커버:
상위:
링크:
담당:
작성자:
---

# Live-Data Prototypes vs. Production

I have written earlier about the differences between user prototypes (simulations intended to test the user experience), and live-data prototypes (actual code intended to send live traffic to in order to test real behavior). See [https://svpg.com/product-discovery-with-live-data-prototypes/](https://svpg.com/product-discovery-with-live-data-prototypes/)

We use a live-data prototype (usually in the context of an A/B test) to prove something works, and we perform user testing to understand why it doesn’t work, and what we can do to correct.

I’m happy to see so many teams now doing live-data prototypes. However, I often find that teams confuse live-data prototypes with production software. The purpose of this note is to clarify the difference.

First, let’s be clear for those that do not necessarily know what is meant by the term “production software.”

Generally this means that this is software we can run our business on. But specifically this means:

- All of the critical use cases have been implemented and tested
- The necessary level of test automation is in place
- The software has been architected and engineered so that it can work at the necessary scale and performance
- The associated SEO work that may be necessary based on the changes
- If the product is a global product, the software has been internationalized and localized
- Activities like code reviews have been done to ensure that the software is something the team can maintain and stand behind
- The sales, customer support and marketing organizations have been briefed on the differences and trained if necessary

Many non-technical people often wonder why it can take real time to go from something that’s just working to something that can sustain the business, and in large part, these are the reasons. Especially for consumer internet companies operating at scale, these can be very non-trivial activities.

While I would argue that the items in the list above are critically important, I would also argue that most of these items are not necessary for the purposes of a live-data prototype, and in fact work against our pursuit of minimum viable product.

Remember that the general principle of product discovery is to find the fastest, cheapest way to validate our hypothesis. We use a live-data prototype to prove that our idea works. Anything beyond that purpose will very possibly prove to be waste.

Confusion about the difference between a live-data prototype and production can lead to a couple significant problems:

The first issue is that if the team is not very clear that they are building a live-data prototype rather than production, the team often over-engineers their live-data prototypes. This is bad because it hurts our ability to iterate quickly and can lead to significant waste. So we must be very clear with our product team and with the items on the backlog, whether this is normal production software quality work, or whether this is a live-data prototype.

The second issue is that because the live-data prototype is live in the sense that there is something on the site that some people can see and use, others in the company can easily become confused as to its status. Is this something we should be selling? Is it something we should be advertising? Did we even agree to do this? Companies, especially those with direct sales forces, can end up selling something prematurely. Nobody wants to go back to a customer and explain that it was all a big mistake. We must be very clear with the company when something is simply a live-data test, and when it is something we can sell and support.

So clearly there is a big difference between a live-data prototype and production software.

While I don’t want you to think of live-data prototype as anywhere near as expensive to build as production software, I also don’t want you to view it as trivial.

It must work enough to handle the live traffic. It must have enough analytics in place that we can understand how it is being used to measure it’s success. It must run well enough that we’re not causing problems for our customers. As just a rough guide, I find a live-data prototype to be somewhere between 20% and 50% of the work of building production software.

There is one special case I run into occasionally in certain types of companies such as e-commerce. Sometimes the performance of an idea is essential to accurately assessing whether or not the idea actually works. In other words, it might be an otherwise very effective idea, but due to slow performance, the benefits are overshadowed. In this case, some amount of the performance engineering may need to be done during the live-data prototype work in order to ensure a fair test of the idea.

One final note. Remember that if your live-data prototype proves to be a good idea, the team will still need to “productize” the live-data prototype, which means to turn it into production quality software. So you’ll need to plan on that work. The good news is that you’ll have the evidence and confidence that this hard work will not be wasted.
