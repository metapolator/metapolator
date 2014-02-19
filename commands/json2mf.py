def json2mf(glyphname, axes):
    """ Returns metafont formatted content for interpolated glyph

        Arguments:

        - `glyphname`
            Name of glyph to lookup in each masters
        - `axes`
            Dictionary with axis values of masters pair.

            Each master in axis is a dictionary with values:

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
    """

    listwidth = '{W1}*{A1}_width + {AXIS} * ({W2}*{A2}_width - {W1}*{A1}_width)'

    # beginfontchar (three, (388*A_width + foo * (493*B_width - 388*A_width)
    # + 519*C_width + bar * (671*D_width - 519*C_width)) + spacing_threeR)
    # * width_three, 0, 0 );

    beginfontchar = []
    for axisalias in axes:
        axis = axes[axisalias]
        lglyph = axis[0]['glyphs'][glyphname]
        rglyph = axis[1]['glyphs'][glyphname]
        lmaster = axis[0]
        rmaster = axis[1]
        beginfontchar.append(listwidth.format(W1='%.2f' % (lglyph['advanceWidth'] / 100.),
                                              W2='%.2f' % (rglyph['advanceWidth'] / 100.),
                                              AXIS=axisalias,
                                              A1=lmaster['alias'],
                                              A2=rmaster['alias']))

    begin = 'beginfontchar ({g}, ({args}) + spacing_{g}R) * width_{g}, 0, 0 );'
    return begin.format(args=' + '.join(beginfontchar), g=glyphname)
