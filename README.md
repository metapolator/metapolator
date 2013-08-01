<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
  <meta http-equiv="Content-Style-Type" content="text/css">
  <title></title>
  <meta name="Generator" content="Cocoa HTML Writer">
  <meta name="CocoaVersion" content="1187.37">
  <style type="text/css">
    p.p3 {margin: 0.0px 0.0px 0.0px 0.0px; font: 14.0px Arial}
    p.p4 {margin: 0.0px 0.0px 0.0px 0.0px; font: 14.0px Arial; min-height: 16.0px}
    p.p5 {margin: 0.0px 0.0px 15.0px 0.0px; font: 24.0px Arial; color: #323333}
    p.p7 {margin: 0.0px 0.0px 0.0px 36.0px; text-indent: -36.0px; font: 14.0px Arial; color: #222222}
    p.p8 {margin: 0.0px 0.0px 0.0px 36.0px; text-indent: -36.0px; font: 14.0px Arial; color: #0000ee}
    p.p9 {margin: 0.0px 0.0px 0.0px 0.0px; font: 14.0px Arial; color: #222222; min-height: 16.0px}
    p.p10 {margin: 0.0px 0.0px 0.0px 0.0px; font: 14.0px Arial; color: #222222}
    p.p11 {margin: 0.0px 0.0px 0.0px 0.0px; font: 14.0px Menlo; color: #222222; background-color: #f9d3e0}
    p.p12 {margin: 0.0px 0.0px 0.0px 0.0px; font: 14.0px Arial; color: #232323; min-height: 16.0px}
    p.p13 {margin: 0.0px 0.0px 0.0px 0.0px; font: 14.0px Arial; color: #232323}
    p.p14 {margin: 0.0px 0.0px 0.0px 0.0px; font: 14.0px Menlo; color: #232323; background-color: #f9d3e0}
    p.p15 {margin: 0.0px 0.0px 0.0px 0.0px; font: 24.0px Arial; color: #333333}
    p.p16 {margin: 0.0px 0.0px 0.0px 0.0px; font: 15.0px Arial}
    li.li6 {margin: 0.0px 0.0px 0.0px 0.0px; font: 14.0px Arial; color: #0000ee}
    li.li10 {margin: 0.0px 0.0px 0.0px 0.0px; font: 14.0px Arial; color: #222222}
    span.s1 {text-decoration: underline ; color: #0000ee}
    span.s2 {text-decoration: underline}
    span.s3 {color: #232323}
    span.s4 {color: #222222}
    span.s5 {color: #ff0000}
    span.Apple-tab-span {white-space:pre}
    ul.ul1 {list-style-type: disc}
  </style>
</head>
<body>
<h1 style="margin: 0.0px 0.0px 15.0px 0.0px; font: 30.0px Arial; color: #333333"><b>Metapolator</b></h1>
<h2 style="margin: 0.0px 0.0px 15.0px 0.0px; font: 24.0px Arial; color: #333333"><b>About</b></h2>
<p class="p3">Metapolator is a web-based parametric font editor. It provides a GUI for designing with Metafont – a program and language for semi-algorithmic specification of fonts. Metapolator was created out of the need to create large type families efficiently. <a href="http://metapolator.com/"><span class="s1">more</span></a></p>
<p class="p4"><br></p>
<p class="p5"><b>Requirements</b></p>
<ul class="ul1">
  <li class="li6"><a href="http://dev.mysql.com/downloads/mysql/"><span class="s2">MySQL</span></a></li>
</ul>
<p class="p7"><span class="s3"><span class="Apple-tab-span">	</span>•<span class="Apple-tab-span">	</span><a href="http://www.python.org/"><span class="s4">Python</span></a></span></p>
<p class="p8"><span class="s3"><span class="Apple-tab-span">	</span>•<span class="Apple-tab-span">	</span><a href="http://sourceforge.net/projects/mysql-python/"><span class="s1">python-mysqldb</span></a></span></p>
<p class="p7"><span class="s3"><span class="Apple-tab-span">	</span>•<span class="Apple-tab-span">	</span><a href="http://webpy.org/"><span class="s4">web.py</span></a></span></p>
<p class="p7"><span class="s3"><span class="Apple-tab-span">	</span>•<span class="Apple-tab-span">	</span><a href="http://sourceforge.net/projects/fontforge/files/fontforge-source/"><span class="s4">FontForge</span></a></span></p>
<p class="p7"><span class="s3"><span class="Apple-tab-span">	</span>•<span class="Apple-tab-span">	</span><a href="http://www.ctan.org/tex-archive/support/mf2pt1"><span class="s4">mf2pt1</span></a></span></p>
<p class="p7"><span class="s3"><span class="Apple-tab-span">	</span>•<span class="Apple-tab-span">	</span><a href="http://www.lcdf.org/type/#t1utils"><span class="s4">Type 1 utilities</span></a></span></p>
<p class="p9"><br></p>
<p class="p9"><br></p>
<p class="p5"><b>Installation</b></p>
<p class="p10">Set your mysql username to root and leave password empty. You could also change these settings on line 6 in model.py.</p>
<p class="p9"><br></p>
<p class="p11">$ mysql -u root -p</p>
<p class="p12"><br></p>
<p class="p13">Load the preset database:</p>
<p class="p12"><br></p>
<p class="p11">mysql&gt; USE blog;</p>
<p class="p11">mysql&gt; SOURCE dbscript.sql;</p>
<p class="p11">mysql&gt; SOURCE mysqlview.sql;</p>
<p class="p9"><br></p>
<p class="p10">Start web.py application:</p>
<p class="p9"><br></p>
<p class="p14">$ python mfg.py <span class="Apple-converted-space">   </span></p>
<p class="p9"><br></p>
<p class="p10">This should give you a local webadress you can copy paste into a chrome browser, something like this:</p>
<p class="p9"><br></p>
<p class="p14">http://0.0.0.0:8080/</p>
<p class="p9"><br></p>
<p class="p9"><br></p>
<p class="p5"><b>Usage</b></p>
<p class="p10">Settings:</p>
<ul class="ul1">
  <li class="li10">Go to Settings and choose a project id.<span class="Apple-converted-space"> </span></li>
</ul>
<ul class="ul1">
  <li class="li10">Select a glyph from the chooser</li>
</ul>
<p class="p9"><br></p>
<p class="p10">Editor:</p>
<ul class="ul1">
  <li class="li10">Select a point of the glyph to start the editing window.</li>
</ul>
<p class="p9"><br></p>
<p class="p10">To copy and replace an existing project folder, type in '1001' at load-option in Settings. Once copied the preset folder the two fonts can be replaced by other .ufo fonts.<span class="Apple-converted-space"> </span></p>
<p class="p9"><br></p>
<p class="p10">Only glyph names with the numbers from 0 to 95 are allowed so far. <span class="s3">See glyphnames.txt file for the encoding.</span></p>
<p class="p9"><br></p>
<h2 style="margin: 0.0px 0.0px 15.0px 0.0px; font: 24.0px Arial; color: #333333"><b>Screenshots</b></h2>

<p><a href="https://github.com/metapolator/metapolator.png" target="_blank"><img src="https://github.com/metapolator/metapolator.png" alt="Metapolator" style="max-width:100%;"></a></p>
<p class="p9"><br></p>
<p class="p9"><br></p>
<p class="p9"><br></p>
<p class="p9"><br></p>
<p class="p15"><b>License</b></p>
<p class="p9"><br></p>
<p class="p16">The sourcecode of this project is licensed under the <a href="http://www.gnu.org/copyleft/gpl.html"><span class="s5">gnu general public license v3.0</span></a></p>
<h2 style="margin: 0.0px 0.0px 15.0px 0.0px; font: 24.0px Arial; color: #333333; min-height: 28.0px"><br></h2>
<p class="p9"><br></p>
<p class="p9"><br></p>
<p class="p9"><br></p>
<p class="p9"><br></p>
</body>
</html>


