---
title: "Gentle Deployment"
url: https://www.svpg.com/gentle-deployment/
date: 2006-02-15
author: Marty Cagan
category: Product Development
tags: [customer-impact, gentle-deployment, product-development-process, project-management]
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

# Gentle Deployment

One of the fun things about working on a 1.0 product is that you get to start fresh with your community of users. It’s true that your user base is still influenced by other products and services that they’ve been exposed to, but overall you don’t have to worry much about things like backwards compatibility or retraining your users. However, for most of us, we’re in the business of creating updates or new versions of existing products or services.

In the past, software companies could much more easily get away with sending out largely incompatible and disruptive updates because while users would gripe, they weren’t as able to influence other potential users around the world, or take their business elsewhere. Today, with the pervasive internet, if you turn out a bad release of your product (and you don’t correct the problems quickly – see the last newsletter on Rapid Response), you’d better brace yourself for some serious community backlash.

For large scale consumer internet services this is an even more serious concern. These sites need to consider community impact in everything they say and do, beginning with software updates. I call the process of deploying changing intelligently and carefully to a large community of users “gentle deployment.”

When I look at PRD’s and designs for new versions of software, it’s always surprising to me how many of the changes are either unnecessarily incompatible at best, or gratuitous at worst. Even if the user base is screaming for a new feature, it doesn’t mean they are looking forward to learning about the actual changes. In general, it is safe to assume that users do not like change, and anything you can do to minimize the impact of the changes on them will be greatly appreciated. So take a fresh look at the changes you’re planning to deploy, and ask yourself if there’s anything you can do to minimize the disruption your updates will make.

It’s also critical to realize that not every user operates on the same time table. Even assuming your community is looking forward to a change, they may not all be able to take the time out to learn the new version at the same time. For many products, especially Web-based services, you will need to provide a window of time where people can access both the new and the old versions.
In the spirit of minimizing the disruption caused by change, there are several techniques that can be useful in deploying changes gently.

First, do everything you can to communicate the changes in advance, through vehicles like newsletters, onsite education, and tutorials. But remember that many people will not have the time or inclination to read what you write, so this technique can only take you so far.

Second, if there is any question about the new version of your product working properly, either due to reliability issues, or scale, or performance, then you need to redouble your QA efforts there to try to ensure that you won’t have to rollback your updates, which compounds the community angst significantly.

Third, if the change is significant, it is important to contain the risk by pursuing some form of gentle deployment – such as parallel, progressive or incremental deployment.

You can do this by deploying a parallel version of your product, and inviting people to “opt-in” and try the new version out when they have the time. Allow those that try to the new version to make it their default if they like it. Once you are confident that the new version is working well, and the majority of your community has converted to using it, you can make it the default and allow customers to “opt-out” and continue to use the old version for a period of time if they don’t have the time to learn the changes immediately. Give these people sufficient notice about when support for the old version will be discontinued. For a significant client or service with a large community, expect this process to take on the order of months. Also expect some heat from your engineering and site operations organizations because it is not easy to support parallel versions.

Another gentle deployment approach is to deploy regionally – try the new version out in a limited area of the country or world, and then expand. Or you can deploy the changes incrementally – introduce the changes in bite size pieces over time.

However you choose to go about it, the key is to be as sensitive as possible to the disruption that your changes will cause. Give people the opportunity to learn the differences when they have the time, and try to minimize the impact of any problems or issues your changes may cause.
