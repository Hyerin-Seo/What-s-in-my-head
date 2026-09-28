---
title: "Autonomy vs. Ownership"
url: https://www.svpg.com/autonomy-vs-ownership/
date: 2015-04-14
author: Marty Cagan
category: Product
tags: [dedicated-product-teams]
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

# Autonomy vs. Ownership

In my recent articles I have been exploring the critically important but complex topic of autonomy of product teams. First we discussed the trade-offs between [autonomy and leverage](https://svpg.com/autonomy-vs-leverage/), and then we discussed the trade-offs between [autonomy and mission](https://svpg.com/autonomy-vs-mission/). From your feedback I know this is a subject that is important to many of you, and I realized there was one more dimension to this discussion that I should also put out there, and that has to do with the trade-offs between autonomy and the concept of ownership, especially code ownership.

What most companies do when they first move from very small startup with effectively one team, to dedicated product teams, is that they slice up the code base. In other words, let’s say your company provides a vertical marketplace with drivers on one side, and riders on the other. You might have a drivers team that “owns” the driver’s app and all the code relating to services for the drivers, and a riders team responsible for the riders app and all the services for riders. Let’s say you also decide to have a third team that’s responsible for the common services used by both riders and drivers (things like authentication, location services, mapping services, and payment management). That’s just one way to slice things up, but it’s actually a pretty common way.

For the most part, things for each team feel like they’re a small startup again. If the drivers team wants to add some new level of driver screening, or a cool feature to help drivers visualize how much money they’re making, they just do that.

However, what happens when the drivers team really wants to make a change, but that change at least in part resides in code owned by the riders team, or the common services team? This is where the issues of autonomy versus ownership arise.

First there’s the strategic product question. It’s very possible that what the drivers team wants to do to help recruit lots more drivers, and make drivers happier, may require changes that riders might not like. Dynamic pricing is a real example of this, but things like this come up all the time.

Should the drivers team be able to make changes to the functionality or user experience that the riders team owns? If so, while you’ve increased the autonomy of the drivers team, you have pretty much completely undermined the autonomy of the riders team. This problem and example underscores the importance of the holistic view (discussed as part of [autonomy vs mission](https://svpg.com/autonomy-vs-mission/)). In this case, the head of product needs to consider the full context (the vision, the KPI’s) and make some strategic decisions. I also like [product principles](https://svpg.com/the-product-manifesto/) for helping with these types of product decisions.

But let’s now consider the code ownership question. Let’s say there’s no product or strategic issue. We all love dynamic pricing, and we’re all excited about getting this deployed. There are really two approaches teams use to balance the autonomy and ownership:

**The Dependency Model:**

In this model, the drivers team simply requests the riders team (and possibly the common services team) to make the corresponding changes to their code. Pretty straight forward and not really a problem except in the case where the riders team is really busy with other critically important changes. Suppose they say “we are excited to do this but we won’t be able to get to this for at least a month, as we are working on this huge and critical company objective around rider growth.” For the driver team, having to wait for a month or more on another team sure doesn’t feel very autonomous, or very fast.

**The Open Source Model:**

The alternative model is informally known as the “open source” model although to be clear this is not about open sourcing your code, it’s just called that because this is how much of the open source community operates. In this model, if the drivers team needs a change to the riders team’s code, then they could either wait for the riders team to do it, or they can actually make the change themselves, and then request that the riders team review the change, and include it if they’re okay with it (known as a “pull request”). This means that you are telling the software management system that you’ve made a change to the software, but the owner of that software needs to review the changes before they are actually approved and incorporated.

This model has quite a few benefits. The drivers team feels much more autonomous and can move faster, without compromising the sense of ownership of the riders team. The riders team still controls “their” software, and decides whether something is okay or not.

The main place this open source model isn’t so helpful is when the code is very specialized. Let’s say instead of requesting a change from a drivers team we instead need a change to the payment processing which is part of the core services team. It may take considerable time to come up to speed on the payment technology. Or maybe, because we’re talking money here and that’s often a sensitive area for a company, the team decides that payment changes should only be done by the common services team. Or maybe, if the change was to authentication services, for security reasons only two specific developers are authorized to even access that source code. In these types of cases, we’re usually back to the dependency model.

I personally like the open source model a lot, but it does require a relatively high level of skill from your developers.

In any case, as you set up dedicated product teams, you can and should consider and discuss the concept of ownership, both at the product level and the code level. Decide what areas of the code base are available for the open source model and which are not. Just be transparent about your reasoning and the teams will usually understand.
