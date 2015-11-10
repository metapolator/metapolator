* {
    /* expects __args to be a list of 4 Vectors
    * The first two define line one the last two define line two
    * returns __intersection a Vector.
    */
    __A1: __args[0];
    __A2: __args[1];
    __B1: __args[2];
    __B2: __args[3];
    __dirA: __A1 - __A2;
    __dirB: __B1 - __B2;
    __slopeA: __dirA:y / __dirA:x;
    __slopeB:  __dirB:y / __dirB:x;
    /* Point–slope form: y - Py = slope * (x - Px)
    * where P is any point on the line
    * let x be zero to get the intersection at y:
    * y = slope * (x - Px) + Py
    */
    __yInterseptA: __slopeA * (0 - __A1:x) + __A1:y;
    __yInterseptB: __slopeB * (0 - __B1:x) + __B1:y;
    __X: (__yInterseptB - __yInterseptA) / (__slopeA - __slopeB);
    __Y: __slopeA * __X + __yInterseptA;
    __intersection: Vector __X __Y
}
