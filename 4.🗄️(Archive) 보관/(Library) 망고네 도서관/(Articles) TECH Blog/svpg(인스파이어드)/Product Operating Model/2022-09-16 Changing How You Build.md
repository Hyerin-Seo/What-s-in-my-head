---
title: "Changing How You Build"
url: https://www.svpg.com/changing-how-you-build/
date: 2022-09-16
author: Jon Moore
category: Product Operating Model
tags: [product-development, product-development-process]
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

# Changing How You Build

By Jon Moore and Marty Cagan

Recently we shared [an article defining what we mean by true transformation](https://www.svpg.com/transformation-defined/) where we described three elements to becoming a strong, product-led company.

In the next three articles, we will drill into each of these three elements, and describe why these changes are so important to strong product companies.

While these may be somewhat technical concepts, a deep understanding of technology is not required to understand the importance, and the value, to your business and your customers.

—

Your technology investment is all about creating value for your customers and your company.

There are several important aspects to creating this value, but at the end of the day, the primary skill you depend on to build your products are engineers. For most technology-powered companies, the engineers are the single largest cost.

Yet there is a wide range of tools, methods and processes that your engineers may use to actually build, test and deploy their products.

But much more important than the particular tools, methods or processes, are three core principles that lay at the foundation of how strong product companies build products:

1. PROTECTING CUSTOMERS, REVENUE, BRAND, COLLEAGUES

First and foremost, as we build and deploy our products, we need to do so in ways that protect our customers, protect our revenue, protect our reputation, and also protect our colleagues.

In modern technology-powered products and services, breaking the product can have immediate and damaging consequences to our users and customers, our revenue, our brand’s reputation, and our colleagues (especially sales and customer success staff).

If we cause a serious issue, it can create an outage for all the customers and users that use and depend on that service. This is part of the price we pay for the many customer benefits of cloud computing.

This is why if a core infrastructure service such as Amazon’s AWS has a serious issue, much of the products that we depend on for our personal and professional lives are immediately impacted and often rendered inoperable. This is very similar to a major power outage.

While you can never protect against all possible problems, we have an obligation to constantly work to protect our customers from problems we cause when we build and deploy.

2. RESPONDING TO MARKET NEEDS

Second, it’s important to call out that this is not just used for getting new capabilities to our customers.

In every company, there will be times when something changes in the market, the competitive landscape, or the environment that causes things to stop working, to behave incorrectly, or perhaps due to regulatory or compliance changes, demand a change to our products, or your customers encounter some serious problem requiring immediate action.

When there are serious issues that are impacting our customers, we need the ability to quickly diagnose the problem, create a solution, test that solution, and then deploy that solution.

Waiting weeks or months is no longer acceptable for most companies today. Strong product companies need the ability to respond quickly and competently to these market needs.

3. EARNING THE TRUST OF OUR CUSTOMERS

Finally, customers generally understand that occasionally problems will occur, but they judge us more by our ability to respond quickly and competently when those issues do arise.

Similarly, there are always situations where product teams need to be able to make what is called a *[high-integrity commitment](https://www.svpg.com/managing-commitments-in-an-agile-team/)*. This is when our customers or partners are depending on us for a specific deliverable, and they need to know they can count on that deliverable providing the necessary value, and also delivered when promised.

It is no secret in our industry that many companies have a terrible track record in terms of delivering on these types of promises. But strong product companies know how important this is to building and maintaining trust with our customers.

SMALL, FREQUENT, RELIABLE RELEASES

The core technique that is used to address each of these principles is the notion of small, frequent, reliable releases.

This means, at a bare minimum, each product team releasing every other week. For the strongest product companies, this means releasing several times per day.

The reason you likely don’t know this is happening with your favorite products is precisely *because* they are releasing a near constant stream of small releases.

And in order to consistently deliver small, frequent, reliable releases, we need to take very seriously our obligation to test, known more formally as *quality assurance*.

But testing is more complicated than it may seem. In general, we work to test two main aspects of what we build, the first is straightforward, and the second is less so.

The first is that when we build a new capability, we need to test that the new capability will work as expected. Straightforward, although since we will likely want to test and retest this new capability thousands of times in the coming months and years, we will usually invest in some level of test automation.

The second is to ensure that the changes made to enable the new capability do not unintentionally or inadvertently break anything else. This is referred to as *regression testing*, and when you realize that many technology-powered products and services today are the result of literally hundreds of engineers working for many years, creating tens of thousands of interactions, you can see that ensuring that a complex product does not take a step backwards when a new capability is introduced can be a significant undertaking.

The main method product teams use to ensure that new capabilities work as advertised, and don’t introduce regressions, is to deploy a series of very frequent, very small changes.

The smaller the release increment, the faster we can ensure the quality of the new capability, and the faster we can be confident we’re not introducing regressions. And with these small, frequent releases, if a problem is introduced, it is much easier and faster to identify the cause (since we only changed a small number of things).

If this seems counterintuitive to you, and if you still believe that in order to ensure quality you need to release slowly and infrequently, then you owe it to yourself and your company to examine both the theory and the evidence on why frequent, smaller releases provide both more throughput *and* higher quality at strong product companies. We recommend the excellent book [Accelerate](https://www.amazon.com/Accelerate-Software-Performing-Technology-Organizations/dp/1942788339).

Unfortunately, for many companies, they have not yet achieved the ability to do these small, frequent releases.

Instead, they make hundreds or even thousands of changes, and then once a month, once a quarter, or even once a year, they will work to integrate all these changes together, and then try to test that all these new capabilities work as expected, and then they begin the grind of trying to identify and remove all the unintended consequences (regressions).

As you are hopefully beginning to realize, this is why large releases like this (these are known as *big bang releases*) are notorious for delays of weeks, or even months, trying to get everything back to a reliable, releasable state.

In fact, many products built this way *never achieve* a state of solid quality, and the customer is forced to deal with a constant stream of defects and issues, or else seek out a different solution provider.

Moreover, even if the new release actually works as it’s supposed to (a very big if), the customer is forced to absorb hundreds or even thousands of product changes hitting them all at once, likely requiring retraining, recertification, reintegration, and otherwise significantly interrupting their own work to accommodate all the changes the company has forced upon them.

In this case, it’s all too common for the customer to press your company to release *less* *frequently*, because they simply have no time to deal with this degree of change. As you can hopefully see by now, while it is completely understandable why the customer would request this, doing so would be much worse for the customer, and worse for your company.

Combined with the inability of the company to respond quickly and competently to critical issues, and you can hopefully see how customers would lose confidence in your ability to provide them the service they need.

A NOTE ABOUT AGILE METHODS

You have almost certainly heard of Agile methods. The main reason so many companies moved to Agile methods over the past twenty years is that these methods can provide the forcing function to get product teams to achieve these consistent, small, frequent releases.

It’s true that moving to small, frequent releases can require a significant investment, mainly in testing and deployment automation. But for those companies that employed Agile methods to get them to release no less frequently than every other week, it has provided them and their customers real value.

That said, it’s important to understand that you don’t need Agile methods in order to have consistent, small, frequent releases.

In fact, many of the best product teams in the world have mastered the ability to consistently deploy these small releases (referred to as *continuous integration and* *continuous deployment or “CICD”*), yet they don’t follow any formal Agile process or methods.

Contrast this with the organizations that invest so much time and money into adopting Agile rituals, roles, methods, and processes, yet at the end of that expense and time, they are still releasing quarterly, and inflicting the associated pain on their customers.

Similarly, there is a [spreading disease](https://www.svpg.com/revenge-of-the-pmo/) in the technology world where heavyweight processes [masquerade as Agile](https://www.forbes.com/sites/stevedenning/2019/05/23/understanding-fake-agile/), yet literally release only once a quarter.

And just to be perfectly clear on this very critical point: if your company is still releasing yearly, quarterly, or even monthly, it doesn’t matter how many Agile rituals you follow, or how many so-called Agile coaches you may employ, the truth is that you are *not* Agile in any meaningful sense, you are not getting the necessary benefits, and you will not be able to serve your customers or your business as you need to.
