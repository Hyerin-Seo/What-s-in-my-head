---
title: "Product Fail"
url: https://www.svpg.com/product-fail/
date: 2015-06-05
author: Marty Cagan
category: Product Design
tags: [product-development-process]
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

# Product Fail

*The Consequences of the Project Model*

**UPDATE**: Today we refer to this way of working as the *project model*. This term was introduced to distinguish this way of working from the *[product model](https://www.svpg.com/the-product-operating-model/).*

**NOTE:** This article is a narrative version of a talk I’ve given for developers at the [Craft Conference](http://www.craft-conf.com/) and for product managers and designers at [Mind The Product](http://www.mtpcon.com/).

In this article I’d like to discuss the root causes of so many product failures.

I see the same basic way of working at the majority of companies, and I can’t help but notice that this is not close to how the best companies actually work.

Let me warn you that this discussion can be a little depressing, especially if it hits too close to home, so if that’s the case, I’ll ask you to hang in there.

Let’s start by walking through the process that the vast majority of companies still use to create products. I’ll try not to editorialize yet; let me first just describe the process:

Everything starts with ideas. In most companies, they’re coming from execs or key stakeholders or business owners, or big customers (or prospective customers), but in any case there are always a whole bunch of things that different parts of the business need us to do.

Now most companies want to prioritize those ideas into a roadmap, and they do this for two main reasons. First, they want us to work on the most valuable things first, and second, they want to be able to predict when things will be ready.

In order to do this, there is almost always some form of quarterly or annual planning session where the leaders consider the ideas and negotiate a product roadmap. But in order to prioritize, they first need some form of a business case for each item.

Some companies do formal business cases, and some are informal, but either way it boils down to the need to know two things about each idea: 1) how much money will it make? and 2) how much money or time will it cost? This info is then used to come up with the roadmap, usually for the next quarter but sometimes as much as a year out.

At this point the product and technology organization has its marching orders, and they typically work the items from the highest priority on down.

Once an idea makes it to the top of the list, the first thing that’s done is for a product manager to talk to the stakeholders and flesh the idea out and come up with a set of “requirements.”

These might be user stories or they might be more like some form of a functional spec but it’s purpose is to communicate with the designers and engineers what needs to be built.

Once the requirements are gathered up, the user experience design team (assuming the company has such a team), is asked to provide the interaction design, the visual design, and in cases of physical devices, the industrial design.

Finally the requirements and design specs make it to engineers. This is usually where Agile finally enters the picture.

Anyway, the engineers will typically break up the work into a set of iterations – called “sprints” in the Scrum process. So maybe it takes 1-3 sprints to build out the idea.

Hopefully the QA testing is part of those sprints, but if not, the QA team will follow this up with some testing to make sure the new idea works as advertised, and also doesn’t introduce other problems (known as regressions)

Once we get the green light from QA, the new idea is finally deployed to actual customers.

In the vast majority of companies that I first meet, large and small, this is essentially how they work, and have worked, for many years. Yet these same companies consistently complain about the lack of innovation and the very long time it takes to make it from idea to customer’s hands.

You might recognize that while I mentioned Agile, and while almost everyone today claims to be Agile, what I’ve just described is very much a Waterfall process. In fairness to the engineers, they’re typically doing about as much Agile as they can given the broader Waterfall context.

OK, so that may be what most teams do, but why is that necessarily the reason for so many problems?

What I want to do now is to connect the dots for you to show you why this very common way of working is actually responsible for most failed product efforts.

Now I could literally talk all day long about the problems with this process, but what I’m going to do here is share what I think are the “top 10” most serious problems with this way of working. To be clear, I’m arguing that all ten of these are very serious issues, any one of which could derail a team, but many companies actually have most or even all of these problems.

1. Let’s start at the top – the source of ideas. This model leads to sales-driven specials, and stakeholder-driven products. Lots more to come on this key topic, but for now let me just say that this is not the source of our best product ideas. Another consequence of this approach is the lack of empowerment of the teams – in this model they’re just there to implement. Mercenaries.

2. Next let’s talk about the fatal flaw in these business cases. Now to be clear, I’m actually in favor of doing business cases, at least for ideas that need a larger investment. But the way most companies do them, at this stage, in order to come up with a prioritized roadmap, is truly ridiculous. Here’s why. Remember those two key inputs to every business case? How much money you’ll make, and how much it will cost? Well, the cold truth is that at this stage, we have no clue on either of these, and we can’t know.

We can’t know how much money we’ll make because that depends hugely on how good the solution turns out to be. If the team does an excellent job, this could be wildly successful and literally change the course of the company. On the other hand, the truth is that many product ideas end up making absolutely nothing. And that’s not an exaggeration for effect. Literally nothing. In any case, one of the most critical lessons in product is knowing what we can’t know, and we just can’t know at this stage how much money we’ll make.

Likewise, we have no idea what it will cost to build. Without knowing the actual solution, this is extremely hard for engineering to predict. Most experienced engineers will refuse to even give an estimate at this stage, but some are pressured into the old “t-shirt sizing” compromise – just let us know if this is “Small, Medium, Large and Extra Large.”

But company’s really want those prioritized roadmaps, and in order to get one they need some kind of system to rate the ideas, so people play the business case game.

3. An even bigger issue comes next. Companies get very excited about their roadmaps. I’ve seen countless roadmaps and the vast majority of them are essentially prioritized lists of features. Marketing needs this feature for a campaign. Sales needs this feature for a new customer. Someone wants a PayPal integration. You get the idea.

But here’s the problem, and it’s maybe the biggest problem of all. I call this the “two inconvenient truths about product.”

The first truth is that at least half of our ideas are just not going to work. There are many reasons for an idea to not work out. The most common is that the customers just aren’t as excited about this idea as we are. So they choose not to use it. Sometimes they want to use it, but they try it out and it’s so complicated that it’s simply more trouble than it’s worth, which ends up as the same result – the users don’t choose to use it. Sometimes the issue is that the customers would love it but it turns out to be much more involved to build than we thought, and we decide we simply can’t afford the time and money to actually deliver.

So I promise you that at least half the ideas on your roadmap are not going to deliver what you hope. By the way, the really good teams assume that at least three quarters of the ideas won’t perform like we hope.

If that’s not bad enough, the second inconvenient truth is that even with the ideas that do prove to have potential, it typically takes several iterations to get the implementation of this idea to the point where it actually delivers the necessary business value. We call that “time to money.”

One of the most important things about product that I’ve learned is that there is simply no escaping these truths, no matter how smart you might be. And I’ve had the good fortune to work with many truly exceptional product teams. The real difference is how you deal with these truths.

4. Next let’s talk about the role of product in this model. In fact, we wouldn’t even really call this role product at all. It’s really a form of project management. In this model it’s more about gathering requirements and documenting them for engineers. At this point let me just say that this is 180 degrees away from modern product management.

5. It’s a similar story with the role of design. It’s way too late in the game to get the real value of design, and mostly what’s being done is what we call the “lipstick on the pig” model. The damage has already been done, and now we’re just trying to put a coat of paint on the mess. The UX designers know this is not good, but they try to make it look as nice and consistent as they can.

6. Maybe the biggest missed opportunity in this model, is the fact that engineering gets brought in way too late. We say if you’re just using your engineers to code, you’re only getting about half their value. The little secret in product is that engineers are typically the best single source of innovation, yet they are not even invited to the party in this process.

7. Not only is engineering brought in way too late, but the principles and key benefits of Agile enter the picture far too late. Teams using Agile in this way are getting maybe 20% of the actual value and potential of Agile methods. What you’re really seeing is Agile for delivery but the rest of the organization and context is anything but agile.

8. This entire process is very project-centric. The company usually funds projects, staffs projects, and pushes these projects through the organization and finally launches projects. Unfortunately, projects are output and product is all about outcome. This process predictably leads to orphaned projects. Yes, something was finally released but it doesn’t meet its objectives so what really was the point? In any case, it’s a serious problem and not close to how we need to build products.

9. The biggest flaw of the old Waterfall process has always been, and remains, that all the risk is at the end. This means that customer validation happens way too late.

You’ve hopefully heard of Lean Startup methods, which are very much at the heart of the alternative. The key principle is to reduce waste, and one of the biggest forms of waste is to design, build, test and deploy a feature or product only to find out it is not what was needed. The irony is that many teams believe they’re applying lean principles, yet they follow this basic process I’ve just described. And then I point out to them that they are actually trying out ideas in one of the the most expensive, slowest ways we know.

10. Finally, while we’re busy doing this process and wasting our time and money, the biggest loss of all usually turns out to be the opportunity cost of what the organization could have and should have been doing instead. We can’t get that time or money back.

To me it’s no surprise that so many companies spend so much time and money and get so little in return. I warned you this could be depressing.

The good news is that I promise you that the best teams operate nothing like what I’ve just described.

I have written many articles about the various aspects of how the best teams work. Product Discovery is how we come up with winning solutions to the problems we are attacking. Discovery is an active and ongoing collaboration between product, user experience design, and engineering. Continuous Discovery and Continuous Delivery happen in parallel. Features on roadmaps (output) are replaced by business problems to be solved (outcome). The goal is product/market fit.

If your company is still running this old and long-obsolete process, then hopefully you can shine a light on this and start the transition to the future. And hopefully you’ll do this before you find yourself disrupted by a startup or competitor that is able to move much faster and more effectively than you can.
