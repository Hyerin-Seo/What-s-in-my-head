---
title: "Flavors of Prototypes"
url: https://www.svpg.com/flavors-of-prototypes/
date: 2014-02-23
author: Marty Cagan
category: Product
tags: [mvp, prototypes]
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

# Flavors of Prototypes

Prototypes of various forms have been around for as long as we’ve been doing software, since the famous Fred Brooks quote: “plan to throw one away, you will anyway.” However, many things have changed. Not the least of which is that the tools and techniques we have for developing prototypes and testing them have developed dramatically. Of all the different MVP techniques, prototypes are among my favorites.

That said, I continue to find teams, and even people that I would consider thought leaders, that have a very narrow interpretation of what is meant by the term “prototype.” When I press people, what I typically find is that they associate the term “prototype” with the type that they were first exposed to. If the first one you saw was used to test for feasibility, that’s what you think of. If the first one you saw was used for usability testing, that’s what you think of.

But there are in fact many very different forms of prototypes, each with different characteristics and each suited to testing different things. And yes, some people get themselves into trouble trying to use the wrong type of prototype for what they need to test.

In this article, I wanted to highlight the four main types of prototypes, and remind everyone what they’re each good for. I’ve written about each of them separately and in more depth, but I think putting them together may help people better understand the strengths and weaknesses of each, and hopefully keep in mind that there’s not just one type of prototype.

#### Feasibility Prototypes

These are written by engineers in order to address technical risks during product discovery before we decide whether something is feasible or not. Sometimes the engineers are trying out a new technology. Sometimes it’s a new algorithm. Lately it is often about assessing performance (think mobile app transitions, or Big Data). The idea is for the developer to write just enough code to be able to answer the feasibility question. It may be throwaway, or it might turn out to be something you can leverage if you decide to proceed.

#### Low-Fidelity User Prototypes

Fidelity has to do with how realistic the prototype looks. A low or even medium-fidelity user prototype doesn’t look real – it is essentially an interactive wireframe. “User prototype” means that it is a simulation and not something real. In other words, you can enter your credit card info as many times as you want, you won’t actually buy anything.

Balasamiq is pretty much everyone’s favorite low-fidelity user prototyping tool as they have made it so quick and easy to create this form of prototype. Low–fidelity user prototypes are typically created by the interaction designers. Many teams use these as a way to think through the product among themselves. For certain situations you can also identify usability issues right at this very early stage.

As great as they are, low-fidelity user prototypes only represent one dimension of your product – the information and the workflow – there’s nothing there about the impact of visual design, or the differences caused by the actual data, as just a couple important examples.

#### High-Fidelity User Prototypes

A high-fidelity user prototype is still a “smoke and mirrors” style simulation, however, now it looks very real. In fact, with many good high-fidelity user prototypes you need to look close to see that it’s not real. The data you see is very realistic, but it not real – mostly meaning it’s not live. For example, if I do a search for a particular type of mountain bike, it always comes back with the same set of mountain bikes, but if I look close, it’s not the actual bikes I asked for. And I notice that every time I search it’s always the same bikes no matter what price or style I specify. Now if you are trying to test the relevance of the search results this would not be the right tool for the job, but if you are trying to come up with a good overall shopping experience this is probably just fine and very quick and easy to do.

There are many tools for creating high-fidelity user prototypes – for every type of device. The tools are generally designed for designers. It’s also the case that some designers prefer to hand-code their high-fidelity user prototypes, which is fine as long as they are fast and are willing to consider the prototype as disposable.

The big disadvantage of a high-fidelity user prototype is that it’s not good for proving anything – like whether or not your product will actually sell. It is good for testing out usability, and it’s great for communicating the proposed product to key stakeholders, and it’s great for rapid learning. Where a lot of people go sideways is when they create a beautiful user prototype, and put it in front of 10 or 15 people that say they love it, and then they declare victory. Unfortunately, that’s not how it works. People say all kinds of things and then go do something different. We have a much better tool for proving whether something actually works (described next).

But my favorite use of a high-fidelity prototype is not to see if users like it, but rather, to try to learn why they don’t. When you test with a high-fidelity user prototype, you don’t get your answer from any one user, but every user you test with is like another piece of a puzzle, and eventually you see enough of the puzzle that you can see where you’ve gone wrong.

#### Live-Data Prototypes

Live-data prototypes are a little tougher to explain, but they are absolutely critical and the cost of producing them is dropping rapidly so I’m loving them more all the time. The main purpose of a live-data prototype is to actually prove something – normally it’s to prove whether an idea (a feature, a design approach, a workflow) really works. In order to know this, we typically need to do two things. First, we need the prototype to access our real data sources – like actually search our live inventory and show products that are really available right now. Second, we need to be able to send live traffic, in quantity, to the prototype.

The key is that we sure don’t want to have to build, test and deploy a real product in order to do this. That would take far too long, and cost far too much, and yield huge waste. And we don’t. A live-data prototype is a very limited implementation – typically just the critical use cases, and none of the “productization” that’s normally required like full use cases, test automation, SEO work, internationalization and localization, performance and scalability, etc. A live-data prototype is a fraction of the effort, but you get big value. You do have to keep in mind two big limitations. First, this is code so it requires your developers to create the live-data prototype and not your designers. Second, this is not a product, and you can’t run a business with it, so if the tests go well, you’ll still need to allow your engineers to take the time to productize the code.

But today the technology for creating live-data prototypes is so good that we can often get what we need in a couple days to a couple weeks. And once we have it we can iterate very quickly.

Normally we’ll test a live-data prototype in an A/B test, but we can also do an opt-in test or an invite-only test. The key is that real users will use the live-data prototype for real, and this will generate real data (analytics) that we can compare to our current product to see if this new approach actually performs better.

#### Hybrids

There are also many hybrids which combine aspects of each of these. For example, especially when working on things like search and recommendations, sometimes we need to have the prototype access live data sources, but we don’t need to send live traffic. In this case we’re not trying to prove anything, but we can learn a great deal about things like relevance by observing and discussing the results with the users.

Remember that the key principle in product discovery is to come up with the fastest, cheapest way to test out your ideas. So depending on your particular idea and situation, pick the flavor of prototype that best meets your needs.

While we all might have our favorites, if you are competing against good product teams, you are going to want to be skilled at developing and testing with each of these.
