---
title: "Assessing Customer Impact"
url: https://www.svpg.com/assessing-customer-impact/
date: 2012-11-01
author: Marty Cagan
category: Product
tags: [continuous-delivery, gentle-deployment, product-marketing]
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

# Assessing Customer Impact

In my last article I wrote about the trends of [continuous discovery](https://svpg.com/continuous-discovery/) and continuous delivery. At the end of the article I pointed out that while I love these techniques because overall they are much better for our customers, and for our ability to rapidly improve our products, there were a few important consequences that had to be dealt with. In this article I want to take about the impact of continuous delivery on product marketing and our marketing, sales, and service organizations.

First, to be clear, I am talking here about frequent releases – defined as at least every other week, but in the true form of continuous delivery, as many as several “micro-releases” a day.

Please note that I am assuming that your team is consistently releasing no less frequently than once every two weeks. If this is not true, and especially if you are a SaaS company, you really need to fix this immediately in order to remain competitive (see [www.svpg.com/big-bang-releases](https://svpg.com/big-bang-releases/)).

It is easy in an environment with very frequent release vehicles to have something go live to site that catches people by surprise. Maybe by changing how customers use your site for an important task, or the way a sales demo works, or by breaking a work-around provided by customer service, or by any number of other cases. While you can never totally predict and prevent surprises, we want to do what we can to prevent this.

It’s important to note that most of the time, when we make a typical incremental release, there’s nothing in there that will bother anyone. Your customers won’t notice the differences, your sales people won’t know or care, and your customer service people won’t know or care. We’re often changing things in the innards of the systems or fixing minor problems. You might communicate with specific customers that were waiting for a specific fix, but for the most part these releases are not the issue.

But there are of course times when the thing we are releasing is something that will visibly impact customers or different stakeholders in our organization, and we want to be sure to manage this change appropriately.

One reason this is such an easy problem to run into is that the people implementing the change, the developers, may not always know the customer impact. The product manager will typically know, and can and should flag the associated product backlog items appropriately and give a heads-up to product marketing.

However, one of the reasons this communication and coordination can be challenging is that while the product manager owns the product backlog and the priority, he doesn’t really control when something is actually built and tested and ready for delivery. Many times backlog items have dependencies on other work and specific people, and the precise sequencing and timing is not necessarily clear to the product manager.

One popular technique to manage this and prevent unhappy surprises is a simple “Customer Impact Assessment” check, which is done just prior to pushing changes live. The release manager or product manager will usually check with product marketing to make sure that those impacted have been prepped. This is most common in organizations with a direct sales and/or customer support organization, such as enterprise software companies. This is usually a less common issue for consumer internet companies.

In enterprise companies, the product marketing people play a very key role in sales and services enablement, and they will usually be your go-to person to message to these organizations.

During this “Customer Impact Assessment” we typically categorize the changes into three buckets:

- Not visible
- Visible but harmless – no need to highlight
- Visible and potential customer impact – need to ensure appropriate stakeholders and customers are notified

It is the third bucket that gets the attention, and the product marketing person will usually take the lead on this. Hopefully the product manager informed the product marketing person that this was coming and she confirms that everything is set to go. But maybe this was missed, or maybe nobody expected that this would be ready to release so soon. In this case, it is possible that the product marketing person will ask that the feature or change not be pushed live, or if it is pushed live, it be pushed dark (which means it’s not visible to customers).

One last point here. So far I’ve just been talking about how to deal with changes that have customer impact. There is also an increasing trend in user experience design to design the changes with customer impact in mind, such that we minimize disruption and ease discovery of new capabilities. In other words, we can in many cases prevent customer impact issues rather than manage them.

Being sensitive to customer impact will prevent most of these potential issues from becoming actual issues. But it’s important to keep this in mind as we all move to more frequent releases.
