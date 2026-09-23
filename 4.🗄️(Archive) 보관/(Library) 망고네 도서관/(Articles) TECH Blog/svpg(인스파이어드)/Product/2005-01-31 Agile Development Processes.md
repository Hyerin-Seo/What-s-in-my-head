---
title: "Agile Development Processes"
url: https://www.svpg.com/agile-development-processes/
date: 2005-01-31
author: Marty Cagan
category: Product
tags: [agile, backlogs, product-owner, scrum]
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

# Agile Development Processes

Many product development organizations have been experimenting with what has become known as “Agile Software Development” methods, the most popular of which at the time of this writing is known as “Extreme Programming” (XP) but there are several others including Scrum and Kanban.

In these cases, the product teams often wonder how the role of the product manager fits into the methodology. Or, the product manager may be concerned that if their product development organization uses this method then the resulting product will suffer due to some of the more publicized criticisms of the methods.

In this note we’ll first explain what the core tenets of Agile Development are, and then we’ll look at the specific example of XP, and then we’ll look at how this model impacts the product manager and how to deal with some of the challenges it poses.

### Overview of Agile Development Methods

There are twelve core principles that the various Agile methods all have in common. The ways in which each method carries out the principles vary sometimes considerably, but the common philosophy is:

1. The top priority is to satisfy the customer through early and frequent delivery of valuable software – valuable software early

2. Deliver working software frequently, from a couple of weeks to a couple of months – frequent releases

3. Working software is the primary measure of progress – software matters more than documents

4. Welcome changing requirements, even late in development – listen and learn rapidly

5. Business people and developers work together daily through the project – intense collaboration

6. Build projects around motivated individuals – give them the environment and support they need and trust them to do their job

7. The most efficient and effective method of conveying info to and within a development team is through face-to-face conversation

8. The best architectures, requirements and designs emerge from self-organizing teams – agile architectures; good ideas from anywhere

9. Continuous attention to technical excellence and good design enhances agility – refactor frequently

10. Agile processes promote sustainable development – should be able to maintain a constant pace indefinitely – no death marches

11. Simplicity is essential – less is more

12. At regular intervals, the team reflects on how to become more effective, and then adjusts its processes accordingly – post-mortems

### Overview of Extreme Programming

To help illustrate what it really means to follow an Agile method, let’s look at the specifics of the most popular one, known as Extreme Programming (XP). While the creators emphasized that it is not a one-size-fits-all method, and that it should be applied selectively, there are a core set of fundamental principles that form the basis of the method:

– Pair Programming – the software is written by two programmers working together around a single computer.

– Simple Design – the idea is to design and build only what you need right now and not for some potential future need.

– On-site Customer – the developers have a customer that represents what the product needs to do, sitting with the team and constantly available for clarification and decisions.

– Incremental Development – the strategy is to start small and do many “mini-releases” to rapidly evolve the product to where it needs to be.

– Scheduling and Planning – estimates are provided by the engineers and the customer decides scope and timing for each release.

– Continuous Code Review – based on the pair programming model, the developers are constantly reviewing each others’ work.

– Continuous Testing – the technique is to have the developers write unit tests as they code, and the customer writes functional tests as use cases are defined, and these tests all are run on an automated, ongoing basis.

– Continuous Build – the software is constantly built and integrated so that problems are found early and the system is always kept in a buildable state.

– Continuous Refactoring – the software developers continually work to simplify and improve the implementation by refactoring the code, while keeping all the tests running.

– Collective Code Ownership – rather than the model where each developer “owns” his own section of code, in the XP model every developer can improve any code anywhere in the system anytime he sees an opportunity and need.

– Open Workspace – the idea is that the team works together in a large room with the developers in the center.

– 40-hour Weeks – the belief is that overtime should be limited so that quality remains high.

– Documentation via Code – the belief is that the most useful documentation is the software itself, and that the team needs to follow coding standards.

Certainly this is very much a software developer-centric view of the world, as there really isn’t much besides the programmers (figuratively and literally at the center) and the user (the customer). However, in general, many of these techniques represent industry best practices and pose little concern to the product manager.

That said, there are generally three main areas of concern for the product manager:

### Discovering the Product:

The first has to do with how you figure out what to build. The XP method was originally created for custom software projects to meet a single customer’s specific needs (such as an internal employee payroll system), rather than general purpose products intended for many customers representing a range of needs. In fact, in the books and articles describing the XP method, you will find barely a mention of product management (by any of its many names) or even Product Design.

Typically the main concern is this notion of an on-site customer. However, the product manager, to the degree she has studied the target customer and understands his needs, environment and concerns, as well as the competitive situation, can do her best to serve as a proxy for the customer in this process, just as is typically done by the product manager in conventional methods.

A larger concern is the lack of product designer role. For products that must be sold on their merits (versus custom software developed under contract), the user experience is critical, and requires the skills of professional designers, so it is important that you incorporate this key role into the process.

These changes can fit into the XP process by treating the first iterations as an evolving prototype, doing validation to ensure the team will be building the right product, and then proceeding to use the following iterations to develop the product implementation.

The key is to ensure you are building a product that customers *will want to buy,* and will be able to *figure out how to use*. It is not enough that one customer or the product manager understand it. The product must be validated with the broader representation of the target market.

### Building the Product

The second area of concern is with the consequences of some of these techniques for a scalable, high-performance, reliable, and maintainable product. These concerns quickly get into near-religious arguments about the best way to develop and test software, which are largely beyond the scope of the product management role, but the main point relative to the product manager is to ensure the release requirements are clearly defined up front. The engineering organization can then address the concerns of how to manage the risks in the best way they see fit.

The XP process typically looks to the customer to define the use cases (called stories) which serve as the basis for functional tests. On small efforts this may be fine, but for larger, general product efforts, there is a need for a dedicated role to concentrate on identifying and creating the necessary test cases to ensure scalability, functionality, performance, fault-tolerance, localizability, etc. This is typically the QA function, and there is no reason it can’t be used with the XP model. The key is that the developers are responsible for the unit tests, and the QA people are responsible for the other types of tests (e.g. system, integration, functional tests).

### Deploying the Product

The final area of concern has to do with deploying the product into production. XP challenges the long-held belief that the cost of change grows dramatically over time. In other words, by following the practices of XP, you can reduce the impact of change once a system is in production. While in general this can be true for custom internal systems, for many types of commercial software products, the impact of change remains as high, if not higher, than ever, especially with Internet services with large, active user communities.

Fortunately, we have discussed elsewhere the need for [Gentle Deployment](https://www.svpg.com/gentle-deployment) practices, and these techniques can help the product team lessen the negative impact of the more frequent releases and updates that XP projects encourage.

### Summary

Agile Development in general, and the Extreme Programming method in particular, were created to address some truly important problems with the conventional methods of producing software, especially around increasing client/customer communication, reducing the time it takes to figure out if what you are building is something the customer will value, and reducing risk through incremental development and building out the highest priority features first. There are several very valuable techniques, especially around pair programming, incremental development, and continuous and automated test and build.

However, for product organizations building commercially available products and services, it is important to augment these methods with product management, product design, and quality assurance to ensure you’re building a product that will be useful to, and usable by, a broad range of users and customers, and that will be robust enough to operate in a range of customer environments.
