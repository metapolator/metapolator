def xmltomf(*masters, **kwargs):
    """ Returns metafont formatted content for interpolated glyph

        Arguments:

        - `masters` is list of dictionaries with values:
            - `width` axis value for extrapolated width
            - `weight` axis value for extrapolated weight
            - `name` is a name of master ufo
        - `glyph` is a list of glyph contours with a list of points inside.

        Each point in glyph contour MUST contain coordinates (x, y)
        and next optional coordinates (x1, y1), (x2, y2).
    """
    # check that glyph is a required argument
    assert kwargs.get('glyph') is not None
    return ''
