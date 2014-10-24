/* scale the skeleton */
@dictionary {
    point>center {
        transform: (Scaling widthFactor heightFactor);
    }
}

point > center {
    on: transform * skeleton:on;
    in: transform * skeleton:in;
    out: transform * skeleton:out;
}

/* define  higher level parameters */
@dictionary{
    point > center {
        widthFactor: 1;
        heightFactor: 1;
        /* "skeleton" will have to provide
         * Vectors at its the keys "on|in|out"
         */
        skeleton: parent:skeleton;
    }
}
