We need a way to communicate what happens next in the Project and to show 
what already happened.

This is structured into Milestones and Tasks that have to be finished to 
reach these Milestones. Expect this document to change often, because it's 
impossible to plan everything from the start.

Completion Percentages are semantic, not time-based.

0. Ongoing Work
-------------------------------------------

* **Develop a better understanding** 

  So that we don't forget, a lot of work was done before even starting to 
  work on the first Milestone, and this work continues: thinking over and 
  over about what we are doing and if we are still going in the right direction
  and learning about METAFONT from Knuth's books.

1. Ignition! [July 11, DONE]
----------

**Goal:** Get fundamental technology into a working state.

**Scope:** This milestone does not include user friendly front end technology.

**Complete When:** Designer-Developers can create font instances from
  masters using Metapolator v2 technology. 

* **more ufoJS:** This is one of the core Metapolator libraries, and some
  fundamentals  still need to be developed there before we can start with
  the other parts.
  * ufoJS library: *(100% complete)* reading and writing glyph layers 
  * Importer: *(100% complete)* Organize the creation of a Master (Skeleton layer and CPS)
    by extracting data from UFOv2 using ufoJS import plugins.
  * Exporter: *(100% complete)* Organize the creation of Instances by taking a Master
    and creating outlines from it using ufoJS export plugins.

* **CPS:** Initial Object-Model to process parameters. Details: [Cascading Parameter Sheets](https://github.com/metapolator/metapolator/wiki/cascading-parameter-sheets)
  * parsing/writing: *(100% complete)* into/from our object model
  * MOM (Metapolator Object Model)*(100% complete)*: CPS relates to objects in this tree-model
  * Selectors and value inheritance chain: *(100% complete)*
  * processing CPS values: *(100% complete)* @dictionary and @namespace (which makes the produced CPS a lot leaner)

* **Modules:** the beginnings of the Plugin mechanisms. This will give us the
  inspiration needed to create a unified plugin mechanism for all parts
  of Metapolator. Included in the first Milestone:
  * import: *(100% complete)* reading parameters from outline fonts into cps
  * export: *(100% complete -- although note that metapost is still missing, but it may not be needed at all.) Write the result into a UFO.
  * parameter definition *(100% complete)*

* **Sample project:** *(95% complete, upload CPS project as repo)* To show how data is organized in 
  Metapolator, and is fully functional (but small) so we can open and close
  projects. Initially described in [Metapolator Project File Format](https://github.com/metapolator/metapolator/wiki/metapolator-project-file-format) and a [MF sample file](https://github.com/metapolator/sample_metafont_file) is uploaded as a repository.

* **Fundamental GUI concepts:** Details: [interaction design](https://github.com/metapolator/metapolator/wiki/interaction-design)

* **Events:** *(DONE)* Simon will present at Tag der Schrift on June 14 and post about it on the G+

2. Useful Code! [October 1, DONE]
----------------------

We moved roadmap development for the intense August + September summer work to a Google Doc, [Metapolator Milestone 2: Useful Code](https://docs.google.com/document/d/15zZFMTjcUlW0_fN37_cE5dinnnazjbGMrJHNArhFCUo/edit#heading=h.41fvagdjd8j8).

3. Initial UI [November 1]
----------------------

We moved roadmap development for this intense phase to a Google Doc, [Metapolator Milestone 3: Initial UI](https://docs.google.com/document/d/1VJb19SPiW9N_hrC_xzNe9rGzRSJ2lwNgrG2U7BnuBgw/edit).

Future plans
----------------------

Document the project and application: We should spend some time not adding new features, but ensuring that web designers not connected to us developers can become effective users. We can also plan an outreach campaign to grow the userbase and run the plan.

Responding to user feedback: We should spend some time not adding major new features, but adding small things so that new users say they enjoy the application and the whole project experience.

Plan 2015: We should prepare a Kickstarter (description, video, rewards, stretch goals) and plan a pre-KS campaign, and pick 1 major feature to work on next (Real Time Multi User Mode?) as the focus of the kickstarter.

### Funding

Run a Kickstarter to add a major feature

### Spin offs

From a [G+ discussion](https://plus.google.com/+DaveCrossland/posts/8qwAjheutTn):

One thing we could also do is to produce some spin-off projects. We have code there that can be useful for more general cases, for example:

- the IO API and modules of ufoJS
- the Model (CPS plus MOM)

About the Model, it would be possible to release a package that let's a user (developer) define his own custom Node Types, then he can use CPS to apply values to that. It's even possible to implement other languages/types for the values, so developers wouldn't be bound to our rather geometry-heavy formulae language.

You make a tree-data-model and get a package that can query the tree and assign values to it's elements like you know it from CSS (and more).

Lasse has already two concrete ideas where I'd like to use that.

Creating more users for those individual parts of Metapolator and thus more interest/contributors/maybe sponsoring, is like having a bigger surface, as a metaphor. Each contribution to the IO module would also be a contribution to Metapolator, people without interest in fonts making at all could become attracted by some of our sub-projects and advance Metapolator just by that.﻿