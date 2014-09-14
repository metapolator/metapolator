/* 
 * This example will set the same parameter at different levels on the cascade tree.
 * The most specific setting should win.
 *
 * Usage: 
 *   metapolator dev-playground-cps --parameters label -p xx  .../cascading-override.cps
 * 
 * Expected result:
 *   Using -s 'master#heidi:i(1) glyph#y' 
 *     gives xx    value of 6
 *           label value of whY not
 *   Using -s 'master#heidi:i(1) glyph#y penstroke:i(1) point:i(0)' 
 *     gives xx    value of 7
 *           label value of 1234
 */

* { 
     label : 1234; 
     xx    : 5;
}

point {
     xx    : 7;
}


glyph#y {
     label : 'whY not';
     xx    : 6;
}



