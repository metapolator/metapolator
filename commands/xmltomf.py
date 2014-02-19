def xmltomf(glyphname, *masters):
    """ Returns metafont formatted content for interpolated glyph

        Arguments:

        - `masters`
            List of dictionaries with values:

            - `width` axis value for extrapolated width
            - `weight` axis value for extrapolated weight
            - `name` is a name of master ufo
            - `glyphs`
                Dictionary with key as glyphname and values
                - `name`
                    Name of glyph
                - `contours`
                    List of contours defined in glif-//contours/outline.

                    Each point in glyph contour MUST contain coordinates (x, y)
                    and next optional coordinates (x1, y1), (x2, y2).
        - `glyphname`
            Name of glyph to lookup in each masters

    """
    # check that glyph is a required argument
    return ''
