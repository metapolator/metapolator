from lxml import etree
import codecs
import os.path

def buildfname ( filename ):
    try :
      basename,extension = filename.split('.')
    except :
           extension="garbage"
           basename=""
    return [basename,extension]

# UFO directory :

#dirnamea = 'MP_a.ufo/glyphs/'
#dirnamea = 'MPExo-ExtraBold.ufo/glyphs/'
dirnamea = 'MPI_Exo-Light.ufo/glyphs/'


charlista = [f for f in os.listdir(dirnamea) ]

for ch1 in charlista : 
    fnb,ext=buildfname (ch1)
    if ext in ["glif"]  :

        fname = dirnamea+ch1  
        aa = []
        bb = []
        with open(fname) as f:
            for line in f:
                aa.append(line)
                bb.append(0)

        f.close()
        print fname
        i=-1
        lt = -1 
        it = -1 

        for  l in aa :
            i=i+1
            if l.count("<contour>")>0 :
                ics = 1
                lt = 0
            if (l.count ("<point") >0 and l.count ("type") > 0) :
                lt=lt+1   
                if lt == 1 :
                    it =i
         #       print "check",lt,i,it
                if ((lt >1) and ((i-1) == it)) :
         # insert extra controlpoints
                    print "insert extra", it,lt
                    bb[it]=1
                    lt = 1
                    it =i
            else:
                if l.count("</contour>") > 0 :
                   print " check end",it,lt,i
                   if ((lt == 1) and ((i-1) == it)) :
                       print "insert extra end", it,lt
           # insert extra controlpoints
                       bb[it]=1
                       it =0
                       lt = 0

                it = 0
                lt = 0 

        f=open(fname, "w")

        i = -1 
        for a in aa:
            i= i+1
            f.write(a)
            if bb[i] >0:
                f.write('      <point extra="1" /> \n')
                f.write('      <point extra="2" /> \n')

        f.close() 
 
