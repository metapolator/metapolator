def json2mf(glyphname, axes):
    """ Returns metafont formatted content for interpolated glyph

        Arguments:

        glyphname:  # Name of glyph to lookup in each masters
        axes:  # Dictionary with axis values of masters pair.
            [<master>, <master>]

            master dictionary described as

                master:
                    axis:
                        [<float>, <float>]
                    name:
                        <string>
                    glyphs:
                        [<glyph>]

                glyph:
                    name:
                        <string>
                    contours:
                        [[<point>, ...], ...]

                point:
                    x:
                    y:
                      <float>
                    x1:
                    y1:
                    x2:
                    y2:
                      <float>
    """
    content = ''
    listwidth = '{W1}*{A1}_width + {AXIS} * ({W2}*{A2}_width - {W1}*{A1}_width)'

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

    begin = 'beginfontchar ({g}, ({args}) + spacing_{g}R) * width_{g}, 0, 0 );\n'
    content += begin.format(args=' + '.join(beginfontchar), g=glyphname)

    for axisalias in axes:
        axis = axes[axisalias]

        lmaster = axis[0]
        rmaster = axis[1]

        index = 1
        for contour in lmaster['glyphs'][glyphname]['contours']:
            for point in contour:
                str = '{A}px{n}={x:.2f} * {EX};Apy{n}={y:.2f} * {EY}\n'
                str = str.format(A=lmaster['alias'], n=index,
                                 EX=lmaster['axis'][0] or 1,
                                 EY=lmaster['axis'][1] or 1,
                                 x=point['x'] / 100.,
                                 y=point['y'] / 100.)
                content += str
                index += 1

        index = 1
        for contour in rmaster['glyphs'][glyphname]['contours']:
            for point in contour:
                str = '{A}px{n}={x:.2f} * {EX};Apy{n}={y:.2f} * {EY}\n'
                str = str.format(A=rmaster['alias'], n=index,
                                 EX=rmaster['axis'][0] or 1,
                                 EY=rmaster['axis'][1] or 1,
                                 x=point['x'] / 100.,
                                 y=point['y'] / 100.)
                content += str
                index += 1

    return content


