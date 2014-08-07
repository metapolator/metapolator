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

2. Useful Code [September 1]
----------------------

[moved to a google doc](https://docs.google.com/document/d/15zZFMTjcUlW0_fN37_cE5dinnnazjbGMrJHNArhFCUo/edit#heading=h.41fvagdjd8j8)

3. Initial UI [September 26]
----------------------

**Goal:** Create a UI to the Application Technology

**Scope:** 

**Complete When:** Designers connected to our developers can create new font masters using Metapolator v2 technology with a web UI. 

* 100% Client Side

* Support for working offline

* UI-widgets. Almost everything of the UI should be a plugin. (We need probably some API here to persist the UI setup.)

* Rounding corners plugin

* Collaborate with Prototypo?


Future plans
----------------------

Document the project and application: This milestone does not include adding major new features, and is complete when Designers not connected to our developers can become effective users. It includes planning an outreach campaign to grow the userbase and running the plan.

Responding to user feedback, without adding major new features, and is complete when new users say they enjoy the application and the whole project experience.

Plan 2015, and a Kickstarter (description, video, rewards, stretch goals) and pre-KS campaign, and pick 1 major feature to work on next (Real Time Multi User Mode?)

Add the 1 major feature, so users are amazed; get the Kickstarter approved, outreach campaign underway.

Launch a KS.

Detect and automatically tag features of letters. [Paper on how to do this.](http://www.cs.huji.ac.il/~arir/extraction-typographic-elements.pdf)