drop table if exists glyph;
drop table if exists glyphoutline;
drop table if exists glyphparam;
drop table if exists master;
drop table if exists globalparam;
drop table if exists localparam;
drop table if exists groupparam;

CREATE TABLE `glyph` (
  `idglyph` int(11) NOT NULL AUTO_INCREMENT,
  `glyphName` varchar(3) DEFAULT NULL,
  `width` int(11) DEFAULT NULL,
  `unicode` text,
  `user_id` int(11) NOT NULL,
  `idmaster` int(11) DEFAULT NULL,
  `fontsource` enum('A','B') DEFAULT NULL,
  PRIMARY KEY (`idglyph`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_idmaster` (`idmaster`),
  KEY `idx_fontsource` (`fontsource`)
) ENGINE=InnoDB AUTO_INCREMENT=365 DEFAULT CHARSET=utf8;

CREATE TABLE `glyphoutline` (
  `id` int(11) NOT NULL DEFAULT '0',
  `glyphName` varchar(3) NOT NULL DEFAULT '',
  `pointnr` int(11) DEFAULT NULL,
  `x` int(11) DEFAULT NULL,
  `y` int(11) DEFAULT NULL,
  `contrp` int(11) DEFAULT '0',
  `idmaster` int(11) NOT NULL DEFAULT '0',
  `pip` int(11) DEFAULT NULL,
  `vdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fontsource` enum('A','B') NOT NULL DEFAULT 'A',
  `user_id` int(11) NOT NULL,
  `vector_xIn` int(11) DEFAULT NULL,
  `vector_yIn` int(11) DEFAULT NULL,
  `vector_xOut` int(11) DEFAULT NULL,
  `vector_yOut` int(11) DEFAULT NULL,
  `segment` int(11) DEFAULT NULL,
  PRIMARY KEY (`idmaster`,`id`,`glyphName`,`user_id`,`fontsource`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `glyphparam` (
  `id` int(11) NOT NULL DEFAULT '0',
  `glyphName` varchar(3) NOT NULL DEFAULT '',
  `PointName` varchar(5) DEFAULT NULL,
  `groupname` varchar(10) DEFAULT NULL,
  `startp` int(11) DEFAULT NULL,
  `doubledash` int(11) DEFAULT NULL,
  `tripledash` int(11) DEFAULT NULL,
  `superleft` float DEFAULT NULL,
  `superright` float DEFAULT NULL,
  `leftp` int(11) DEFAULT NULL,
  `rightp` int(11) DEFAULT NULL,
  `downp` int(11) DEFAULT NULL,
  `upp` int(11) DEFAULT NULL,
  `dir` varchar(30) DEFAULT NULL,
  `leftp2` int(11) DEFAULT NULL,
  `rightp2` int(11) DEFAULT NULL,
  `downp2` int(11) DEFAULT NULL,
  `upp2` int(11) DEFAULT NULL,
  `dir2` varchar(30) DEFAULT NULL,
  `tension` varchar(30) DEFAULT NULL,
  `tensionand` varchar(10) DEFAULT NULL,
  `cycle` int(11) DEFAULT NULL,
  `penshifted` varchar(30) DEFAULT NULL,
  `pointshifted` varchar(30) DEFAULT NULL,
  `angle` varchar(30) DEFAULT NULL,
  `penwidth` varchar(30) DEFAULT NULL,
  `overx` varchar(10) DEFAULT NULL,
  `overbase` varchar(10) DEFAULT NULL,
  `overcap` varchar(10) DEFAULT NULL,
  `overasc` varchar(10) DEFAULT NULL,
  `overdesc` varchar(10) DEFAULT NULL,
  `ascpoint` int(11) DEFAULT NULL,
  `descpoint` int(11) DEFAULT NULL,
  `stemcutter` varchar(30) DEFAULT NULL,
  `stemshift` varchar(30) DEFAULT NULL,
  `inktrap_l` float DEFAULT NULL,
  `inktrap_r` float DEFAULT NULL,
  `idmaster` int(11) NOT NULL DEFAULT '0',
  `vdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fontsource` enum('A','B') NOT NULL DEFAULT 'A',
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`idmaster`,`id`,`glyphName`,`user_id`,`fontsource`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `groupparam` (
  `groupname` varchar(10) NOT NULL DEFAULT '',
  `startp` int(11) DEFAULT NULL,
  `doubledash` int(11) DEFAULT NULL,
  `tripledash` int(11) DEFAULT NULL,
  `superleft` float DEFAULT NULL,
  `superright` float DEFAULT NULL,
  `leftp` int(11) DEFAULT NULL,
  `rightp` int(11) DEFAULT NULL,
  `downp` int(11) DEFAULT NULL,
  `upp` int(11) DEFAULT NULL,
  `dir` varchar(30) DEFAULT NULL,
  `leftp2` int(11) DEFAULT NULL,
  `rightp2` int(11) DEFAULT NULL,
  `downp2` int(11) DEFAULT NULL,
  `upp2` int(11) DEFAULT NULL,
  `dir2` varchar(30) DEFAULT NULL,
  `tension` varchar(30) DEFAULT NULL,
  `tensionand` varchar(30) DEFAULT NULL,
  `cycle` int(11) DEFAULT NULL,
  `penshifted` varchar(30) DEFAULT NULL,
  `pointshifted` varchar(30) DEFAULT NULL,
  `angle` varchar(30) DEFAULT NULL,
  `penwidth` varchar(30) DEFAULT NULL,
  `overx` varchar(10) DEFAULT NULL,
  `overbase` varchar(10) DEFAULT NULL,
  `overcap` varchar(10) DEFAULT NULL,
  `overasc` varchar(10) DEFAULT NULL,
  `overdesc` varchar(10) DEFAULT NULL,
  `ascpoint` int(11) DEFAULT NULL,
  `descpoint` int(11) DEFAULT NULL,
  `stemcutter` varchar(30) DEFAULT NULL,
  `stemshift` varchar(30) DEFAULT NULL,
  `inktrap_l` float DEFAULT NULL,
  `inktrap_r` float DEFAULT NULL,
  `idmaster` int(11) NOT NULL DEFAULT '0',
  `vdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`idmaster`,`groupname`,`user_id`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `master` (
  `idmaster` int(11) NOT NULL AUTO_INCREMENT,
  `FontName` varchar(30) NOT NULL,
  `FontNameA` varchar(30) DEFAULT NULL,
  `FontNameB` varchar(30) DEFAULT NULL,
  `idglobal` int(11) DEFAULT NULL,
  `idlocalA` int(11) DEFAULT NULL,
  `idlocalB` int(11) DEFAULT NULL,
  `vdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`idmaster`),
  KEY `idx_name` (`FontName`),
  KEY `idx_idglobal` (`idglobal`),
  KEY `idx_idlocalA` (`idlocalA`),
  KEY `idx_idlocalB` (`idlocalB`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

CREATE TABLE `globalparam` (
  `idglobal` int(11) NOT NULL AUTO_INCREMENT,
  `metapolation` float DEFAULT '0',
  `unitwidth` float DEFAULT '0',
  `fontsize` int(11) DEFAULT '10',
  `mean` float DEFAULT '5',
  `cap` float DEFAULT '8',
  `ascl` float DEFAULT '2',
  `des` float DEFAULT '2',
  `box` float DEFAULT '10',
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`idglobal`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;

CREATE TABLE `localparam` (
  `idlocal` int(11) NOT NULL AUTO_INCREMENT,
  `px` float DEFAULT '0',
  `width` float DEFAULT '1',
  `space` float DEFAULT '0',
  `xheight` float DEFAULT '5',
  `capital` float DEFAULT '8',
  `boxheight` float DEFAULT '10',
  `ascender` float DEFAULT '8',
  `descender` float DEFAULT '2',
  `inktrap` int(11) DEFAULT '10',
  `stemcut` int(11) DEFAULT '20',
  `skeleton` float DEFAULT '0',
  `superness` float DEFAULT '1',
  `over` float DEFAULT '0.1',
  `user_id` int(11) NOT NULL,
  PRIMARY KEY (`idlocal`),
  KEY `idx_user_id` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(80) NOT NULL,
  `password` varchar(128) NOT NULL,
  `email` varchar(100) NOT NULL,
  `is_admin` tinyint(1) NOT NULL DEFAULT '0',
  `date_joined` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_username` (`username`),
  KEY `idx_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;


INSERT INTO users
    SET username='guest1',
        password='$2a$12$sZKe4qnuECXbACZcbZeJpuB3HmIxWooFsdXP3Y.nO8Qgz5wuhONsq',
        email='guest1@example.com';


INSERT INTO users
    SET username='guest2',
        password='$2a$12$sZKe4qnuECXbACZcbZeJpuB3HmIxWooFsdXP3Y.nO8Qgz5wuhONsq',
        email='guest2@example.com';