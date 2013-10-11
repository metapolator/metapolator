urls = ('/', 'metapolator.views.Index',
        '/login', 'metapolator.views.Login',
        '/register', 'metapolator.views.Register',
        '/logout', 'metapolator.views.logout',
        '/view/(\d+)', 'metapolator.views.View',
        '/metap/(\d+)', 'metapolator.views.Metap',
        '/viewfont/', 'metapolator.views.ViewFont',
        '/font1/(\d+)', 'metapolator.views.Font1',
        '/font2/(\d+)', 'metapolator.views.GlobalParam',
        '/font3/(\d+)', 'metapolator.views.localParamA',
        '/font4/(\d+)', 'metapolator.views.localParamB',
        '/cproject/(\d+)', 'metapolator.views.copyproject',
        '/project/create/', 'metapolator.views.CreateProject'
        )
