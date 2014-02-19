rm $1.log
# mf font.mf

perl mf2pt1.pl --encoding=mtp.enc --comment="Copyright (c) 2014" --family="font" --nofixedpitch --fullname="$2" --name="$2" --weight="regular" $1.mf

# sfnt2woff $1.otf && ttf2eot $1.ttf > $1.eot
# sfnt2woff $1.otf > $1.woff

# mv $1.eot static/$1-webfont.eot
# mv $1.woff static/$1-webfont.woff
# mv $1.ttf static/$1-webfont.ttf
mv $1.otf static/$1.otf

rm -rf $1.afm
rm -rf $1.pfb
rm -rf $1.tfm
