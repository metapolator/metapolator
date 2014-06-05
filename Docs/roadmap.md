We need a way to communicate what happens next in the Project and to show what already happened.

This is structured into Milestones and Tasks that have to be finished to reach these Milestones. Expect this document to change often, because it's impossible to plan everything from the start.


0. Develop a better understanding (ongoing)
-------------------------------------------

This is an ongoing Milestone. I bring it up here so that we don't forget, that there was a lot of work done before starting to work on the first Milestone. And that there will be a lot of work to think over and over what we are doing and if we are still headed in the right direction.

1. Ignition!
----------

**Goal:** Get fundamental technology into a working state.

**Scope:** This milestone does not include user friendly front end technology.

**Acceptance Criteria:** Designer-Developers can create fonts using Metapolator v2 technology. 

* more ufoJS: This is one of the core Metapolator libraries, and some fundamentals 
  still need to be developed there before we can start with the other parts.

  * Importer: Organize the creation of a Master (Skeleton layer and CPS)
    by extracting data from UFOv2 using ufoJS import plugins.

  * Exporter: Organize the creation of Instances by taking a Master
    and creating outlines from it using ufoJS export plugins.

* CPS: Initial Object-Model to process parameters. Details: [Cascading Parameter Sheets](https://github.com/metapolator/metapolator/wiki/cascading-parameter-sheets)

* Plugins: the beginnings of the Plugin mechanisms. This will give us the
  inspiration needed to create a unified plugin mechanism for all parts
  of Metapolator. Included in the first Milestone:
  * import: reading parameters from outline fonts into cps
  * export: make metapost code to create outlines
  * parameter definition

* Sample project, that shows how data is organized in Metapolator, and is fully functional (but small.)  Details: [Metapolator Project File Format](https://github.com/metapolator/metapolator/wiki/metapolator-project-file-format)

* Fundamental GUI concepts. Details: [interaction design](https://github.com/metapolator/metapolator/wiki/interaction-design)

2. Approaching the GUI
----------------------
Starting to implement the GUI and the Application. We won't build the whole
thing in this milestone, but make a good layout to build upon and provide
a first really usable instance. Some of the technologies from the first
Milestone will mature in this phase. The plugin mechanism will need a
robust interface.


