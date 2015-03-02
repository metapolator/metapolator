define([
    './Vector'
  , './utils'
], function(
    Vector
  , utils
) {
    "use strict";

    /**
     * All points in this module are expected instances of
     * metapolator/math/Vector (complex numbers)
     */

    var normalizeAngle = utils.normalizeAngle;

    function hobby(theta, phi) {
        var st = Math.sin(theta)
          , ct = Math.cos(theta)
          , sp = Math.sin(phi)
          , cp = Math.cos(phi)
          ;
        return (
        (2 + Math.sqrt(2) * (st-1/16*sp) * (sp-1/16*st) * (ct-cp)) /
        (3 * (1 + 0.5*(Math.sqrt(5)-1)* ct + 0.5*(3-Math.sqrt(5))*cp))
        );
    }

    /**
     * Returns two distances from the respective on-curve points to their
     * control points on the given curve segment.
     *
     * dir0 and dir1 are the tangent directions as radians or instances
     * of Vector.
     *
     * alpha and beta are the tension parameters. The tensions values alpha
     * and beta have no influence on the resulting distance of each other.
     *
     * Tensions are bigger the closer they are to their on-curve points.
     * When using Infinity as a tension the returned magnitude is 0;
     * When using 0 as a tension the returned magnitude is Infinity.
     *    When the tension is 0 and z0 equals z1 its resulting
     *    magnitude is NaN; in this case it is short circuited into
     *    returning Infinity, which is OK as a behavior; because it obeys
     *    the rule above, also it's compatible with the reverse operation
     *    magnitude2tension.
     */
    function _tension2magnitude(z0, dir0, alpha, beta, dir1, z1) {
        var diff_z1z0 = z1['-'](z0)
          , angle_z1z0 = diff_z1z0.angle()
          , magnitude_z1z0 = diff_z1z0.magnitude()
            // calculating this using the polar form helps us by not
            // getting into trouble when z1['-'](z0) is <Vector 0, 0>
            // because that would cause a division by 0 when calculating
            // theta and pi using cartesian arithmetic.
          , theta = normalizeAngle(dir0 - angle_z1z0)
          , phi = normalizeAngle(angle_z1z0 - dir1)
          , u, v;

        if(alpha !== undefined)
            u = (magnitude_z1z0 === 0 && (alpha === 0 || alpha === Infinity))
                ? (alpha === 0 ? Infinity : 0)
                : magnitude_z1z0 * hobby(theta, phi) / alpha
                ;
        if(beta !== undefined)
            v = (magnitude_z1z0 === 0 && (beta === 0 || beta === Infinity))
                ? (beta === 0 ? Infinity : 0)
                : magnitude_z1z0 * hobby(phi, theta) / beta
                ;
        return [u, v];
    }

    function tension2magnitude(z0, dir0, alpha, beta, dir1, z1) {
        var uv = _tension2magnitude(z0, dir0, alpha, beta, dir1, z1);
        if(uv[0] === undefined) uv[0] = NaN;
        if(uv[1] === undefined) uv[1] = NaN;
        return uv;
    }

    function tension2magnitudeOut(z0, dir0, alpha, dir1, z1) {
        return _tension2magnitude(z0, dir0, alpha, undefined, dir1, z1)[0];
    }

    function tension2magnitudeIn(z0, dir0, beta, dir1, z1) {
        return _tension2magnitude(z0, dir0, undefined, beta, dir1, z1)[1];
    }

    /**
     * dir0 and dir1 are radians
     * alpha, beta are the magnitudes
     *
     * Also
     * [Infinity, Infinity] instead of [NaN, NaN] when the magnitudes are 0
     * And it can still return a tension for one control when the other
     * control is 0
     */
    function _magnitude2tension(z0, dir0, alpha, beta, dir1, z1) {
        var uv, u, v
            // 1 is the default tension
          , _alpha = alpha === 0 || alpha === undefined ? undefined : 1
          , _beta = beta === 0 || beta === undefined ? undefined : 1
          ;
        if(_alpha || _beta)
            uv = _tension2control(z0, dir0, _alpha, _beta, dir1, z1);

        if(alpha === 0)
            u = Infinity;
        else if (alpha !== undefined)
            u = uv[0]['-'](z0).magnitude()/alpha;

        if(beta === 0)
            v = Infinity;
        else if (beta !== undefined)
            v = uv[1]['-'](z1).magnitude()/beta;

        return[u, v];
    }

    function magnitude2tension(z0, dir0, alpha, beta, dir1, z1) {
        var uv = _magnitude2tension(z0, dir0, alpha, beta, dir1, z1);
        if(uv[0] === undefined) uv[0] = NaN;
        if(uv[1] === undefined) uv[1] = NaN;
        return uv;
    }

    function magnitude2tensionOut(z0, dir0, alpha, dir1, z1) {
        return _magnitude2tension(z0, dir0, alpha, undefined, dir1, z1)[0];
    }

    function magnitude2tensionIn(z0, dir0, beta, dir1, z1) {
        return _magnitude2tension(z0, dir0, undefined, beta, dir1, z1)[1];
    }

    /**
     * returns vectors for the absolute positions of the control points
     * used to be called hobby2cubic
     */
    function _tension2control(z0, dir0, alpha, beta, dir1, z1) {
        var d0, d1, uv, u, v;

        if(dir0 instanceof Vector || dir1 instanceof Vector)
            console.warn('It is deprecated to use Vectors for dir0 or dir1');

        d0 = (dir0 instanceof Vector) ? dir0.arg() : dir0;
        d1 = (dir1 instanceof Vector) ? dir1.arg() : dir1;

        uv = _tension2magnitude(z0, d0, alpha, beta, d1, z1);
        if(uv[0] !== undefined)
            u = Vector.fromPolar(uv[0], d0)['+'](z0);
        if(uv[1] !== undefined)
            v = z1['-'](Vector.fromPolar(uv[1], d1));
        return [u, v];
    }

    function tension2control(z0, dir0, alpha, beta, dir1, z1) {
        var uv = _tension2control(z0, dir0, alpha, beta, dir1, z1);
        if(uv[0] === undefined) uv[0] = new Vector(NaN, NaN);
        if(uv[1] === undefined) uv[1] = new Vector(NaN, NaN);
        return uv;
    }

    function tension2controlOut (z0, dir0, alpha, dir1, z1) {
        return tension2control(z0, dir0, alpha, undefined, dir1, z1)[0];
    }

    function tension2controlIn (z0, dir0, beta, dir1, z1) {
        return tension2control(z0, dir0, undefined, beta, dir1, z1)[1];
    }

    /**
     * If you need both tension values, this version is more efficient
     * than calling posttension and pretension.
     */
    function control2tension(p0, p1, p2, p3) {
        var diffp0p1 = p1['-'](p0)
          , diffp3p2 = p3['-'](p2)
          , dir0 = diffp0p1.angle()
          , dir1 = diffp3p2.angle()
          , alpha = diffp0p1.magnitude()
          , beta = diffp3p2.magnitude()
          ;
        return _magnitude2tension(p0, dir0, alpha, beta, dir1, p3);
    }
    /**
     * returns the tension for the first on-curve point.
     */
    function control2tensionOut(p0, p1, p2, p3) {
        var diffp0p1 = p1['-'](p0)
          , diffp3p2 = p3['-'](p2)
          , dir0 = diffp0p1.angle()
          , dir1 = diffp3p2.magnitude()
          , alpha = diffp0p1.magnitude()
          ;
        return magnitude2tensionOut(p1, dir0, alpha, dir1, p3);
    }
    /**
     * returns the tension for the second on-curve point
     */
    function control2tensionIn(p0, p1, p2, p3) {
        var diffp0p1 = p1['-'](p0)
          , diffp3p2 = p3['-'](p2)
          , dir0 = diffp0p1.angle()
          , dir1 = diffp3p2.magnitude()
          , beta = diffp3p2.magnitude()
          ;
        return magnitude2tensionIn(p1, dir0, beta, dir1, p3);
    }

    return {
        hobby: hobby

      , tension2magnitude: tension2magnitude
      , tension2magnitudeOut: tension2magnitudeOut
      , tension2magnitudeIn: tension2magnitudeIn

      , magnitude2tension: magnitude2tension
      , magnitude2tensionOut: magnitude2tensionOut
      , magnitude2tensionIn: magnitude2tensionIn

      , tension2control: tension2control
      , hobby2cubic: tension2control // DEPRECATED
      , tension2controlOut: tension2controlOut
      , tension2controlIn: tension2controlIn

      , control2tension: control2tension
      , tensions: control2tension // DEPRECATED
      , control2tensionOut: control2tensionOut
      , posttension: control2tensionOut // DEPRECATED
      , control2tensionIn: control2tensionIn
      , pretension: control2tensionIn // DEPRECATED
    };
});
