/* change the weight */
/* needs a "base" */
@dictionary {
    point > left,
    point > right {
        length: base:onLength*weightFactor + weightSummand;
    }
}

point > left,
point > right {
    onLength: length;
}

/* define  higher level parameters, override in your master */
@dictionary {
    point > left,
    point > right,
    p {
        weightFactor: 1;
        weightSummand: 0;
    }
}
