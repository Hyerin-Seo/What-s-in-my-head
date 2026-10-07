---
title: "Discovery vs. Delivery"
url: https://www.svpg.com/discovery-vs-delivery/
date: 2015-10-22
author: Marty Cagan
category: Product Discovery
tags: [a, agile, dual-track, product-delivery, product-discovery]
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

# Discovery vs. Delivery

Most of us are working on solving some pretty hard problems, and it usually ends up taking some fairly complex systems in order to power these solutions. As such, for most teams there are two very significant challenges to tackle:

First, discovering, in detail, what the customer solution needs to be. That includes everything from making sure there’s enough customers that even need this solution (the demand) and then coming up with a solution that works for our customers and our own company. Even harder, we need to make sure we come up with a single solution that works for many customers, and not a series of specials. In order to do this, we need to learn fast.

Second, we need to ensure we deliver a robust and scalable implementation that our customers can depend on for consistently reliable value. Your team needs to be able to release with confidence. While we never have 100% confidence, you should not have to “release and pray.”

So we need to simultaneously learn fast and also release with confidence.

It’s understandable that many teams might naturally view these two difficult goals as at odds with each other. We are in a big hurry to push something out there in order to learn what works and what doesn’t; yet we don’t want to release something that’s not ready for prime time, and risk hurting our customers and damaging our brand.

I spend a lot of my time visiting with product teams, and I have on occasion been called out for pushing hard one minute for the team to be much more aggressive in getting out to customers and getting early feedback on their ideas, and then just minutes later pushing that same team hard not to compromise their standards on releasing scalable, fault-tolerant, reliable, high-performance, secure software.

You might also recognize this problem in another guise. Many teams get into a lot of grief with the concept of a Minimal Viable Product (MVP) because on the one hand we are very motivated to get this out in front of customers fast to get feedback and learn, and on the other hand when we do get out there fast, people feel like this so-called “product” is an embarrassment to the brand and the company, and how could we possibly consider “launching” this?

In this article I want to clarify how strong teams work in order to meet these dual and simultaneous objectives of rapid learning in discovery, yet delivering stable and solid releases.

In general I find that most product teams have a much better sense of how to accomplish the second goal of delivering solid software, than how to accomplish the first goal of rapid experimentation and discovery. Continuous delivery is a good example of an advanced delivery technique that I find in teams that understand the importance of a series of small, incremental changes to a complex system.

Part of what causes confusion is a dilution of what is really meant when we call something a “product” or “product-quality” or “productized” or “live in production.” I always try hard to reserve this use of the product term to describe the state where we can actually run a business on this. Specifically, it is scalable and performant to the degree necessary. It has a strong suite of regression tests. It is instrumented to collect the necessary analytics. It has been internationalized and localized where appropriate. It’s maintainable. It is consistent with the brand promise. And most importantly it is something the team can release with confidence.

This is not easy. It’s where most of the time goes when our engineers are building. As such, we try very hard not to waste this effort.

Doing all this work when the product manager isn’t even sure this is the solution the customer wants or needs is a recipe for big waste.

So the purpose of product discovery is to make sure we have some evidence that when we ask the engineers to build production-quality software, it won’t be a wasted effort.

And this is why we have so many different techniques in product discovery. We’ve got techniques for getting much deeper understanding of our users and customers, and for validating product ideas both qualitatively and quantitatively. And in fact the majority of the techniques don’t even require the developer’s time (which is important because we appreciate how much time and effort needs to go into creating production quality software).

Much of the key to effective product discovery is getting access to our customers without trying to just push our quick experiments into production.

If you are an early stage startup and you have no customers, then of course this is not really an issue (and it may be premature to even be creating production-quality software).

But for most of us, we have real customers and real revenue so we do have to care about this. I wrote about many of the most important techniques to do this rapid experimentation in a responsible way in [Product Discovery in Established Companies](https://svpg.com/product-discovery-in-established-companies/).

Many of our techniques boil down to inviting a set of our customers or prospective customers to “opt-in” (in one form or another) to test our new product ideas. A customer development program is a great vehicle for this. These people have essentially volunteered to be willing test subjects. We might spend some time talking to them in person and observing them trying out our product ideas, or we might let them run our experimental versions (usually a live-data prototype) for a while and then look at the data they generate.

But here’s the key. If you want to discover great products, it really is essential that you get your ideas in front of real users and customers early and often. If you want to deliver great products, you want to use best practices for engineering, and not try to override the engineer’s concerns.

If we want to move fast and discover quickly, we use discovery techniques and opt-in customers. Once we have collected some evidence that we know the solution we need to build, we allow our engineers to build the “production-quality” software as they see fit to the point where they can release with confidence.
