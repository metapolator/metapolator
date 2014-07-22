define([
    'complex/Complex'
], function(
    Vector
) {
    "use strict";
    
    /**
     * All points in this module are expected to be complex numbers like
     * complex/Complex or models/CPS/dataTypes/Vector (which inherits
     * from Complex)
     */
    
    function hobby(theta, phi) {
        var st = Math.sin(theta)
          , ct = Math.cos(theta)
          , sp = Math.sin(phi)
          , cp = Math.cos(phi)
          ;
        return (
        (2 + Math.sqrt(2) * (st-1/16*sp) * (sp-1/16*st) * (ct-cp)) /
        (3 * (1 + 0.5*(Math.sqrt(5)-1)* ct + 0.5*(3-Math.sqrt(5))*cp))
        )
    }
    
    // hobby2cubic
    /**
     * There is freedom to allow tangent directions and “tension”
     * parameters to be specified at knots, and special “curl” parameters
     * may be given for additional control near the endpoints
     * of open curves.
     * 
     * w0 and w1 are the tangent directions.
     * alpha and beta are the tension parameters, AKA the length of the
     * control point vector.
     */
    function hobby2cubic(z0, w0, alpha, beta, w1, z1) {
        var theta, phi, e, u, v;
        theta = w0['/'](z1['-'](z0)).arg();
        phi = z1['-'](z0)['/'](w1).arg();
        
        e = new Vector(Math.E);
        u = z0['+'](
                e['**'](new Vector(0, 1)['*'](theta))
            ['*'] (z1['-'](z0))
            ['*'] (hobby(theta, phi))
            ['/'] (alpha)
        );
        v = z1['-'](
                e['**'](new Vector(0, -1)['*'](phi))
            ['*'] (z1['-'](z0))
            ['*'] (hobby(phi, theta))
            ['/'] (beta)
        );
        return [u, v]
    }
    
    /**
     * returns the tension for the first on-curve point.
     */
    function posttension(p0, p1, p2, p3) {
        var u = hobby2cubic(
                        p0,
                        p1['-'](p0) /*direction 1*/,
                        1, 1, // std. tension is 1
                        p3['-'](p2) /*direction 2*/,
                        p3)[0];
        return u['-'](p0).magnitude()/p1['-'](p0).magnitude();
    }
    /**
     * returns the tension for the seccond on-curve point
     */
    function pretension(p0, p1, p2, p3) {
        var v = hobby2cubic(
                            p0,
                            p1['-'](p0) /*direction 1*/,
                            1, 1, // std. tension is 1
                            p3['-'](p2) /*direction 2*/,
                            p3)[1];
        return v['-'](p3).magnitude()/p2['-'](p3).magnitude();
    }
    
    /**
     * If you need both tension values, this version is more efficient
     * Than calling posttension and pretension.
     */
    function tensions(p0, p1, p2, p3) {
        var dir1 = p1['-'](p0) /*direction 1*/
          , dir2 = p3['-'](p2) /*direction 2*/
          , uv = hobby2cubic(
                            p0,
                            dir1,
                            1, 1, // std. tension is 1
                            dir2,
                            p3)
          , u = uv[0]
          , v= uv[1]
          ;
        return[
              u['-'](p0).magnitude()/dir1.magnitude()
            , v['-'](p3).magnitude()/dir2.magnitude()
        ]
    }

    return {
        hobby: hobby
      , hobby2cubic: hobby2cubic
      , posttension: posttension
      , pretension: pretension
      , tensions: tensions
    }
})
