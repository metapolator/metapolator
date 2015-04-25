by @rrthomas

# Background

Tom Lord's (@dasht) excellent [Metapolator architectural proposal](https://github.com/metapolator/metapolator/wiki/architecture-proposal-by-dasht) and the ensuing video discussion it links to covered three main subjects, which I list in what I consider order of diminishing importance:

1. *Better separation of concerns.* Tom rightly emphasised the importance of hackability. Metapolator's UI, being in a relatively little-known space (parametric font design), should be open to experimentation and forking. However, if one is writing font editor UIs, it seems reasonable that the model should include font abstractions, unlike the table editor. Tom also makes a good point about privilege, when he talks about "interfaces to storage", or what I'd more abstractly call "history management": recording a risky transformation in the undo history is just as important as overwriting a file on disk.

2. *Simpler data model.* Tom proposes a simpler data model (property tables). Lasse Fister (@graphicore) implies in [[cps interpolation alternative]] that our current data model may be too complex; or at least, we may be using it in too complicated a manner. Our struggles with defining interpolation bear this out, though partly the problem is again its novelty. In general, there's a tension in data structure design between a) modelling the data straightforwardly, b) making it easy to process, and c) performance.

3. *Faster performance.* A lot of the video discussion was about performance. Mistake! While there are already hints of performance problems (e.g. loading fonts is slow, as Lasse mentioned), it is not obvious that our CSS/DOM-like model is inherently worse in this respect than Tom's property tables. Searching online for "CSS performance" and similar terms throws up lots of hits for tips on improving one's CSS for speed, but nothing that I could find about fundamental performance problems. CSS/DOM are a well-understood model that seem to be appropriate to our domain (parametric font description). However, we could certainly use them better: Lasse gave the example of inefficiencies that come from our representing font data as CPS rules, each of which applies to only one glyph. SVG renderers have much the same problems as we do, and seem to cope, including for interactive applications, using a similar data model.

# The central problem of software architecture

Our paymasters/robot overlords/visionary leaders are interested in _product_, not architecture. This is always true, and is why architecture-centric coding is rarely done outside startups and free software (where the coders have the money). Hence, the challenge is to improve the architecture _as a byproduct_ of improving functionality.

# Interpolation

Lasse's [[cps interpolation alternative]] presents a definition of interpolation which involves simplifying the data representation (while sticking with CPS/MOM). Assuming the plan, or something similar, is approved, I suggest we use it to drive incremental architectural improvements:

* Separation of concerns can be improved in the following ways:
  * Keep registration of CPS and MOM node types (i.e. the semantics) separate from the parsing (syntax).
  * Implement interpolation as a single module (following Tom's "commands" structure). Lasse's `InterpolatingMaster` should subclass `Master` and `StyleDict`, and, as per Lasse's suggestion, the `Master` type should provide access to the corresponding `StyleDict` type.

* Where data structures don't balance the needs of data and code, they should be simplified. As mentioned in the video discussion, the current representation of font data as CPS rules is odd (and, incidentally, hurts performance): the whole rule set must be queried to find the rules that apply to each glyph, most of which apply only to one glyph.

* We should ignore performance except where it hurts. Acceptable performance usually comes directly from using data structures that allow algorithms to be expressed simply and directly. Performance fixes can often be orthogonal to data structure design (e.g. caching/memoization, precomputation, special-case data structure implementations); when they aren't, they must be carefully designed, and hence should be used sparingly, for real problems. 