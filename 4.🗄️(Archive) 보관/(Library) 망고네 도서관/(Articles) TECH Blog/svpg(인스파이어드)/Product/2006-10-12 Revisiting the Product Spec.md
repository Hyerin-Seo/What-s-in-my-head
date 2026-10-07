---
title: "Revisiting the Product Spec"
url: https://www.svpg.com/revisiting-the-product-spec/
date: 2006-10-12
author: Marty Cagan
category: Product
tags: [high-fidelity-prototype, prd, spec]
source: SVPG (svpg.com)
유형: 자료
구역: 4.archive
분류:
  - (Library) 망고네 도서관
주제:
상태:
요약:
작성일: 2026-09-23
마감:
커버:
상위: "[[📖 SVPG(인스파이어드)]]"
링크:
담당:
작성자:
---

# Revisiting the Product Spec

I think the product spec is long overdue for a renovation. Some would argue that Agile methods accomplish this by doing away with the spec altogether. I’ve written about some of the issues and limitations of Agile methods elsewhere, but in many respects I think they were on the right track.

But before we get ahead of ourselves, let’s start by discussing the problem to be solved.

There is of course tremendous range among product specs, starting with what we call them (Product Requirements/PRD’s, Market Requirements/MRD’s, Business Requirements/BRD’s, Functional Specs/FSD, and more). The topics covered can vary greatly (these different documents were not intended to serve the same purposes, but over time they have merged and morphed and lost many of their original distinctions), the level of detail, and of course the quality of the spec itself. Even the form varies greatly – many use MS Word docs, but some use spreadsheets, some post the spec on a Wiki site, and others use one of the commercial requirements management tools.

I have seen a few truly good product specs, but much more often than not, most specs take too long to write, they are seldom read, they don’t provide the necessary detail, address the difficult questions, or contain the critical information they need to, and most importantly, it is all too easy for the mere existence of the spec to serve as a false indicator to management and the product team that everything is proceeding just fine.

If you agree with me that the central responsibility of the product manager is to make sure that you deliver to the engineering team a product spec that describes a product that will be successful, then we have to acknowledge the weaknesses in the typical spec process and take a hard look at how products are defined.

Here are what I consider the requirements for a good and useful product spec:

– the spec must describe the full user experience – not just the product requirements but also the user interaction and visual design. By now hopefully everyone recognizes how closely intertwined the requirements are with the design.

– the spec must accurately represent the behavior of the software – and we need to acknowledge that words and pretty pictures are just too limited in their ability to describe this behavior.

– there are several critical consumers of the spec – engineering, QA, customer service, marketing, site operations, sales; as such, the spec needs to communicate the behavior of the product in a way that all of these groups get what they need.

– the spec will change – the rate of change should slow down dramatically once engineering gets started, but there will be decisions and issues that arise, and the spec should change to reflect the very latest decisions.

– there are a number of artifacts in the creation of a spec, such as lists of prioritized requirements, wireframes, and mock-ups, but there needs to be a single master representation of the spec, to minimize confusion, ambiguity and versionitis.

In my mind, there’s only one form of spec that can deliver on these requirements, and that is the high-fidelity prototype.

The term “high-fidelity” refers to the fact that this should be a realistic representation of the proposed user experience. Except for the most trivial of user interfaces, I am not a fan of so-called “paper prototypes.” With the tools available today, it is now so quick, easy and inexpensive to create a high-fidelity prototype for most products that there is no reason not to do so. This is still a prototype, so it’s fine to fake (simulate) the back end processing and data, so long as the user experience is plausible.

Over the past few years, my own thinking has evolved here from just prototyping a few critical components of the user experience, to now I advocate prototyping virtually everything – all pages/screens, and all the major use cases. There will still be some error conditions and corner cases that don’t pay to prototype, but the benefits of having a high-fidelity representation of the product that the full product team can interact with to understand the product to be built are so great that they dwarf the incremental costs.

It is true that you will still need to supplement the prototype, as there are aspects of the proposed product’s behavior that are not easily represented in a prototype, such as the release requirements (e.g. reliability, performance, scalability) or platform delivery requirements (such as installation requirements, or the list of browser versions to be supported). Also useful as a supplement are use cases, describing the most important flows through the product.

There is still the question of how to best represent this supplementary material. What I really want is to annotate the prototype, but until that technology is readily available, I prefer using a Wiki or other form of Intranet site. The biggest reason is that everyone on the product team knows where to find the latest answers at any time, rather than having various random versions of documents floating around. It is also easy to post Q&A;’s, set up automatic e-mail notifications whenever the spec is updated, and track the history of decisions.

But the majority of the product spec should be the high-fidelity prototype, representing the functional requirements, the information architecture, the interaction design, and the visual design of the user experience.

In addition to meeting the requirements described above, the most important benefit in my view is that unlike a paper document, a high-fidelity prototype can be tested. You can put it in front of actual target users and ensure that they can figure out how to use your product (usability), and also determine if they care to use your product (desirability). You don’t actually have a spec worth handing over to engineering until your prototype passes these two tests. Doing this form of testing while you are in QA or Beta is far too late in the process.

I can promise you that if you give this a try, and create a high-fidelity prototype of the proposed functionality and user experience, then your product team will absolutely love this. Engineers are the immediate winners as they finally get a spec that effectively and unambiguously describes the product they need to build, and that they can refer to at any time when they’re confused about how something is supposed to behave. The job of QA is similarly easier as they now know what should happen when they test the actual product. Marketing, sales, and customer support will love being able to learn the product much earlier in the cycle. You’ll also find that your execs will love it too as they can describe what you’re doing (and demo the prototype) to investors, board members, and partners much more effectively than any PowerPoint deck can do.

But wait, there’s more.

The biggest surprise for most teams is that creating a spec this way will typically significantly reduce time to market. Yep. I realize this may sound counter-intuitive, but to understand why the total time to market is faster, you have to look a little deeper at what almost always happens in a software project. Because the typical spec is so poor (incomplete, ambiguous, and especially untested), and so few of the hard questions and critical details are actually addressed and resolved, it is during the engineering phase that the team is forced to tackle these issues, and either there is tremendous churn (the specs keep changing resulting in delays and frustration in engineering) or the engineers just make assumptions as best they can, and the product that ships is a mess and one or more update releases are required before you actually get something useful to your customers. In either case, the time to market is longer than it should be.

So I truly hope on your next product you’ll try this out. Rather than spend weeks working on a 50-page Word document that few will read and is impossible to test, work with your designer to create a prototype of the product you are proposing. Then show that prototype to target users, as well as your product team. You’ll end up iterating several times (better now than after engineering spends months building a bad product!), but when you get the recipe right, use that prototype as the basis for the spec you deliver to engineering and see what happens.
