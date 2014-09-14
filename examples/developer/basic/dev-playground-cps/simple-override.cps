/* 
 * This example will simply set two parameters for every object in
 * every master in the MP 
 *
 * Usage: 
 *   metapolator dev-playground-cps --parameters label -p xx  .../simple-override.cps
 * 
 * Expected result:
 * ...
 * element:  master#heidi:i(1) glyph#y:i(1) penstroke:i(0) point:i(0)
 * label.base   : 1234
 * label.updated: 1234
 * label.value  : 1234
 * xx.base   : 5
 * xx.updated: 5
 * xx.value  : 5
 * 
 */

* { 
     label : 1234; 
     xx    : 5;
}

