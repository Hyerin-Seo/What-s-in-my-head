---
title: "The Waterfall Product Development Process"
url: https://www.svpg.com/the-waterfall-product-development-process/
date: 2005-02-15
author: Marty Cagan
category: Product Development
tags: [conventional, product-development-process, waterfall]
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

# The Waterfall Product Development Process

In the last newsletter we discussed the Agile Development Processes, and the implications for product managers. In this newsletter we look at the process that the majority of product teams still follow, which is known as the “Waterfall” process.

Even though the Waterfall development process is more than 30 years old, and even though it is often cursed by engineers and product managers alike, it is still by far the most common process used to create software products.

Note that it has long been unfashionable for a team to describe their product development process as “waterfall” yet in most cases that is essentially what is still being followed, albeit by many different names including Successive Refinement, SDLC, Phase-Gate, Stage Review, Staged Contracts, and Milestone-based.

In this article we’ll try to capture the strengths as well as the key weaknesses of this approach, and discuss what the product manager can and should do in order to maximize the chance of success with this process.

### General Principles

The conventional waterfall process is extremely simple in concept:

1) Phased Development – the model is that the software progresses through a well-defined series of phases beginning with a written description of the requirements, into first high-level architectural design, and then to low-level detailed design, then to code, then testing, and finally deployment.

2) Phase Review – each phase ends with a review of the deliverables from that phase, followed by sign-off and an explicit transition to the next phase.

The Waterfall method can be applied either very informally or very formally, as in the US Department of Defense Standard 2167A (and later 498), which describes in excruciating detail every step of the process and the many document deliverables.

Similarly, the waterfall method is also at the heart of the very informal and much more common scenario where someone from the marketing department gathers some market requirements and delivers them to engineering, where they come up with a schedule, and work on an architectural design and then some detailed designs for the more complicated areas, and then move into implementation and testing, often a beta, and finally deployment.

While we will soon discuss the most serious limitations of this approach, it is also useful to acknowledge the key traits that have kept this process in use for so long:

– Management appreciates the (perceived) predictability of the process. It is possible, although not common, to come up with fairly accurate schedules for even large and complex software projects. This assumes however that you completely and accurately understand the requirements and the technology, and that there will not be changes. With iterative approaches you don’t really know how many iterations will be required, which can be disconcerting to management.

– There are deliverables throughout the process. Many people (managers, customers/clients, and even many engineers) are reassured by seeing well thought out and thorough documents and design diagrams. It helps these people to gauge progress towards the end, and also helps them feel better about the level of thinking that has gone into the project (even though there is no way to test whether or not the confidence is justified because unlike software you can’t execute paper documents). Many people make the mistake of feeling unjustifiably reassured by impressive specifications and documents.

### Product Management Concerns

There are a number of well-known concerns with this process, especially from the product manager’s perspective:

– PM Issue: Validation Occurs Too Late in Process

The most costly issue is that there is no actual working software until nearly the end of the process, so there is little if any visibility into whether the software will be useful until after the majority of the investment has been made.

The product manager must ensure that prior to moving into the design and implementation phases, the product must be prototyped and tested on actual target users, so that the specification that is eventually provided to the product development organization is describing a product that has been successfully validated with the target audience.

Likewise, if there are major technical risks, these too should be explored and feasibility questions resolved (by the engineering organization) prior to beginning the actual architectural design and implementation. Before proceeding, the team needs to know that the product specification is something that can be successfully delivered.

– PM Issue: Changes are Costly and Disruptive

Any change to decisions from previous stages destabilizes the process and causes considerable pain and cost, as much work has to be reviewed and reworked. Moreover, the coding and testing process often uncovers issues in requirements and in architecture that can cause major delays and pain in this process.

The product manager must constantly represent the voice of the customer and user and there will be times when changes are required. It is important to point out that the cost of postponing the change needs to include the cost of the follow-on release to make the correction. There will still be times when it makes the most sense to defer the change until the next release, but in many cases it will be much less expensive to course correct sooner rather than later.

– PM Issue: Responding to the Market

This approach has a relatively high overhead in terms of documentation and process for moving through the phases. One consequence of this is that it can take considerable time to make even relatively small changes to the software.

This puts additional pressure on the product manager to ensure that they are providing a validated specification for a successful product in the first place, but it also means that the product manager will need to work with the product team to make course corrections after release as quickly as possible.

### Summary

We have all seen the consequences of the Waterfall process in practice, and it’s not hard to understand the motivation for alternatives such as the Agile methods like XP we discussed previously.

In many ways, the Waterfall process represents an idealistic but naïve view of the software development process, where people are able to anticipate the key issues and fully understand the requirements. When this is the case — usually for very small projects — this approach can provide a reasonable path to a quality implementation.

Unfortunately, this is rarely the case with product software. In practice, the consequence is that the product ships later than planned due to changes, and then expensive, time-consuming follow-on releases are required in order to correct issues once real users have a chance to see and use the actual software.

However, the product development process is often deeply entrenched in the product development organization, and the product manager must take steps to ensure that the potential problems are avoided. The most important key is to ensure the product spec is validated prior to moving to the implementation phase (remember to cover all three types of validation as described in “[How To Write a Good PRD](https://www.svpg.com/wp-content/uploads/2024/07/How-To-Write-a-Good-PRD.pdf)“), and you can save your team significant time and cost.
