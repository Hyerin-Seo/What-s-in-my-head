---
title: "Help Prevent User Abuse"
url: https://www.svpg.com/help-prevent-user-abuse/
date: 2006-11-16
author: Marty Cagan
category: Product
tags: [customer-impact, gentle-deployment, product-development-process]
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

# Help Prevent User Abuse

What is User Abuse?

It is when you unnecessarily and (hopefully) unintentionally mistreat your users by releasing changes to the user community that they don’t appreciate. I know it’s hard to believe that not every one of your users is waiting excitedly for all of your changes, but it’s true. There are several reasons why your users may feel this way:

– they may not have received any notice of the changes so they were caught by surprise – and they weren’t in the mood for a surprise

– they may not have time at the moment to learn the changes and you don’t have a way for them to continue to use the old version until they do

– the new change may not actually work

– the new change may be incompatible with early versions (such as for accessing your data)

– the new change may work but it is perceived as gratuitous

– they may already be fatigued from all of the changes you have recently made lately

– they may have their own layer of process or behavior built around your previous version, and now that is broken and they have to update it

So what causes User Abuse?

Mainly change. As a general rule, users don’t like change. Sure they want the software to be great, and they clamor for new functionality, but most people aren’t excited about taking the time to learn a new way to do something they could already do.

Of course, that’s a problem, as most of us are in the business of change. We have product teams working relentlessly to add value and deliver new capability to our users and customers. Needs change, technologies change, and markets change, and our software must change along with them.

The solution to user abuse isn’t to prevent change, it’s to be smart about deploying change.

In truth, user abuse has always been a problem, even with commercial desktop software. Go look at a software magazine from 15 years back and you’ll see how frustrated users were with the changes to Windows and Office at the time. But in general, because the update frequency of shrink-wrap software was naturally limited (generally once or twice a year), the damage was limited.

However, the Internet changed all that, in two significant ways. First, Netscape introduced the era of the software download, and the cost of software distribution went down dramatically. But still at least in the software download model, users could be in control of when their software changed.

But then came web applications. Essentially all the application software that matters is now managed server-side – there is in effect a single installation of the software, and the creator of that software decides when and if that software will be changed. They make the change once, and their millions of users see it instantly. Incredibly powerful.

But with that power comes responsibility. In an enterprise environment, if you’re going to install a new version of software, you generally schedule the update, notify the users, prepare them for downtime, install and test, and then hold the hands of the users as they struggle to deal with the new changes. But in the web applications model, the software is typically changed out from underneath the users.

When making a change, few organizations consider the true impact to the user community. They just focus on their internal cost (or lack of cost as it’s virtually free) and this leads them to assume since change is easy and free, we can do it as often as we like.

Don’t get me wrong. I am the biggest champion of the thin-client web application architecture you will find. In fact, I argue it is the single biggest contribution to IT as well as individual productivity in our industry’s history. I love how few desktop clients I actually have to install now when I get a new computer. And you can imagine how that reduces the costs for managing corporate enterprises. And technologies like Ajax and Flash enable us as application providers to create and deliver a user experience with nearly the richness of a native fat-client.

Now in truth, if you’re just dealing with early adopters, and if your application isn’t something that your users actually depend on, then you can safely treat it like a big sandbox and change it as frequently as you like. I admit it’s a fun state to be in. But once you build a community of any size, or once you start taking money for your service, or if your service is something your users depend on for their livelihood, then you’ve got to get smart about deploying changes.

It is especially easy for those teams using Agile methods (like XP or Scrum) to fall into this trap, as the methodology encourages many small iterations. I actually very much like Agile methods and the principle of doing many iterations, but when you’re trying to use Agile methods for commercial products with active communities of users, you will need to adjust the methods. By all means continue with the short iterations, just don’t necessarily ship every iteration, as it may make more sense to group several together into an actual release to users. (I’ve discussed elsewhere about how you should test your changes with real users well before this stage anyway, so I won’t go into that again here).

So how do you deploy change?

First, communicate the changes in advance. Posting a preview that contains screen shots is great. But also use newsletters, onsite education, and tutorials.

Second, if there is any question about the new version of your product working properly, either due to reliability issues, or scale, or performance, then you need to redouble your testing efforts there to try to ensure that you won’t have to rollback your updates, which compounds the community angst significantly.

Third, if the change is significant, it is important to contain the risk by pursuing some form of gentle deployment – such as parallel, progressive, geographical or incremental deployment. Most of our industry recently saw a great example of parallel deployment with Yahoo’s new web e-mail release. They used these progressive deployment strategies and I’ve no doubt it cost them considerably to do this, but with the size and vigor of their mail community, I would argue they had no choice and it would have been fatal for them to have done otherwise.

If your users like your product or service, you do have a reserve of goodwill to draw upon, but you should save that for when you really need it; don’t waste that goodwill through user abuse.
