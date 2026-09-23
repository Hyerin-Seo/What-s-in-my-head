---
title: "The Product Model at Spotify"
url: https://www.svpg.com/product-model-at-spotify/
date: 2023-10-18
author: Marty Cagan
category: Product Operating Model
tags: []
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

# The Product Model at Spotify

By Marty Cagan and Joakim Sundén

*Marty’s Note:*

I have been a long-time fan of Spotify. The fact that they compete against some of the best product companies in the world (including Amazon, Apple and Google), yet they have continued to hold their own, and in many cases out-innovate their competition, has certainly earned my respect.

Yet I don’t think they get the credit in the product community they deserve. I believe that’s mostly because people that think they know “The Spotify Model” are focused on the wrong things, and not what has made them such a strong, long-term competitor. So my hope with this article is to do what I can to help correct that.

I reached out to my friend Joakim Sundén and asked if he’d collaborate with me on an article that illustrates that even though Stockholm is more than 5000 miles from Silicon Valley, the principles behind how Spotify and the world’s top product companies work are remarkably consistent, and have little to do with what most people think the Spotify Model is.

For those of you that don’t yet know Joakim, he was an early coach at Spotify as they were working to establish, then scale, their organization and product culture, and then he joined the famed Stockholm-based consultancy, [Crisp](https://www.crisp.se/) as a partner. He spends his time coaching companies moving to the product model.

For this article to make sense, you’ll want to have at least a high-level understanding of what the product operating model is, as this article will be comparing the Spotify model to the product model. If you haven’t yet read the series of four articles, you should probably [start here](https://www.svpg.com/transformation-defined/).

**Background**

By the late 2000s, Spotify had transformed the music industry by winning major record labels over to the idea that streaming is the future.

By 2014, the service had amassed 60 million active users, and the fight had now shifted to another battleground. Many new competitors, including Google, Amazon, and Apple were getting ready to enter the fight with their own subscription streaming services.

Easy access to music through streaming – which Spotify had fought so hard to achieve – was now table-stakes, rather than a differentiator. Spotify needed to continue to innovate to maintain their market leadership.

**The Product Operating Model**

When we discuss the product operating model, at the high level we are looking at three major dimensions:

The first is how the company decides the most important problems to solve – the product strategy. The second is how they solve those problems and discover solutions worth building – product discovery. And the third is how they build, test and deliver those solutions to their customers – product delivery.

This article will try to highlight how Spotify embraces and embodies the principles behind each of these three dimensions.

**How You Decide Which Problems To Solve – Product Strategy**

Spotify’s CEO and co-founder Daniel Ek described the situation as being up against the “end-boss” in a video game. “We are in the big leagues now, and [some of the world’s biggest companies] are gunning for us…. We believe the most important thing we can do to maximize our potential is to increase our differentiation compared to other services.”

Spotify’s product strategy was shaped by insights on how their audience segmented. Spotify knew that they essentially had two main types of users. Those that knew the music they wanted to listen to, which they referred to as “lean-forward” listeners. And those that didn’t really know the artists or the albums and they just wanted the service to help them discover music that they would love, which they referred to as “lean-back” listeners.

For a long time Spotify had thought that the service was already pretty good for discovering music. All you needed was a good search bar and a playlisting tool. How hard can it be?

Pretty hard, it turned out, for the many mainstream “lean-back” users who didn’t have the time, or the knowledge, that the early adopters and Spotify-employed music nerds had.

Another strategic insight was that more and more users were discovering music through what Spotify called *Moments*, such as “studying”, “running”, or “dinner-party”, rather than by seeking out specific genres or artists.

Spotify had already started a shift from the model where the user does the work by following people and playlists to build their music library, to a recommendations-based model, where the service does the work based on what the user has listened to in the past.

Realizing that recommendations needed to become a core part of the product strategy, Spotify had recently acquired Massachusetts-based start-up The Echo Nest. The former Echo Nest engineers were now working together with Spotify’s machine learning engineers to help improve recommendations-based music discovery.

So Spotify leadership gathered up their product teams and explained that they needed to focus on understanding why the service was not performing as well as it should in the lean-back use case, and try to solve this.

This focus meant saying no to many other potential opportunities, and postponing or discontinuing others. For example, they shut down a big initiative around video streaming, and the people and resources were reallocated to focus instead on the lean-back listener problem.

This holistic view of the business and the resulting focus allows the product teams to dedicate their energy to the most critical problems to solve, giving it a higher likelihood of success.

**How You Solve Problems – Product Discovery**

Initially Spotify had a recommendations approach called *Discover* which presented album suggestions in a Netflix-style layout, based on the user’s personal listening history, but this seemed to demand too much interaction from the users, who expressed the desire to “get me going quick without putting in effort.”

At the same time, Spotify’s new *Browse* feature, which became the app’s new starting view and showcased hand-curated playlists like *Your Favorite Coffeehouse* by Spotify’s editorial team, was experiencing significantly higher user engagement compared to the *Discover* feature.

On top of that, certain industry pundits argued that lean-back users simply weren’t interested in exploring new music.

However, a couple of the machine learning engineers that were working on recommendations didn’t believe this to be true. They believed there must be a way to reduce the friction for users, and help them sift through the 30 million songs to find great recommendations.

Their optimism was bolstered by a recent hack week project, called *Play It Forward*, that was an add on to Spotify’s popular *Year In Music* (now known as *Wrapped*), a feature that provided a summary of the user’s year on Spotify.

*Play It Forward* analyzed the users’ listening history, using the same algorithm as *Discover*, to create a playlist of music you had not yet listened to on Spotify, but that you probably would like.

The playlist was presented to users at the conclusion of their *Year In Music* review. Months later, the engineers were astonished to find that millions of users remained engaged with it.

This sparked a thought: what if we could create a playlist like this, and just update it more frequently? This was the seed of the idea that would become known as *Discover Weekly*.

The concept was fairly straightforward, and could potentially leverage existing technology. The feature categorized your listening history into micro-genres. It then used collaborative filtering on billions of user-created playlists, identifying those users who, just like you, listened to x also listened to y—a track you’ve yet to discover on Spotify.

The engineers pitched the idea to the product manager and product designer and they began the cross-functional collaboration between product, design, and engineering to evaluate the potential product risks.

First up was *value* risk: would users choose to use it? And most importantly, if they did use it, would they find enough value to continue to use it?

Next up was *usability* risk: could users figure out how to use it? Would they be able to easily find the feature and understand its benefits? Realize that Spotify had never before made a playlist *for* users, and just dumped it in their library before – how would people respond to this?

Next was *feasibility* risk: could the engineers leverage existing systems for this, or would they need to build new systems, likely at high cost? Senior engineers at Spotify had already warned the team that what they were planning likely wouldn’t scale, as the playlist system wasn’t built to handle that kind of usage.

Finally, would this be *viable* for Spotify’s business? It had only been a few months since Apple Music placed U2’s new album, “Songs of Innocence,” in every user’s library without their consent, leading to significant [backlash](https://www.eonline.com/news/1071481/remember-when-apple-forced-a-u2-album-on-us-all), and forcing Apple to create a specialized tool for its removal. Concerns loomed about a similar overstep, and Spotify’s co-founder CEO, Daniel Ek, explicitly pointed out to the team that this idea could backfire.

After considering all the risks, the product team decided this idea had the potential to meaningfully address the problem of the lean-back users, so they decided it was worth running a series of experiments and collecting some concrete data. The team had clear metrics to steer them toward tangible business outcomes: enhancing reach, depth, and retention.

The team began quietly experimenting with a live-data prototype, which they subtly rolled out to all employees without any formal announcement. Monitoring the metrics, they observed the feature’s viral spread among their colleagues. This initial response served as an early indication that, at the very least, experienced users would be able to find and use *Discover Weekly*.

This gave the team enough confidence to do a proper employee release (affectionately known as “dogfooding” in many product companies), announcing it via email, and other internal communications channels, along with an appeal to try it out, and give qualitative feedback.

Spotify employees loved the new feature. “It’s as if my secret music twin put it together! *everything* in it is good!”

While encouraging, the product team understood that Spotify’s employees were not a predictive test, especially for the lean-back case. But now they had the confidence to try to answer the question of whether actual users would feel the same?

As with other product model companies, at Spotify, any empowered product team can roll out experiments to up to 5% of users without needing permission. The team decided to roll it out to 1.5% (1,000,000 users), watching closely as data began to trickle in.

The primary metrics were performing extremely well, and the qualitative results were equally impressive. The feature invited users to rate the new capability, and offer open-ended feedback. Over 1500 survey responses poured in, with more than 85% rating it 4 or 5 on a 5-point scale, and only a scant few raised the consent issue that had been a prior concern because of the Apple Music U2 reaction.

Remarkably, 65% of respondents discovered “a new favorite song” in their personalized weekly playlist. Users also took to Twitter to praise their new favorite feature, with comments like, “It’s scary how well Spotify’s *Discover Weekly* playlists know me.”

The product discovery experiments thus far successfully mitigated the risks related to viability, usability, and value. But feasibility was still a question.

The team wanted to expand *Discover Weekly* to a broader user base. However, as the user count swelled, it became clear that the existing playlist system would not scale, just as the senior Spotify engineers had predicted. The playlist system was simply not equipped to handle simultaneous updates for 75 million users’ playlists.

But now Spotify had the evidence they needed to show that reconstructing the playlist system to accommodate the requisite scale would be worth the investment (this is what we refer to as a *high-integrity business case*).

**How You Build – Product Delivery**

In 2006, at the dawn of Spotify, the standard Waterfall approach for software product development involved months of coding, predominantly guided by internal stakeholders, before releasing your product to the world.

An obvious drawback of this approach was the scant user feedback until the end of the project, resulting in a product reflective more of the internal stakeholder’s preferences, with the optimistic hope that it would also resonate with potential customers.

Recognizing these limitations, Spotify’s leaders and product teams understood early in the journey that a better approach to discovering and delivering product was necessary.

Consequently, substantial investments were made to support the necessary experimentation and provide the product teams access to crucial user behavior data. This included the infrastructure for instrumentation, telemetry, monitoring and reporting. The company also invested heavily in deployment infrastructure, especially for A/B testing, with a dedicated platform product team focused on enabling these live-data tests.

Spotify was also an early advocate of small, frequent, uncoupled releases, and invested in the tools and techniques of continuous delivery.

Since Spotify’s skills in product delivery are fairly well known in the industry, we won’t spend much time on that here. However, it is critical to realize that these investments are what enable Spotify’s empowered product teams to deliver *outcomes*, and not just output.

This delivery infrastructure paved the way for *Discover Weekly* and countless other Spotify innovations, large and small.

**The Results**

Only a few months later, *Discover Weekly* was ready for its global debut, rolling out to all Spotify users.

The launch was a resounding success, with *1 billion tracks streamed* within the initial 10 weeks. Remarkably, 71% of listeners added at least one song to their personal playlists, and 60% of those who tried *Discover Weekly* proceeded to stream five or more tracks.

The online buzz was equally enthusiastic, with users sharing emotional reactions like, “got really excited and started crying a little because I realized tomorrow is Monday, and Spotify is making me a new *Discover Weekly*.”

**Product Teams and Product Culture**

Hopefully this slice through product work at Spotify helps make clear the power of strong product teams, led by strong product leaders, working in the product model.

While Spotify is well known for its empowered product teams, this example shows what that concept really means in practice. It requires strong product leaders that provide the strategic context – especially the hard product strategy decisions – and know how to set up the environment necessary for product teams to do good work.

The co-founder Daniel believed in a structure where responsibility for business outcomes, aligned with a clear understanding of product strategy, using data-informed experimentation, would produce the best results—even if the ideas weren’t his own.

One of the reasons that this *Discover Weekly* example is so illustrative is because Daniel was openly skeptical about the product idea, and shared his concerns with the product team. But to his credit, he gave the team a problem to solve, and then allowed that work to proceed.

And to the credit of the product team, they saw the potential of the enabling technology, and they proceeded to tackle the product risks responsibly and effectively. This is what’s behind so many tech-powered innovations, and this is what is truly meant by empowered product teams.

Like other product model companies, Spotify recognizes that the most innovative ideas—those that truly resonate with customers—often originate from those who engage with the enabling technology daily – the engineers. They are uniquely positioned to identify emerging possibilities.

Great leaders understand the necessity of creating an environment where empowered product teams can exercise their creativity, discovering and delivering innovative solutions that not only customers love, but also drive business success.

**Learning More**

Last year, at the invitation of Crisp, I did a related talk aimed mainly at product and Agile coaches, trying to explain the different approaches to scaling, and why Spotify thrived while so many others failed, and you can view that talk [here](https://www.youtube.com/watch?v=mcnxxdzC2fY&t=1s).

And of course Joakim has spoken at length about Spotify and their culture. Here’s one of his [most popular talks](https://youtu.be/xICfIyEMD7E), and he also teaches [a course](https://www.crisp.se/kurser/kurstyper/product-model-explained-spotify) on the topic.
