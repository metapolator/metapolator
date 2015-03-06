/* set up this masters parameters */
@dictionary {
    point > * {
        baseMaster: S"master#base";
    }

    point > left, point > right {
        weightFactor: 1.5;
    }

    point > center {
        widthFactor: 1.5;
        skeleton: parent:skeleton;
    }
}

/* This is a shortcoming of the enhancement approach, the 
 * inheritance approach manages this with ease. changeing the 
 * onLength with lib/weight.cps has no effect here, because the
 * selector used in lib/weight is not as specific as the selector
 * used in base.cps to set point>right 'onLength'
 * 
 * Thus I think the inheritance approach is the winner, because
 * it does not set these specific selectors and thus leaves more freedom
 * to us.
 */
#enhanced#enhanced#enhanced point > right{
    onLength: length;
}
