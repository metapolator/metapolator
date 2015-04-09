/* all masters use this CPS file by default*/
@dictionary {
    master > glyph {
        true: 1;
        false: 0;
    }
    master > glyph {
        _display: true;
    }
}
@dictionary {
  /* 
    master#base > glyph
  , master#cl > glyph
  , master#web > glyph
  , master#wl > glyph
  , master#ceb > glyph
  */
    master#metapolated > glyph
  , master#interpolated > glyph
  {
        _display: false;
  }
}
