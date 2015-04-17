@import 'centreline-skeleton-to-symmetric-outline.cps';

glyph {
{{#n}}
    base{{.}}: baseMaster{{.}}:children[index];
{{/n}}
}

contour > p {
    indexGlyph: parent:parent:index;
    indexContour: parent:index;
{{#n}}
    base{{.}}: baseMaster{{.}}
        :children[indexGlyph]
        :children[indexContour]
        :children[index]
        ;
{{/n}}
}

point > * {
    indexGlyph: parent:parent:parent:index;
    indexPenstroke: parent:parent:index;
    indexPoint: parent:index;
{{#n}}
    base{{.}}: baseMaster{{.}}
        :children[indexGlyph]
        :children[indexPenstroke]
        :children[indexPoint]
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
    _p{{.}}: proportion{{.}}*interpolationUnit;
{{/n}}
}

glyph {
    advanceWidth: 0{{#n}}
        + base{{.}}:advanceWidth * _p{{.}}{{/n}};
    advanceHeight: 0{{#n}}
        + base{{.}}:advanceHeight * _p{{.}}{{/n}};
}

point > left,
point > right,
point > center,
contour > p {
    on: 0{{#n}}
        + base{{.}}:on * _p{{.}}{{/n}};
    in: 0{{#n}}
        + base{{.}}:in * _p{{.}}{{/n}};
    out: 0{{#n}}
        + base{{.}}:out * _p{{.}}{{/n}};
}


/****
 * set up the super masters of this master and the proportions:

* {
{{#n}}
    baseMaster{{.}}: S"master#anyName_{{.}}";
{{/n}}
{{#n}}
    proportion{{.}}: 1;
{{/n}}
}

****/
