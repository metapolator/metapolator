""" To make views available inside application add url here
"""


urls = (
    "/", "metapolator.views.index.Index",
    "/upload/", "metapolator.views.upload.UploadZIP",
    "/projects/", "metapolator.views.projects.Projects",
    "/workspace/", "metapolator.views.workspace.Workspace",
    "/mfparser-switch/(pen|controlpoints)/", "metapolator.views.changemfmode.ChangeMFMode",
    "/editor/copy-master/", "metapolator.views.copymaster.CopyMaster",
    "/editor/create-instance/", "metapolator.views.createinstance.CreateInstance",
    "/editor/create-master/", "metapolator.views.createmaster.CreateMaster",
    "/editor/locals/", "metapolator.views.fontlocalpreset.FontLocalPreset",
    "/editor/reload/", "metapolator.views.getmaster.GetMaster",
    "/editor/glyphs/", "metapolator.views.glyphlist.GlyphList",
    "/a/master/loading", "metapolator.views.masterasyncload.MasterAsyncLoading",
    "/a/glyph/origins/", "metapolator.views.originglyph.GlyphOrigin",
    "/editor/project/", "metapolator.views.project.Project",
    "/editor/save-metap/", "metapolator.views.saveaxis.SaveAxis",
    "/editor/save-point/", "metapolator.views.savepoint.SavePoint",
    "/specimen/(\d+)/", "metapolator.views.specimen.Specimen",
    "/login", "metapolator.views.auth.login",
    "/logout", "metapolator.views.auth.logout",
    "/register", "metapolator.views.auth.register",
    "/users/(.*)", "metapolator.views.static.userstatic"
)
