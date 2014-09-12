/*
Please consume this with caution, this are not recommendations how to do things, we just show in a simple example some of the current possibilities with CPS.
*/


* {
    on: onIntrinsic;
    in: inIntrinsic;
    out: outIntrinsic;
    inDir: inDirIntrinsic;
    outDir: outDirIntrinsic;
    inTension: 0;
    outTension: 0;
    inIntrinsic: Vector 0 0;
    outIntrinsic: Vector 0 0;
     inDirIntrinsic: 0;
    outDirIntrinsic: 0;
}

point > center {
    on: onIntrinsic + parent:skeleton:on;
    in: inIntrinsic + on;
    out: outIntrinsic + on;
}

/*

@namespace rules have the purpose to keep you from
repeating parts of your selectors by just prepending
their selector to every selector inside the @namespace rule.

we use the #god id of the master to raise the specificity of the selector. This is because our selectors in bod.css are already very specific and we want to be even more specific in here.

We plan some changes on the CPS engine that will remove the need for a measure like this in many cases.

*/

@namespace(master#god#god#god#god) {

    /*
    @dictionary rules let you define custom key-value-pairs that can be referenced from other CPS rules. The scope of the defined keys is set by the selectors of the rules defined here;
    */
    @dictionary {
        /* calculate the stem alignement a point */
        penstroke:i(1) > point > center {
            rightOffset: (Polar parent:right:len parent:right:onDir);
            /* select another point and read the x value of its on parameter */
            stemAlignX: S"master#god glyph#a penstroke:i(0) point:i(2) left":on:x + rightOffset:x;
            stemAlignY: (onIntrinsic + parent:skeleton:on):y;
        }
    }
    /* this aligns the fourth (index 3) point of the second penstroke of the a to the stem of the first stroke*/
    glyph#a penstroke:i(1) point:i(3) center {
        on: Vector stemAlignX stemAlignY;
    }

    point > center {
        /*
         change the values after Scaling to change the width and height of only the #god master

         we actually create a transformation matrix and apply it to a vector
         */
        on: (Scaling 1.6 1) * (onIntrinsic + parent:skeleton:on);
    }
}

/*
 In order to affect the pen width of both masters change the number multiplied to onLength in the len rule
*/
@dictionary {
    /* note that this "len" is only set for #god */
    master#god point > left,
    master#god point > right {
        len: onLength * 1.3;
    }
}

/*
this rule let's us access the analogue items of the current item in a different master
we inherit len of #god in #bod
*/
@dictionary {
    master#bod point > right,
    master#bod point > left {
        glyphIndex: parent:parent:parent:index;
        god: S"master#god";
        godGlyph: god:children[glyphIndex];
        penstrokeIndex: parent:parent:index;
        godPenstroke: godGlyph:children[penstrokeIndex];
        pointIndex: parent:index;
        godPoint: godPenstroke:children[pointIndex];
        me: godPoint:children[this:index];
        /*
            This could have been done in a one-liner as well, but this results in a very long line:
            S"master#god":children[parent:parent:parent:index]:children[parent:parent:index]:children[parent:index]:children[this:index]:len
        */
        len: me:len;
}
}


point > left,
point > right {
    /*
     note that we are using the len parameter defined above

     Polar is a vector constructor that takes length and angle to create a vector
     */
    on: Polar len onDir + parent:center:on;
    in: inIntrinsic + parent:center:on + parent:center:inIntrinsic + onIntrinsic;
    out: outIntrinsic + parent:center:on + parent:center:outIntrinsic + onIntrinsic;
    inDir: inDirIntrinsic + parent:center:inDir;
    outDir: outDirIntrinsic + parent:center:outDir;
}


point > left {
    onDir: deg 180 + parent:right:onDir;
    onLength: parent:right:onLength;
}
