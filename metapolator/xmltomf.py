class DifferentZPointError(Exception):
    pass


def  xmltomf1(master, glyphA, glyphB=None):
    """
        save current points to mf file
        
        master is an instance of models.Master
        glyph is an instance of models.Glyph
    """
    
    if not glyphB:
        glyphB = glyphA
	fip=open(dirnamep1+"/"+newfilename, "w")
	fip.write( """% File parsed with Metapolator %

% box dimension definition %
""")
	w = str(glyphA.width / 100)
	w2 = str(glyphB.width / 100)
	g = glyphA.name  # get from glyphA as we sure that glypha and glyphb exist in font project	
	u = glyphA.unicode

	fip.write("\n")
	fip.write( 'beginfontchar(' + glyph.name + ', ((' + w + '*A_width + metapolation * (' + w2 + '*B_width - ' + w + '*A_width)) + spacing_' + g + "R) * width_" +  g  + ", 0, 0 );")




# point coordinates font A ################

	fip.write("\n")
	fip.write( """ % point coordinates font A""")

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    inattr = 0
    i = 1
    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y
        im = param.pointname

	zzn.append(i)
	i += 1

	if im == znamer.group(0) :
	    fip.write("\n")
	    fip.write( "px" + znamer.group(0)[1:] + " := " + x + "u ; "   +  "py"+ znamer.group(0)[1:] + " := " + y + "u ;"  ) 
	if im == znamel.group(0) :
	    fip.write("\n")
	    fip.write( "px" + znamel.group(0)[1:] + " := " + x + "u ; "   +  "py"+ znamel.group(0)[1:] + " := " + y + "u ;"   )






# reading mid points Font A ################

	fip.write("\n")
	fip.write( """% reading mid points font A""" )

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    inattr = 0
    i = 1
    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y
        im = param.pointname

	zzn.append(i)
	i += 1
            
        if im == znamer.group(0) or im == znamel.group(0): 
		
			fip.write("\n")
			fip.write( ".5(px"+ znamel.group(0)[1:] + " + px" + znamer.group(0)[1:] + ") = x2" + zname.group(0)[1:-1] +"0;"  ) 
			fip.write("\n")
			fip.write( ".5(py"+ znamel.group(0)[1:] + " + py" + znamer.group(0)[1:] + ") = y2" + zname.group(0)[1:-1] +"0;"   )






# reading fake 100 l and r points Font A ################


	fip.write("\n")
    fip.write( """% fake extra l an r for metafont""") 

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    inattr = 0
    i = 1
    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y
        im = param.pointname

	zzn.append(i)
	i += 1
            
        if im == znamer.group(0) or im == znamel.group(0): 

		fip.write("\n")
		fip.write( "px"+ znamel.group(0)[1:] + " = x"+ znamel.group(0)[1:-1] + "Bl; py"+ znamel.group(0)[1:] + " = y"+ znamel.group(0)[1:-1] + "Bl; ") 
		fip.write("\n")
		fip.write( "px"+ znamer.group(0)[1:] + " = x"+ znamer.group(0)[1:-1] + "Br; py"+ znamer.group(0)[1:] + " = y"+ znamer.group(0)[1:-1] + "Br; " )





# reading pen widhts Font A ################

	fip.write("\n")
	fip.write( """% pen width""") 

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    inattr = 0
    i = 1
    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y
        im = param.pointname

	zzn.append(i)
	i += 1

	if im == znamer.group(0) or im == znamel.group(0): 

		fip.write("\n")
		fip.write( "dist"+ znamel.group(0)[1:-1] + " := length (z"+ znamel.group(0)[1:-1] + "Bl-" + "z"+ znamel.group(0)[1:-1] + "Br) ;" )






# reading l and r as ppxl and ppxr font B ################

	fip.write("\n")
	fip.write( """ % point coordinates font B""")

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='B',
                                  glyphname=glyphB.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    inattr = 0
    i = 1
    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y
        im = param.pointname

	zzn.append(i)
	i += 1

	if im == znamer.group(0) :
	    fip.write("\n")
	    fip.write( "ppx" + znamer.group(0)[1:] + " := " + x + "u ; "   +  "ppy"+ znamer.group(0)[1:] + " := " + y + "u ;"   )

	if im == znamel.group(0) :
	    fip.write("\n")
	    fip.write( "ppx" + znamel.group(0)[1:] + " := " + x + "u ; "   +  "ppy"+ znamel.group(0)[1:] + " := " + y + "u ;"   )




# reading mid points Font B ################

	fip.write("\n")
	fip.write( """% reading mid points font B""" )

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='B',
                                  glyphname=glyphB.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    inattr = 0
    i = 1
    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y
        im = param.pointname

	zzn.append(i)
	i += 1

        if im == znamer.group(0) or im == znamel.group(0): 

			fip.write("\n")
			fip.write( ".5(ppx"+ znamel.group(0)[1:] + " + ppx" + znamer.group(0)[1:] + ") = x2" + zname.group(0)[1:-1] +"A;" )  
			fip.write("\n")
			fip.write( ".5(ppy"+ znamel.group(0)[1:] + " + ppy" + znamer.group(0)[1:] + ") = y2" + zname.group(0)[1:-1] +"A;"  ) 




# reading fake 100 l and r points Font B ################

	fip.write("\n")
    fip.write( """% fake extra l an r for font B""" )

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='B',
                                  glyphname=glyphB.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    inattr = 0
    i = 1
    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y
        im = param.pointname

	zzn.append(i)
	i += 1

        if im == znamer.group(0) or im == znamel.group(0): 
		 
			fip.write("\n")
			fip.write( "ppx"+ znamel.group(0)[1:] + " = x"+ znamel.group(0)[1:-1] + "Cl; ppy"+ znamel.group(0)[1:] + " = y"+ znamel.group(0)[1:-1] + "Cl; " )
			fip.write("\n")
			fip.write( "ppx"+ znamer.group(0)[1:] + " = x"+ znamer.group(0)[1:-1] + "Cr; ppy"+ znamer.group(0)[1:] + " = y"+ znamer.group(0)[1:-1] + "Cr; " )





# reading pen widths Font B ################

	fip.write("\n")
	fip.write( """% pen width Font B""" )

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='B',
                                  glyphname=glyphB.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    inattr = 0
    i = 1
    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y
        im = param.pointname

	zzn.append(i)
	i += 1

        if im == znamer.group(0) or im == znamel.group(0): 

		    fip.write("\n")
		    fip.write( "dist"+ znamel.group(0)[1:-1] + "B := length (z"+ znamel.group(0)[1:-1] + "Cl-" + "z"+ znamel.group(0)[1:-1] + "Cr) ;" )
			




# reading pen angle Font A ################

	fip.write("\n")
	fip.write( """% pen angle Font A""" )

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)
    inattr = 0
    i = 1
    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)
        
        im = param.pointname

	zzn.append(i)
	i += 1

        if im == znamer.group(0) or im == znamel.group(0): 

			fip.write("\n")
			fip.write( "ang"+ znamel.group(0)[1:-1] + " := angle((" + znamel.group(0)[0:-1] + "Br + (metapolation * (" + znamel.group(0)[0:-1] + "Cr -" + znamel.group(0)[0:-1] + "Br))) - (" + znamel.group(0)[0:-1] + "Bl + (metapolation * (" + znamel.group(0)[0:-1] + "Cl -" + znamel.group(0)[0:-1] + "Bl))));" )





# reading extra pen angle Font B  ################

    fip.write("\n")
    fip.write("""% test extra pen angle Font B""")

    inattr = 0
    ivn = 0
    strz = ""
    zznb = []

    angle = []
    angleval = []
    startp = []
    startpval = []

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='B',
                                  glyphname=glyphB.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

    i = 1
    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        istartp = param.startp
        iangle = param.angle

        if znamel and im == znamel.group(0):
            zznb.append(i)
            if istartp is not None:
                istartpval = param.startp
                startp.append("startp")
                startpval.append(istartpval)

            if iangle is not None:
                iangleval = param.angle
                angle.append("angle")
                angleval_B.append(iangleval)
            else:
                angle.append("")
                angleval_B.append(0)
    
    # passing angleval_B to extra pen angle Font A


    # reading extra pen angle Font A

    fip.write("\n")
    fip.write("""% test extra pen angle Font A""")

    inattr = 0
    ivn = 0
    strz = ""
    zzn = []

    angle = []
    angleval = []
    startp = []
    startpval = []

    compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
    itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

    i = 1
    for item in itemlist:
        compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname

        # x and y are attributes of GlyphOutline
        # another attributes are in GlyphParam, so we have to make query
        # to that to get attributes
        istartp = param.startp
        iangle = param.angle

        if znamel and im == znamel.group(0):
            zzn.append(i)
            if istartp is not None:
                istartpval = param.startp
                startp.append("startp")
                startpval.append(istartpval)

            if iangle is not None:
                iangleval = param.angle
                angle.append("angle")
                angleval.append(iangleval)
            else:
                angle.append("")
                angleval.append(0)
            i += 1
    zzn.sort()
    zeile = ""
    zeileend = ""
    semi = ");"
    
    if len(zzn) != len(zznb):
        # glyphs in A and B have different set of Z-points, so raise exception
        # to handle this case
        raise DifferentZPointError()
        
    for i in range(len(zzn)):
        zitem = i + 1

        if angle[i]:
            angleb = angleval_B[i]
            zeile = "ang" + str(zitem) + " := ang" + str(zitem) + "  " + str(angleval[i]) + "+ (metapolation * (" + str(angleb) + " - " + str(angleval[i]) + " ));"
        else:
            zeile = "ang" + str(zitem) + " := ang" + str(zitem) + ";"

        fip.write("\n")
        fip.write(zeile)
	  



# reading font Pen Positions Font B
	fip.write("\n")
	fip.write( """% penposition font B""" )

	inattr=0   
	ivn = 0
	strz = ""
	zzn = []

	penwidth = []
	penwidthval = []
	B_penwidthval = []

	compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='B',
				  glyphname=glyphB.name)
	itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

	i = 1
	  
	for item in itemlist:
		compositefilter_kwargs['pointnr'] = item.pointnr
		param = models.GlyphParam.get(**compositefilter_kwargs)

		znamer = re.match('z(\d+)r', param.pointname)
		znamel = re.match('z(\d+)l', param.pointname)
		zname = re.match('z(\d+)l', param.pointname)

		x = item.x
		y = item.y

		im = param.pointname
		ipenwidth = param.penwidth   


		if znamel and im == znamel.group(0):
		    zzn.append(i)
		    if ipenwidth is not None :
			ipenwidthval = param.penwidth
			penwidth.append("penwidth")
			B_penwidthval.append(ipenwidthval)
		    else:
			penwidth.append("")
			B_penwidtval.append(0)


# when using 4-spaces instead tabs it looks beatiful :)
# any <> must be changed to !=
# any != None must be changed to `is not None` 


		
# reading Pen Positions Font A

	fip.write("\n")
	fip.write( """% penposition font A""" )

	inattr=0   
	ivn = 0
	strz = ""
	zzn = []

	# create empty variable list

	stemcutter = []
	stemcutterval = []

	inktrap_l = []
	inktrap_lval = []

	inktrap_r = []
	inktrap_rval = []

	penwidth = []
	penwidthval = []
	A_penwidthval = []

	comp = []
	compval = []
	A_compval = []

	compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
				  glyphname=glyphA.name)
	itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

	i = 1
	  
	for item in itemlist :
		compositefilter_kwargs['pointnr'] = item.pointnr
		param = models.GlyphParam.get(**compositefilter_kwargs)

		x = item.x
		y = item.y
		im = item.name
		istemcutter = param.stemcutter
		iinktrap_l = param.inktrap_l
		iinktrap_r = param.inktrap_r
		ipenwidth = para.penwidth
		icomp = param.comp

		# have to check for znamel as it can raise exception when access 
		# to group(0)
		if znamel and im == znamel.group(0):
		    zzn.append(i)


		# do not delete that lines while you are sure
		if im == znamel or im == znamer:

		    if istemcutter is not None:
			istemcutterval = param.stemcutter
			stemcutterval.append(istemcutterval)

		    if iinktrap_l is not None:
			iinktrap_lval = param.inktrap_l
			inktrap_l.append("inktrap_l")
			inktrap_lval.append(iinktrap_lval)

		    if iinktrap_r is not None:
			iinktrap_rval = param.inktrap_r
			iktrap_r.append("inktrapcut")
			inktrap_rval.append(iinktrap_rval)

		    if ipenwidth is not None:
			ipenwidthval = param.penwidth
			penwidth.append("penwidth")
			A_penwidthval.append(ipenwidthval)

		    if icomp is not None:
			icompval = param.comp
			comp.append("comp")
			compval.append(icompval)

		zzn.sort()
		zeile =""
		zeileend =""
		semi = ";"
		close = ")"
		for i in range (0, len(zzn)) :
		  zitem = zzn[i]
		  
		  zitemb = zzn[i]
		  zitemc = zzn[i-1]

	## default string
		
		  zeile = ""

		  if penwidth[i] <> "" :
		    zeile = zeile +"""penpos"""  +str(zitem) + "((" + str(A_penwidthval[i]) +" + metapolation * (" + str(B_penwidthval[i]) + " - " + str(A_penwidthval[i]) + ")) * " + "(dist" +str(zitem) + " + (A_px + metapolation * (B_px - A_px)) + ((A_skeleton/50 + metapolation * (B_skeleton/50-A_skeleton/50)) * dist" +str(zitem) + "))"
		  else :
		    zeile = zeile + """penpos"""  +str(zitem) + "(dist" +str(zitem) + " + (A_px + metapolation * (B_px - A_px)) + ((A_skeleton/50 + metapolation * (B_skeleton/50-A_skeleton/50)) * dist" +str(zitem) + ")"


		  if stemcutter[i] <> "" :
		    zeile = zeile + "-" + stemcutter[i] + "(" +  str(stemcutterval[i]) + ")"      
		 
		  if inktrap_l[i] <> "" :
		    zeile = zeile + "- inktrapcut (" +  str(inktrap_lval[i]) + ")"      
		 
		  if inktrap_r[i] <> "" :
		    zeile = zeile + "- inktrapcut (" +  str(inktrap_rval[i]) + ")"      
	      
		  else: 
		    zeile = zeile 
		  zeile = zeile + ", ang" +str(zitem) + ");"
		  fip.write("\n")
		  fip.write( zeile)







# reading font Pen strokes

	fip.write("\n")
	fip.write( """% test new center (z) points""" )

	mean = ['13','14','26','29','65','67','69','77','78','79','82','83','85','86','87','88','90','94','95','12','27','63','71','80','81','89','2','7','11','28','30','62','64','66','68','70','72','73','75','76','84','4','8','9','15','59','60','61','74','91','92','93']
#des = ['12','27','63','71','80','81','89']
#asc = ['2','7','11','28','30','62','64','66','68','70','72','73','75','76','84']
	cap = ['1','3','5','6','10','16','17','18','19','20','21','22','23','24','25','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58']
#box = ['4','8','9','15','59','60','61','74','91','92','93']

	ggroup=""
	gggroup=""

	if g in mean :
	    ggroup = 'xheight'
	    gggroup = 'mean'
		
	if g in cap : 
	    ggroup = 'capital'
	    gggroup = 'cap'

	inattr=0   
	ivn = 0
	stre = " ... "
	strtwo = " .. "
	stline = " -- "
	strz = ""
	zzn = []
	startp = []
	startpval = []

# create empty variable list


	pointshifted= []
	pointshiftedval= []

	pointshiftedy = []
	pointshiftedyval = []

	overx = []
	overxval = []

	overbase = []
	overbaseval = []

	overcap = []
	overcapval = []

	inktrap_l = []
	inktrap_lval = []

	inktrap_r = []
	inktrap_rval = []

	stemshift = []
	stemshiftval = []

	ascpoint = []
	ascpointval = []

	descpoint = []
	descpointval = []


	compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
				  glyphname=glyphA.name)
	itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

	i = 1
# search for parameters
	  
	for item in itemlist :
            compositefilter_kwargs['pointnr'] = item.pointnr
        param = models.GlyphParam.get(**compositefilter_kwargs)

        znamer = re.match('z(\d+)r', param.pointname)
        znamel = re.match('z(\d+)l', param.pointname)
        zname = re.match('z(\d+)l', param.pointname)

        x = item.x
        y = item.y

        im = param.pointname
        ipointshifted = param.pointshifted   
        ipointshiftedy = param.pointshiftedy   
        istartp = param.startp   
        ioverx = param.overx   
        ioverbase = param.overbase   
        iovercap = param.overcap   
        iinktrap_l = param.inktrap_l   
        iinktrap_r = param.inktrap_r   
        istemshift = param.stemshift   
        iascpoint = param.ascpoint   
        idescpoint = param.descpoint   

        if znamel and im == znamel.group(0):
		    zzn.append(i)
	       
	    # do not delete that lines while you are sure
        if im == znamel or im == znamer:

		    if istartp is not None:
		        istartpval = param.startp
		        startp.append("startp")
		        startpval.append(istartpval)

		    if ipointshifted is not None:
		        ipointshiftedval= param.pointshifted
		        pointshifted.append("shifted")
		        pointshiftedval.append(ipointshiftedval)

		    if ipointshiftedy is not None:
		        ipointshiftedyval = param.pointshiftedy
		        pointshiftedy.append("shifted")
		        pointshiftedyval.append(ipointshiftedyval)

		    if ioverx is not None:
		        ioverxval = param.overx
                        overx.append("shifted")
		        overxval.append(ioverxval)

		    if ioverx is not None:
			ioverxval = param.overx
			overx.append("shifted")
			overxval.append(ioverxval)

		    if ioverbase is not None:
			ioverbaseval = param.overbase
			overbase.append("shifted")
			overbaseval.append(ioverbaseval)

	            if iovercap is not None:
			iovercapval = param.overcap
			overcap.append("shifted")
			overcapval.append(iovercapval)

		    if iinktrap_l != None :
			iinktrap_lval = param.inktrap_l
			inktrap_l.append("inktrapcut")
			inktrap_lval.append(iinktrap_lval)

		    if iinktrap_r is not None:
			iinktrap_rval = param.inktrap_r
			inktrap_r.append("inktrapcut")
			inktrap_rval.append(iinktrap_rval)

		    if istemshift is not None:
			istemshiftval = param.stemshift
			stemshift.append("stemshift")
			stemshiftval.append(istemshiftval)

		    if iascpoint is not None:
			iascpointval = param.ascpoint
			ascpoint.append("ascpoint")
			ascpointval.append(iascpointval)

		    if idescpoint is not None:
		        idescpointval = param.descpoint
			descpoint.append("descpoint")
			descpointval.append(idescpointval)



	nnz = 0
	for zitem in zzn :
	  nnz = nnz +1 


	i = 0
	zzn.sort()
	zeile =""
	zeileend =""
	semi = ";"
	close = ")"
	for i in range (0, len(zzn)) :
	  zitem = zzn[i]
	  
	  zitemb = zzn[i]
	  zitemc = zzn[i-1]

## default string

	  zeile =""


	  if ascpoint[i] <> "" :

	     zeile = "z"+str(zitem)+ "=((A_width + metapolation * (B_width - A_width)) * (x2"+ str(zitem)+ "0 + metapolation * (x2"+str(zitem)+"A - x2" +str(zitem)+"0) + spacing_" + g + "L) * width_" + g + ", (y2" +str(zitem)+ "0 + metapolation *(y2"+str(zitem)+ "A - y2" +str(zitem)+ "0))*((A_ascender + metapolation * (B_ascender - A_ascender)) / asc#))"

	  if descpoint[i] <> "" :

	     zeile = "z"+str(zitem)+ "=((A_width + metapolation * (B_width - A_width)) * (x2"+ str(zitem)+ "0 + metapolation * (x2"+str(zitem)+"A - x2" +str(zitem)+"0) + spacing_" + g + "L) * width_" + g + ", (y2" +str(zitem)+ "0 + metapolation *(y2"+str(zitem)+ "A - y2" +str(zitem)+ "0))*((A_descender + metapolation * (B_descender - A_descender)) / desc#))"

	  else :
	  
	     zeile = "z"+str(zitem)+ "=((A_width + metapolation * (B_width - A_width)) * (x2"+ str(zitem)+ "0 + metapolation * (x2"+str(zitem)+"A - x2" +str(zitem)+"0) + spacing_" + g + "L) * width_" + g + ", (y2" +str(zitem)+ "0 + metapolation *(y2"+str(zitem)+ "A - y2" +str(zitem)+ "0))*((A_" + ggroup + " + metapolation * (B_" +ggroup + " - A_" + ggroup + ")) / " + gggroup + "#))"



# parameters 
	  if pointshifted[i] <> "" :
	      zeile = zeile +" shifted (" + str(pointshiftedval[i]) + ")"       


	  if stemshift[i] <> "" :
	      zeile = zeile +" stemshift (" + str(stemshiftval[i]) + ")"       


	  if inktrap_l[i] <> "" :
	      zeile = zeile +" inktrap_l (" + str(inktrap_lval[i]) + ")"       


	  if inktrap_r[i] <> "" :
	      zeile = zeile +" inktrap_r (" + str(inktrap_rval[i]) + ")"       

	 
	  else: 
	     zeile = zeile 
	  zeile = zeile + semi 
	  fip.write("\n")
	  fip.write( zeile)









# # reading penstrokes font B


	inattr=0   
	ivn = 0
	stre = " ... "
	strtwo = " .. "
	stline = " -- "
	strz = ""
	zzn = []

	startp = []
	startpval = []

	doubledash = []
	doubledashvalB = []

	tripledash = []
	tripledashvalB = []

	tension = []
	tensionB = []
	tensionvalB = []

	tensionand = []
	tensionandB = []
	tensionandvalB = []
	tensionandval2B = []

	superright = []
	superrightvalB = []

	superleft = []
	superleftvalB = []

	dir = []
	dirB = []
	dirvalB = []

	dir2 = []
	dir2B = []
	dir2valB = []

	leftp = []
	leftpvalB = []

	rightp = []
	rightpvalB = []

	upp = []
	uppvalB = []

	downp = []
	downpvalB = []

	penshiftedy = []
	penshiftedyvalB = []

	penshifted = []
	penshiftedvalB = []


        compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='B',
                                  glyphname=glyphB.name)
        itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

        i = 1	  
    
	for item in itemlist :
            compositefilter_kwargs['pointnr'] = item.pointnr
            param = models.GlyphParam.get(**compositefilter_kwargs)

            znamer = re.match('z(\d+)r', param.pointname)
            znamel = re.match('z(\d+)l', param.pointname)
            zname = re.match('z(\d+)l', param.pointname)

            x = item.x
            y = item.y
            im = param.pointname

	    idoubledash = param.doubledash  
            itripledash = param.tripledash  
	    idir = param.dir  
	    idir2 = param.dir2  
	    ileftp = param.leftp  
	    iupp = param.upp  
	    irightp = param.rightp  
	    idownp = param.downp  
	    itension = param.tension  
	    itensionand = param.tensionand  
	    isuperright = param.superright  
	    isuperleft = param.superleft  
	    ipenshifted = param.penshifted  
	    ipenshiftedy = param.penshiftedy  

	    if znamel and im == znamel.group(0):
		    zzn.append(i)
	       
	    # do not delete that lines while you are sure
	    if im == znamel or im == znamer:
	        
			if idoubledash is not None:
			    idoubledashval = param.doubledash
			    doubledash.append("doubledash")
			    doubledashvalB.append(idoubledashval)

			if itripledash is not None:
				itripledashval = param.tripledash
				tripledash.append(" ---")
				tripledashvalB.append(itripledashval)

			if idir is not None:
				idirval = param.dir
				dirB.append("dir")
				dirvalB.append(idirval)

			if idir2 is not None:
				idir2val = param.dir2
				dir2B.append("dir")
				dir2valB.append(idir2val)

			if iupp is not None:
				iuppval = param.upp
				upp.append("up")
				uppvalB.append(iuppval)

			if ileftp is not None:
				ileftpval = param.leftp
				leftp.append("left")
				leftpvalB.append(ileftpval)

			if irightp is not None:
				irightpval = param.rightp
				rightp.append("right")
				rightpvalB.append(irightpval)

			if idownp is not None:
				idownpval = param.downp
				downp.append("down")
				downpvalB.append(idownpval)
			  
			if itension is not None:
				itensionval = param.tension
				tensionB.append("tension")
				tensionvalB.append(itensionval)

			if itensionand is not None:
				itensionandval = param.tensionand
				tensionandB.append("tensionand")
				tensionandvalB.append(itensionandval[:3])
				tensionandval2B.append(itensionandval[-3:])

			if isuperright is not None:
				isuperrightval = param.superright
				superright.append("superright")
				superrightvalB.append(isuperrightval)

			if isuperleft is not None:
				isuperleftval = param.superleft
				superleft.append("superleft")
				superleftvalB.append(isuperleftval)

			if idir is not None:
				idirval = param.dir
				dir.append("dir")
				dirvalB.append(idirval)

			if ipenshifted is not None:
				ipenshiftedval = param.penshifted
				penshifted.append("shifted")
				penshiftedvalB.append(ipenshiftedval)

			if ipenshiftedy is not None:
				ipenshiftedyval = param.penshiftedy
				penshiftedy.append("shifted")
				penshiftedyvalB.append(ipenshiftedyval)





# reading font penstrokes Font A 


	fip.write("\n")
	fip.write( """% penstrokes""")
	
	inattr=0   
	ivn = 0
	stre = " ... "
	tripledash = "---"
	strtwo = " .. "
	stline = " -- "
	strz = ""
	zzn = []
	startp = []
	startpval = []

	doubledash = []
	doubledashval = []

	tripledash = []
	tripledashval = []

	tension = []
	tensionval = []

	tensionand = []
	tensionandval = []
	tensionandval2 = []

	superright = []
	superrightval = []

	superleft = []
	superleftval = []

	dir = []
	dirval = []

	leftp = []
	leftpval = []

	rightp = []
	rightpval = []

	upp = []
	uppval = []

	downp = []
	downpval = []

	dir2 = []
	dir2val = []

	leftp2 = []
	leftp2val = []

	rightp2 = []
	rightp2val = []

	upp2 = []
	upp2val = []

	downp2= []
	downp2val = []

	penshiftedy = []
	penshiftedyval = []

	penshifted = []
	penshiftedval = []

	overx = []
	overxval = []

	overbase = []
	overbaseval = []

	overcap = []
	overcapval = []

	overasc = []
	overascval = []

	overdesc = []
	overdescval = []

	cycle = []
	cycleval = []

        compositefilter_kwargs = dict(idmaster=master.idmaster, fontsource='A',
                                  glyphname=glyphA.name)
        itemlist = models.GlyphOutline.filter(**compositefilter_kwargs)

        i = 1	  
    
	for item in itemlist :
            compositefilter_kwargs['pointnr'] = item.pointnr
            param = models.GlyphParam.get(**compositefilter_kwargs)

            znamer = re.match('z(\d+)r', param.pointname)
            znamel = re.match('z(\d+)l', param.pointname)
            zname = re.match('z(\d+)l', param.pointname)

            x = item.x
            y = item.y
            im = param.pointname

	    istartp = param.startp   
	    idoubledash = param.doubledash   
            itripledash = param.tripledash   
	    idir = param.dir   
	    idir2 = param.dir2   
	    ileftp = param.leftp   
	    ileftp2 = param.leftp2   
	    iupp = param.upp   
	    iupp2 = param.upp2   
	    irightp = param.rightp   
	    irightp2 = param.rightp2   
	    idownp = param.downp   
	    idownp2= param.downp2   
	    itension = param.tension   
	    itensionand = param.tensionand   
	    isuperright = param.superright   
	    isuperleft = param.superleft   
	    ipenshifted = param.penshifted   
	    ipenshiftedy = param.penshiftedy   
	    ioverx = param.overx   
	    ioverbase = param.overbase   
	    iovercap = param.overcap   
	    ioverasc = param.overasc   
	    ioverdesc = param.overdesc   
	    icycle = param.cycle   

	    if znamel and im == znamel.group(0):
		    zzn.append(i)
	       
	    # do not delete that lines while you are sure
	    if im == znamel or im == znamer:
	        
			if istartp is not None :
				istartpval = param.startp
				startp.append("penstroke ")
				startpval.append(istartpval)

			if icycle is not None :
				icycleval = param.cycle
				cycle.append("cycle")
				cycleval.append(icycleval)

			if idoubledash is not None :
				idoubledashval = param.doubledash
				doubledash.append(" -- ")
				doubledashval.append(idoubledashval)

			if itripledash is not None :
				itripledashval = param.tripledash
				tripledash.append(" ---")
				tripledashval.append(itripledashval)

			if idir is not None :
				idirval = param.dir
				dir.append("dir")
				dirval.append(idirval)

			if idir2 is not None :
				idir2val = param.dir2
				dir2.append("dir")
				dir2val.append(idir2val)

			if iupp is not None :
				iuppval = param.upp
				upp.append("{up} ")
				uppval.append(iuppval)

			if ileftp is not None :
				ileftpval = param.leftp
				leftp.append("{left} ")
				leftpval.append(ileftpval)

			if irightp is not None :
				irightpval = param.rightp
				rightp.append("{right} ")
				rightpval.append(irightpval)

			if idownp is not None :
				idownpval = param.downp
				downp.append(" {down} ")
				downpval.append(idownpval)

			if idownp2 is not None :
				idownp2val = param.downp2
				downp2.append(" {down} ")
				downp2val.append(idownp2val)

			if iupp2 is not None :
				iupp2val = param.upp2
				upp2.append("{up} ")
				upp2val.append(iupp2val)

			if ileftp2 is not None :
				ileftp2val = param.leftp2
				leftp2.append("{left} ")
				leftp2val.append(ileftp2val)

			if irightp2 is not None :
				irightp2val = param.rightp2
				rightp2.append("{right} ")
				rightp2val.append(irightp2val)

			if itension is not None :
				itensionval = param.tension
				tension.append("tension")
				tensionval.append(itensionval)

			if itensionand is not None :
				itensionandval = param.tensionand
				tensionand.append("tensionand")
				tensionandval.append(itensionandval[:3])
				tensionandval2.append(itensionandval[-3:])

			if isuperright is not None :
				isuperrightval = param.superright
				superright.append("super_qr")
				superrightval.append(isuperrightval)

			if isuperleft is not None :
				isuperleftval = param.superleft
				superleft.append("super_ql")
				superleftval.append(isuperleftval)

			if idir is not None :
				idirval = param.dir
				dir.append("dir")
				dirval.append(idirval)

			if ipenshifted is not None :
				ipenshiftedval = param.penshifted
				penshifted.append("shifted")
				penshiftedval.append(ipenshiftedval)

			if ipenshiftedy is not None :
				ipenshiftedyval = param.penshiftedy
				penshiftedy.append("shifted")
				penshiftedyval.append(ipenshiftedyval)

			if ioverx is not None :
				ioverxval = param.overx
				overx.append("shifted")
				overxval.append(ioverxval)

			if ioverbase is not None :
				ioverbaseval = param.overbase
				overbase.append("shifted")
				overbaseval.append(ioverbaseval)

			if iovercap is not None :
				iovercapval = param.overcap
				overcap.append("shifted")
				overcapval.append(iovercapval)

			if ioverasc is not None :
				ioverascval = param.overasc
				overasc.append("shifted")
				overascval.append(ioverascval)

			if ioverdesc is not None :
				ioverdescval = param.overdesc
				overdesc.append("shifted")
				overdescval.append(ioverdescval)


    
	nnz = 0
	for zitem in zzn :
	    nnz = nnz +1 

	i = 0
	zzn.sort()
	zeile = ""
	semi = ";"
	zeilestart = ""

	if tripledash != None :
	    dash = " --- "
	else :
	    dash = " ... "
    	 
	for i in range (0, len(zzn)) :
	    zitem = zzn[i]
	    zitemsuper = zzn[i+1]  
	    zitemc = zzn[i-1]

## default string

	    zeile =""
	    zeile =  str(startp[i]) +  "z"+str(zitem)+"e"  
	    zeileb =""
	    zeileb = str(startp[i])
	    zeilec = ""
                   	   
	    zeilec = str(startp[i]) + "z"+str(zitem)+"e" 
	    if startp[i+1]=="" : 
# if startp, add parameters
                      
		    dash = " ... "
		    if tripledash[i] <> "" :
		        dash = " --- "
		    else :
		        if doubledash[i] <> "" :
			        dash = " -- "
		        else :
			        if tension[i] <> "" :
			            dash = ""
			        else :
			            if tensionand[i] <> "" :
			                dash = ""
			            else :
			                if superleft[i] <> "" :
			                    dash = ""
			                else :
			                    if superright[i] <> "" :
				                    dash = ""
			                    else :
				                    if dir2[i] <> "" :
				                        dash = ""
				                    else :
				                        if upp2[i] <> "" :
				                            dash = ""
				                        else :
				                            if downp2[i] <> "" :
				                              dash = ""
				                            else :
				                                if rightp2[i] <> "" :
					                                dash = ""
				                                else :
					                                if leftp2[i] <> "" :
					                                    dash = ""



		    if penshifted[i] <> "" :
		      zeile = zeile + " shifted (" + str(penshiftedval[i]) + ")"      

		    if overx[i] <> "" :
		      zeile = zeile + " shifted (0, (A_xheight*pt + metapolation * (B_xheight*pt - A_xheight*pt)) - " + str(overxval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

		    if overbase[i] <> "" :
		      zeile = zeile + " shifted (0, - " + str(overbaseval[i]) + ") - (0, A_over + metapolation * (B_over - A_over))" 

		    if overcap[i] <> "" :
		      zeile = zeile + " shifted (0, (A_capital*pt + metapolation * (B_capital*pt - A_capital*pt)) - " + str(overcapval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

		    if overasc[i] <> "" :
		      zeile = zeile + " shifted (0, (A_ascender*pt + metapolation * (B_ascender*pt - A_ascender*pt )) - " + str(overascval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

		    if overdesc[i] <> "" :
		      zeile = zeile + " shifted (0, (A_descender*pt + metapolation * (B_descender*pt  - A_descender*pt )) - " + str(overdescval[i]) + ") - (0, A_over + metapolation * (B_over - A_over))" 

		    if penshiftedy[i] <> "" :
		      zeile = zeile + " shifted (0, y" + str(penshiftedyval[i]) + ")"      

		    if superleft[i] <> "" :
		      zeile = zeile + strtwo + superleft[i]+"("+str(zitem)+"e," +str(zitemsuper)+"e, ["+str(superleftval[i]) + '+ (metapolation * (' + str(superleftvalB[i])+ '-' +str(superleftval[i]) + '))])' + strtwo      

		    if superright[i] <> "" :
		      zeile = zeile + strtwo + superright[i]+"("+str(zitem)+"e," +str(zitemsuper)+"e, ["+str(superrightval[i]) + '+ (metapolation * (' + str(superrightvalB[i])+ '-' +str(superrightval[i]) + '))])' + strtwo      

		    if upp[i] <> "" :
		      zeile = zeile + "{up}"      

		    if downp[i] <> "" :
		      zeile = zeile + "{down}"      

		    if leftp[i] <> "" :
		      zeile = zeile + "{left}"      

		    if rightp[i] <> "" :
		      zeile = zeile + "{right}"      

		    if dir[i] <> "" :
			  zeile = zeile + " {dir ("+ str(dirval[i]) + " + metapolation * (" + str(dirvalB[i]) + " - " + str(dirval[i]) + "))}"      

	## tension and leftp2

		    if  (tension[i] <> "" and 
			    leftp2[i] <> "") :
			        if tensionB[i] <> "" :
			            zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{left}"  
			        else :
			            zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{left}" 

		    if  (tensionand[i] <> "" and 
			    leftp2[i] <> "") :
			        if tensionandB[i] <> "" :
			            zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{left}"  
			        else :
			            zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandval[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{left}" 
		  
		    else :
		        if leftp2[i] <> "" :
			        zeile = zeile  + ' ... ' + leftp2[i]  

		        else :
			        zeile = zeile 

			   
	## tension and rightp2

			if (tension[i] <> "" and 
			    rightp2[i] <> "") :
			        if tensionB[i] <> "" :
				        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{right}"  
			        else :
				        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{right}" 

			if (tensionand[i] <> "" and 
			    rightp2[i] <> "") :
			        if tensionandB[i] <> "" :
				        zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{right}"  
			        else :
				        zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandval[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{right}" 

			else :
			    if rightp2[i] <> "" :
			        zeile = zeile  + ' ... ' + rightp2[i]  

			    else :
			        zeile = zeile 

	## tension and downp2

			    if (tension[i] <> "" and 
				    downp2[i] <> "") :
				    if tensionB[i] <> "" :
				        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{down}"  
				    else :
				        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{down}" 

			    if (tensionand[i] <> "" and 
				    downp2[i] <> "") :
				    if tensionandB[i] <> "" :
				        zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{down}"  
				    else :
				        zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandval[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{down}" 


			    else :
			        if downp2[i] <> "" :
				        zeile = zeile  + ' ... ' + downp2[i]  

			        else :
				        zeile = zeile  

	## tension and upp2    
		    
				if (tension[i] <> "" and 
			        upp2[i] <> "") :
				        if tensionB[i] <> "" :
					        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{up}"  
				        else :
					        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionval[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  + "{up}" 

				if (tensionand[i] <> "" and 
				    upp2[i] <> "") :
				        if tensionandB[i] <> "" :
					        zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{up}"  
				        else :
					        zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandval[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + "{up}" 

				else :
				    if upp2[i] <> "" :
				        zeile = zeile  + ' ... ' + upp2[i]  

				    else :
				        zeile = zeile  

	## tension and dir2 

				    if (tension[i] <> "" and 
					    dir2[i] <> "") :
					        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo + " {dir ("+ str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}"  

				    if (tensionand[i] <> "" and 
					    dir2[i] <> "") :
					        zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo  + " {dir ("+ str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}"  

				    else :
				        if dir2[i] <> "" :
					        zeile = zeile  + " ... {dir ("+ str(dir2val[i]) + " + metapolation * (" + str(dir2valB[i]) + " - " + str(dir2val[i]) + "))}" 
				        else :
					        if tension[i] <> "" :
						        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo
					        else :
					            if  tensionand[i] <> "" : 
						            zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo
		  
		  
		    zeile = zeile + dash 

	# parameters before a new penpos    (extra semi after else)
          
            else: 

		    if dir[i] <> "" :
			    zeile = zeile + " {dir ("+ str(dirval[i]) + " + metapolation * (" + str(dirvalB[i]) + " - " + str(dirval[i]) + "))}"      

		    if overx[i] <> "" :
		        zeile = zeile + " shifted (0, (A_xheight*pt + metapolation * (B_xheight*pt - A_xheight*pt)) - " + str(overxval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

		    if overbase[i] <> "" :
		        zeile = zeile + " shifted (0, - " + str(overbaseval[i]) + ") - (0, A_over + metapolation * (B_over - A_over))" 

		    if overcap[i] <> "" :
		        zeile = zeile + " shifted (0, (A_capital*pt + metapolation * (B_capital*pt - A_capital*pt)) - " + str(overcapval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

		    if overasc[i] <> "" :
		        zeile = zeile + " shifted (0, (A_ascender*pt + metapolation * (B_ascender*pt - A_ascender*pt )) - " + str(overascval[i]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

		    if overdesc[i] <> "" :
		        zeile = zeile + " shifted (0, (A_descender*pt + metapolation * (B_descender*pt  - A_descender*pt )) - " + str(overdescval[i]) + ") - (0, A_over + metapolation * (B_over - A_over))" 

		    if penshifted[i] <> "" :
		        zeile = zeile + " shifted (" + str(penshiftedval[i]) + ")"       

		    if ( tension[i] <> "" and 
			    upp2[i] <> "") :
			        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo  + "{up}" 
		    else :
		        if upp2[i] <> "" :
			        zeile = zeile + dash + "{up}" 

		    if ( tension[i] <> "" and 
			    downp2[i] <> "") :
			        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo  + "{down}" 
		    else :
		        if downp2[i] <> "" :
			        zeile = zeile + dash + "{down}" 

		    if ( tension[i] <> "" and 
			    rightp2[i] <> "") :
			        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo  + "{right}" 
		    else :
		        if rightp2[i] <> "" :
			        zeile = zeile + dash + "{right}" 

		    if ( tension[i] <> "" and 
			    leftp2[i] <> "") :
			        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo  + "{left}" 
		    else :
		        if leftp2[i] <> "" :
			        zeile = zeile + dash + "{left}" 
		    if  ( tension[i] <> "" and 
			    dir2[i] <> "") :
			        zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo  + "{dir "+ str(dir2val[i]) + "}" 
		    else :
		        if dir2[i] <> "" :
			        zeile = zeile + dash + "{dir "+ str(dir2val[i]) + "}" 
		    if  ( tension[i] <> "" and 
			  cycle[i] <> "") :
			    zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100-' + str(tensionval[i]) + '/100)))' + strtwo + "cycle"

		    else :
		        if  ( tensionand[i] <> "" and 
			        cycle[i] <> "") :
			            zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))' + strtwo + "cycle"
		        else :
			        if cycle[i] <> "" :
			            zeile = zeile + dash + "cycle" 

			        else :
			            if tension[i] <> "" :
			                 zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i]) + '/100 + (metapolation * (' + str(tensionvalB[i]) + '/100 -' + str(tensionval[i]) + '/100 )))' + strtwo  
		       
			            else :
			                if tensionand[i] <> "" :
			                    zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i]) + '/100) + (metapolation * ((' + str(tensionandvalB[i]) + '/100) - (' + str(tensionandval[i]) + '/100))))' + " and ((" + str(tensionandval2[i]) + '/100) + (metapolation * ((' + str(tensionandval2B[i]) + '/100) - (' + str(tensionandval2[i]) + '/100))))'  + strtwo

		    
		    zeile = zeile + semi 
		    fip.write("\n")
		    fip.write( zeile )

	# parameters after final point ( +1 after i )

		    zitemb = zzn[i+1]
		    zeile = "z"+str(zitemb)+"e" 

            if penshifted[i+1] <> "" :
		    zeile = zeile + " shifted (" + str(penshiftedval[i+1]) + ")"       

            if dir[i+1] <> "" :
			zeile = zeile + " {dir ("+ str(dirval[i+1]) + " + metapolation * (" + str(dirvalB[i+1]) + " - " + str(dirval[i+1]) + "))}"      

	    if overx[i+1] <> "" :
		    zeile = zeile + " shifted (0, (A_xheight*pt + metapolation * (B_xheight*pt - A_xheight*pt)) - " + str(overxval[i+1]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

	    if overbase[i+1] <> "" :
		    zeile = zeile + " shifted (0, - " + str(overbaseval[i+1]) + ") - (0, A_over + metapolation * (B_over - A_over))" 

	    if overcap[i+1] <> "" :
		    zeile = zeile + " shifted (0, (A_capital*pt + metapolation * (B_capital*pt - A_capital*pt)) - " + str(overcapval[i+1]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

	    if overasc[i+1] <> "" :
		    zeile = zeile + " shifted (0, (A_ascender*pt + metapolation * (B_ascender*pt - A_ascender*pt )) - " + str(overascval[i+1]) + ") + (0, A_over + metapolation * (B_over - A_over))" 

	    if overdesc[i+1] <> "" :
		    zeile = zeile + " shifted (0, (A_descender*pt + metapolation * (B_descender*pt  - A_descender*pt )) - " + str(overdescval[i+1]) + ") - (0, A_over + metapolation * (B_over - A_over))" 

	    if ( tension[i+1] <> "" and 
		    upp2[i+1] <> "") :
			    zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i+1]) + '/100 + (metapolation * (' + str(tensionvalB[i+1]) + '/100-' + str(tensionval[i+1]) + '/100)))' + strtwo  + "{up}" 

	    if ( tension[i+1] <> "" and 
		    downp2[i+1] <> "") :
			    zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i+1]) + '/100 + (metapolation * (' + str(tensionvalB[i+1]) + '/100-' + str(tensionval[i+1]) + '/100)))' + strtwo  + "{down}" 

	    if ( tension[i+1] <> "" and 
		    rightp2[i+1] <> "") :
			    zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i+1]) + '/100 + (metapolation * (' + str(tensionvalB[i+1]) + '/100-' + str(tensionval[i+1]) + '/100)))' + strtwo  + "{right}" 

	    if ( tension[i+1] <> "" and 
		      leftp2[i+1] <> "") :
			zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i+1]) + '/100 + (metapolation * (' + str(tensionvalB[i+1]) + '/100-' + str(tensionval[i+1]) + '/100)))' + strtwo  + "{left}" 

	    if ( tension[i+1] <> "" and 
		      dir2[i+1] <> "") :
			zeile = zeile + strtwo + "tension" + " (" + str(tensionval[i+1]) + '/100 + (metapolation * (' + str(tensionvalB[i+1]) + '/100-' + str(tensionval[i+1]) + '/100)))' + strtwo  + "{dir "+ str(dir2val[i+1]) + "}" 

	    if ( tensionand[i+1] <> "" and 
		      dir2[i+1] <> "") :
			      zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i+1]) + '/100) + (metapolation * ((' + str(tensionandvalB[i+1]) + '/100) - (' + str(tensionandval[i+1]) + '/100))))' + " and ((" + str(tensionandval2[i+1]) + '/100) + (metapolation * ((' + str(tensionandval2B[i+1]) + '/100) - (' + str(tensionandval2[i+1]) + '/100))))'  + strtwo  + " {dir ("+ str(dir2val[i+1]) + " + metapolation * (" + str(dir2valB[i+1]) + " - " + str(dir2val[i+1]) + "))}"  


	    if upp2[i+1] <> "" :
		    zeile = zeile + dash + upp2[i+1]  

	    else :
		    if dir2[i+1] <> "" :
		        zeile = zeile + " ... {dir "+ str(dir2val[i+1]) + "}"   
		    else :
		        if downp2[i+1] <> "" :
		            zeile = zeile + dash + downp2[i+1]  
		        else :
		            if upp2[i+1] <> "" :
			        zeile = zeile + dash + upp2[i+1]  
		            else :
			            if leftp2[i+1] <> "" :
			                zeile = zeile + dash  + leftp2[i+1]  
			            else :
			                if rightp2[i+1] <> "" :
			                    zeile = zeile + dash + rightp2[i+1]    
			                else :
			                    if tension[i+1] <> "" :
			                        zeile = zeile + strtwo + "tension" + " (" + tensionval[i+1] + '/100 + (metapolation * (' + tensionvalB[i+1] + '/100-' + tensionval[i+1] + '/100)))' + strtwo  + downp2[i+1] 
			                    else :
			                        if ( tensionand[i+1] <> "" and 
				                        cycle[i+1] <> "") :
				                            zeile = zeile + strtwo + "tension" + " ((" + str(tensionandval[i+1]) + '/100) + (metapolation * ((' + str(tensionandvalB[i+1]) + '/100) - (' + str(tensionandval[i+1]) + '/100))))' + " and ((" + str(tensionandval2[i+1]) + '/100) + (metapolation * ((' + str(tensionandval2B[i+1]) + '/100) - (' + str(tensionandval2[i+1]) + '/100))))' + strtwo + "cycle"
			                        else :
				                        if cycle[i+1] <> "" :
				                            zeile = zeile + dash + cycle[i+1] 
				                        else :
				                            zeile = zeile

	# fip.write( closing z point )

            fip.write("\n")
            fip.write( zeile ) 
	    fip.write("\n")
	    fip.write( semi )
	    fip.write("\n")
	    fip.write( """
	% pen labels
	penlabels(range 1 thru 99);
	endchar;
	""")

	    fip.close()
	    return None

