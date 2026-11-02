glyph {
{{#n}}
    base{{.}}: baseMaster{{.}}[Selector "glyph#" + this:id];
{{/n}}
}

contour > p {
    indexContour: parent:index;
{{#n}}
    base{{.}}: parent:parent:base{{.}}
        :children[indexContour]
        :children[index]
        ;
{{/n}}
}

center {
    indexPenstroke: parent:index;
{{#n}}
    base{{.}}: parent:parent:base{{.}}
        :children[indexPenstroke]
        :children[index]
        ;
{{/n}}
}

center > * {
    indexPenstroke: parent:parent:index;
    indexCenter: parent:index;
{{#n}}
    base{{.}}: parent:parent:parent:base{{.}}
        :children[indexPenstroke]
        :children[indexCenter]
        :children[index]
        ;
{{/n}}
}

* {
    /* Ensure that the used proportions sum up to 1.
     * Any other value produces usually unwanted effects.
     * If you don't want this in your master redefine it as
     * interpolationUnit: 1;
     */
    interpolationUnit: 1/(0{{#n}}
        + proportion{{.}}{{/n}});
{{#n}}
    _p{{.}}: proportion{{.}} * interpolationUnit;
{{/n}}
}

glyph {
    width: 0{{#n}}
        + base{{.}}:width * _p{{.}}{{/n}};
    height: 0{{#n}}
        + base{{.}}:height * _p{{.}}{{/n}};
}

center,
center > left,
center > right,
contour > p {
    on: Vector 0 0{{#n}}
        + base{{.}}:on * _p{{.}}{{/n}};
    in: Vector 0 0{{#n}}
        + base{{.}}:in * _p{{.}}{{/n}};
    out: Vector 0 0{{#n}}
        + base{{.}}:out * _p{{.}}{{/n}};
}

component {
    baseGlyphName: baseNode:baseGlyphName;
    /* FIXME: there's currently no way of interpolating transformation matrixes
see: https://github.com/graphicore/Atem-Property-Language/issues/1
    */
    transformation: baseNode:transformation;
{{#n}}
    base{{.}}: parent:base{{.}}
        :children[index]
        ;
{{/n}}
}

master * {
{{#n}}
    baseMaster{{.}}: master:baseMaster{{.}};
{{/n}}
{{#n}}
    proportion{{.}}: master:proportion{{.}};
{{/n}}
}

/****
 * set up the baseMasters and the proportions of the <MOM Master>:

* {
{{#n}}
    baseMaster{{.}}: S"master#anyName_{{.}}";
{{/n}}
{{#n}}
    proportion{{.}}: 1;
{{/n}}
}

****/
