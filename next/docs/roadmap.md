Roadmap
=======

We need a way to communicate what happens next in the Project and to show
what already happened.

This is structured into Milestones and Tasks that have to be finished to
reach these Milestones. Expect this document to change often, because it's
impossible to plan everything from the start.


0. Develop a better understanding (ongoing)
-------------------------------------------
This is an ongoing Milestone. I bring it up here so that we don't forget,
that there was a lot of work done before starting to work on the first
Milestone. And that there will be a lot of work to think over and over
what we are doing and if we are still headed in the right direction.

1. Eureka!
----------

The goal of the first milestone is to get fundamental technology into a
working state. So that we can create fonts using Metapolator technology.
This milestone does not include user friendly frontend technology.

* more ufoJS: This is not directly Metapolator, however, some fundamentals 
  still need to be developed there, before we can start with the other parts.

* Importer: Organize the creation of a Master (Skeleton layer and CPS)
  by extracting data from UFOv2 using import plugins.

* Exporter: Organize the creation of an instance by taking a Master
  and creating outlines from it using export plugins.

* CPS: Initial Object-Model to process parameters.

* Plugins: the beginnings of the Plugin mechanisms. This will give us the
  inspiration needed to create a unified plugin mechanism for all parts
  of Metapolator. Included in the first Milestone:
  * import: reading parameters from outline fonts into cps
  * export: make metapost code to create outlines
  * parameter definition

* A fully functional "sample" project, that shows how data is organized
  in Metapolator. See this discussion of the [Metapolator Project File Format](./Metapolator-project-file-format.md)

* A rather low level inspector tool for glyph data. This will be controlled
  rather by writing code for it, than by a ready to use GUI, because we will
  need a way to display different aspects of the data.
  * visually proof if we are doing the right things when developing
  Importer and Export.
  * Work on fonts with the Text-Editor but see what we do.

* Fundamental GUI concepts.

2. Approaching the GUI
----------------------
Starting to implement the GUI and the Application. We won't build the whole
thing in this milestone, but make a good layout to build upon and provide
a first really usable instance. Some of the technologies from the first
Milestone will mature in this phase. The plugin mechanism will need a
robust interface.


