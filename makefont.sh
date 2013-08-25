rm font.log
rm font.tfm
rm font.pfb
rm font.afm

# mf font.mf

perl mf2pt1.pl --encoding=mtp.enc --comment="Copyright (c) 2013" --family="font" --nofixedpitch --fullname="font" --name="font-regular" --weight="regular" $1

sfnt2woff font.otf && ttf2eot font.ttf > font.eot
sfnt2woff font.otf > font.woff

mv font.eot static/font-webfont.eot
mv font.woff static/font-webfont.woff
mv font.ttf static/font-webfont.ttf
mv font.otf static/font.otf
