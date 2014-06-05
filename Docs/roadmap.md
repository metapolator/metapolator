We need a way to communicate what happens next in the Project and to show what already happened.

This is structured into Milestones and Tasks that have to be finished to reach these Milestones. Expect this document to change often, because it's impossible to plan everything from the start.


0. Ongoing Work
-------------------------------------------

* **Develop a better understanding** 

  So that we don't forget, a lot of work is done before even starting to work on the first Milestone, and this work continues: thinking over and over about what we are doing and if we are still going in the right direction.

1. Ignition! [July 1]
----------

**Goal:** Get fundamental technology into a working state.

**Scope:** This milestone does not include user friendly front end technology.

**Complete When:** Designer-Developers can create font instances from masters using Metapolator v2 technology. 

* **more ufoJS:** This is one of the core Metapolator libraries, and some fundamentals 
  still need to be developed there before we can start with the other parts.

  * Importer: Organize the creation of a Master (Skeleton layer and CPS)
    by extracting data from UFOv2 using ufoJS import plugins.

  * Exporter: Organize the creation of Instances by taking a Master
    and creating outlines from it using ufoJS export plugins.

* **CPS:** Initial Object-Model to process parameters. Details: [Cascading Parameter Sheets](https://github.com/metapolator/metapolator/wiki/cascading-parameter-sheets)

* **Plugins:** the beginnings of the Plugin mechanisms. This will give us the
  inspiration needed to create a unified plugin mechanism for all parts
  of Metapolator. Included in the first Milestone:
  * import: reading parameters from outline fonts into cps
  * export: make metapost code to create outlines
  * parameter definition

* **Sample project:** To show how data is organized in Metapolator, and is fully functional (but small.)  Details: [Metapolator Project File Format](https://github.com/metapolator/metapolator/wiki/metapolator-project-file-format)

* **Fundamental GUI concepts:** Details: [interaction design](https://github.com/metapolator/metapolator/wiki/interaction-design)

* **Events:** Simon will present at Tag der Schrift on June 14.

2. Approaching the GUI [August 1]
----------------------

**Goal:** Get fundamental UI and Application Technology into a working state.

**Scope:** This milestone does not include a complete UI, but a good layout to build upon and provide
a first really useful instance. 

**Complete When:** Designers connected to our developers can create font instances from masters using Metapolator v2 technology with a web UI. 

* Some of the technologies from the first Milestone will mature in this phase. 

* The plugin mechanism will need a robust interface.

3. Catching the GUI [September 1]
----------------------

**Goal:** Get full UI and Application Technology working well.

**Scope:** 

**Complete When:** Designers connected to our developers can create new font masters using Metapolator v2 technology with a web UI. 

* 100% Client Side

* Support for working offline

* Plan an outreach campaign to grow the userbase

4. Growing Users [October 1]
----------------------

**Goal:** Document the project and application

**Scope:** This milestone does not include adding major new features

**Complete When:** Designers not connected to our developers can become effective users

* Run the userbase outreach campaign

5. Refinement [November 1]
----------------------

**Goal:** Respond to user feedback

**Scope:** This milestone does not include adding major new features

**Complete When:** New users say they enjoy the application and the whole project experience

* Plan 2015, and a Kickstarter
   * Kickstarter required details (description, video, rewards, stretch goals)
   * Outreach campaign

* Decide a major feature to work on next, for November. Ideas:
  * Real Time Multi User Mode

6. Major Feature [December 1]
----------------------

**Goal:** Add a major feature

**Scope:** This milestone does not include incremental improvements

**Complete When:** Users are amazed at the new feature

* Get the Kickstarter approved, outreach campaign underway

7. Kickstarter [January 1]
----------------------

**Goal:** Fund initial development in 2015

**Scope:** This milestone does not include adding major new features

**Complete When:** Kickstarter launched

* Get the Kickstarter started at the end of December to begin the year!