---
title: "Continuous Discovery"
url: https://www.svpg.com/continuous-discovery/
date: 2012-10-24
author: Marty Cagan
category: Product Discovery
tags: [continuous-delivery, continuous-discovery, product-discovery]
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

# Continuous Discovery

I have written recently about how product teams do [product discovery in parallel with product delivery](https://svpg.com/dual-track-agile/). I have also written about how teams sometimes like to [time-box their product discovery](https://svpg.com/time-boxing-product-discovery/) work.

What I’d like to write about in this article is an increasing trend I am seeing towards both continuous delivery and continuous discovery.

Continuous Delivery is an increasingly popular notion today. The concept has been talked about by many teams for a few years now, but now there are actually quite a few teams really doing it.

Nearly all product teams today do continuous build. The principle here is that if there are build problems, it is really good to find them sooner rather than later, so typically builds are initiated the moment changes are committed.

Many product teams have taken this principle to the next step and have learned that integration problems are time consuming, and that by integrating early and often (rather than a “phase” before testing), they can significantly speed up their overall throughput by minimizing the time that they are working in isolation.

Similarly, instead of testing everything in a phase at the end of a release cycle (even a 2-week release cycle) and finding all the problems at once, it is much better to run automated regression test suites continuously to find newly introduced issues as soon as possible (which significantly reduces the possible sources of the issue and hence the time to correct).

Quite a few teams now are taking this principle to its logical conclusion and releasing continuously (known as continuous deployment). This means that each logical change (or sometimes groups of changes) are released in small “micro-releases” as soon as they are ready. There are a couple pretty significant benefits to this. The first is that this is the ultimate form of an incremental release strategy which is our key mechanism for [gentle deployment](https://svpg.com/gentle-deployment/) – good for our customers and good for us. The second is that detecting and correcting issues in production is much easier when you are just changing one thing, or a small number of things, at a time.

However, everything I’ve described thus far has to do with product delivery. What about product discovery?

I have long argued for exactly the same principle in terms of how we come up with product backlog items. Rather than a “Product Discovery Phase” where we come up with several weeks of validated product backlog items and deliver them to engineering, I encourage teams to do continuous product discovery – where we are constantly identifying, validating and describing new product backlog items. Some discovery work takes a few hours and other things can take longer, but it is an ongoing process of ideation, validation and description.

In the dual-track analogy, the discovery track is continuously generating product backlog items, and the delivery track is continuously building, testing and deploying these items.

With the continuous discovery and delivery trends, many teams are finding that Scrum as a process can be limiting, and that [Kanban](https://en.wikipedia.org/wiki/Kanban_(development)) tends to fit this continuous discovery and delivery model better.

Even short of moving to Kanban, I have found many Scrum teams that have adapted Scrum in a Kanban direction for exactly this reason. The most common adaptation is that rather than releasing at the end of each time-boxed two-week sprint, they just release features and other changes as they are ready – often doing many micro-releases per week. In this case, they are mainly using the time-boxing of Scrum as a way to structure work and encourage a frequent retrospective.

In general, moving to continuous discovery and continuous delivery is a really good thing and many of the best teams I know are doing this. However, as with everything else, there are trade-offs. In the next articles I will talk about the impact of continuous discovery on release planning, and the impact of continuous delivery on product marketing.
