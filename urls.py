urls = ('/', 'mfg.Index',
        '/login', 'mfg.Login',
        '/register', 'mfg.Register',
        '/logout', 'mfg.logout',
        '/view/(\d+)', 'mfg.View',
        '/metap/(\d+)', 'mfg.Metap',
        '/viewfont/', 'mfg.ViewFont',
        '/font1/(\d+)', 'mfg.Font1',
        '/font2/(\d+)', 'mfg.GlobalParam',
        '/font3/(\d+)', 'mfg.localParamA',
        '/font4/(\d+)', 'mfg.localParamB',
        '/cproject/(\d+)', 'mfg.copyproject',
        '/project/create/', 'mfg.CreateProject'
        )
