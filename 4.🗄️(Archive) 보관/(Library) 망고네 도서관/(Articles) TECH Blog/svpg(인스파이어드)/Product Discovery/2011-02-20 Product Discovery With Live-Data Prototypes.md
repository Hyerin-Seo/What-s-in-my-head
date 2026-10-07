---
title: "Product Discovery With Live-Data Prototypes"
url: https://www.svpg.com/product-discovery-with-live-data-prototypes/
date: 2011-02-20
author: Marty Cagan
category: Product Discovery
tags: [product-discovery, product-management, prototypes, split-testing]
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

# Product Discovery With Live-Data Prototypes

In my [last article](https://svpg.com/ten-keys-to-product-optimization/) I discussed the keys to product optimization including A/B testing. However, I emphasized that this type of A/B testing is not the same as the A/B testing we do during product discovery. In this article I’d like to talk more about how we utilize live-data prototypes and A/B testing to facilitate product discovery.

The principle objective in product discovery is to discover the smallest possible product that is valuable, usable and feasible, and to do this as fast as possible. This means failing fast. Trying our ideas out on real users and customers, learning and adjusting, and pivoting if necessary. We know we’ll need several iterations to get to where the product actually works for us, so we want to work through those iterations as fast as we can.

We have two primary techniques for failing fast:

– The first is to create a user prototype (disposable software that is meant to simulate what the real software would look like and behave like) and then test that prototype on real users and customers (mostly face-to-face with users from the target market).

– The second is to quickly create real code to test an idea with live data (we call that a “live-data prototype”) and then test this software by running a percentage of our traffic to this new version and compare the results (called an A/B test or split test).

These techniques are not mutually exclusive (you can find both of these techniques used at most of the best tech product companies), but the general principle is to test the hypothesis the fastest and cheapest way possible.

Often that means a user prototype with user testing. We can usually do that in days. The learning is qualitative rather than quantitative, but the insights are usually dramatic. See [Beyond Usability](https://svpg.com/beyond-usability/).

However, as valuable as user prototypes and user testing may be, often you need live data in order to determine if an idea actually works.

Some of my favorite examples of this are when applying game dynamics to e-commerce, search result relevance, many social features, and of course funnel work.

To be clear, creating a live-data prototype is essentially coding. So this means you’re going to need access to developers to create the prototype. At a typical early stage startup, this is usually not a big problem. After all, there is not usually a legacy system to keep running with a long backlog to work through. Unfortunately, at more established companies, it can be hard to get sufficient time from the developers to build and deploy a live-data prototype.

The live-data prototype is typically substantially smaller than the eventual product. For example, the bar is typically lower in terms of quality, performance and functionality. It needs to run enough to get validated learning, but typically there is more work to be done before you’d roll it out widely. A good example would be internationalization and localization work. You can usually test your idea in a single geography with a single language and payment system, and if things go well, you can do the additional engineering needed for a wide-scale rollout.

One of the advantages of user prototypes is that they are usually created by the designers so the dependency on actual developer time is limited to their time to review each prototype iteration for both feasibility and also to contribute ideas and insights.

Another disadvantage is that building a live-data prototype can take more time than a user prototype. However, the stack that developers have to build on is getting better all the time, and there are technologies and frameworks that can make even a one or two developer team extremely productive, in the best cases reducing cycles down to a few days. Note that you do need to be extra careful not to fall into the trap of taking too long to get the idea in front of real users and [falling in love](https://svpg.com/the-two-week-rule/).

That said, there are important advantages to live-data prototypes. The data generated is unrivaled for learning how the product idea performs in the wild. And of course, if the test does go well, you are well on your way to deploying the software for real.

So far we’ve been talking mostly about the startup context. In the case of a startup, it’s usually not very hard to convince the leaders and investors of the need for product discovery. They understand that it’s essentially a race against the clock (until the money runs out) to see if you can come up with something that could fuel a business.

However, in the case of a more established company, you typically already have products that are fueling the business, so the reasons for discovery are a little more subtle.

At established companies, product discovery, with both user and live-data prototypes, is about reducing the risk and cost of innovation. Reducing risk in case the idea doesn’t actually work, or in case it might hurt the brand, or in case it might cannibalize existing business. Reducing cost because building, deploying, and supporting is expensive in time and money.

Without effective ways to reduce this risk and cost, many organizations consider the risk as not worth the possibility of a reward (If the reward were a sure thing, more might take the risk, but given that it’s not a sure thing, the risk and time make the necessary experiments expensive and unlikely.)

So whether with user prototypes or live-data prototypes, our goal in enabling product discovery is to dramatically reduce the time, costs and risk necessary for rapid experimentation and failing fast.

Notes on Split Testing:

– As I mentioned in the previous article, there are many tools out today to enable A/B testing, however they are typically appropriate for the optimization work and not usually for the type of testing we do in product discovery. This is because the ideas we are testing are typically not incremental changes to surface level pages, but substantially different from the front to the back. Fortunately, enabling an A/B test during product discovery is not really that hard. This [Eric Ries article](http://www.startuplessonslearned.com/2008/09/one-line-split-test-or-how-to-ab-all.html)does a good job describing a useful approach.

– Yet another use of Split Testing is as a [gentle deployment](https://svpg.com/gentle-deployment/) mechanism.
