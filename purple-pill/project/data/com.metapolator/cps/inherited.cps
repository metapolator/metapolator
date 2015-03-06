/* set up this masters parameters */
@dictionary {
    point > * {
        baseMaster: S"master#base";
    }
    
    point > left, point > right {
        weightFactor: .5;
    }
    
    point > center {
        widthFactor: .5;
        skeleton: base;
    }
}
