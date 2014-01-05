API
===

.. http:get:: /editor/project/

    Retrieve project data

    :query integer project_id: id of project to retrieve data
    :query boolean preload: when query contains this it will return first
        or concrete glyph defined in `glyph`
    :query integer glyph: in preload returns concrete glyph data

    **Example response**

    .. sourcecode:: http

        {
            "masters": [
                {
                    "label": "A",
                    "master_id": 6,
                    "metapolation": "AB",
                    "glyphs": [
                        {
                            "contours": [
                                [
                                    {
                                        "y":0, 
                                        "x":282.00085, 
                                        "controls": [
                                            {"y": 0, "x": 195.0008},
                                            {"y": 197.6665, "x": 340.00056}
                                        ]
                                    }
                                ]
                            ],
                            "name": "1",
                            "height": 592.99956,
                            "width": 782.00111,
                            "zpoints": {
                                "width": 801,
                                "iszpoint": true,
                                "pointnr": 1,
                                "x": 282,
                                "y": 0,
                                "data": {
                                    "angle": null,
                                    "control_in": null,
                                    "control_out": null,
                                    "dir": null,
                                    "dir2": null,
                                    "doubledash": null,
                                    "downp": null,
                                    "downp2": null,
                                    "fontsource": null,
                                    "glyph_id": 713,
                                    "glyphoutline_id": 18405,
                                    "id": 18405,
                                    "leftp": null,
                                    "leftp2": null,
                                    "master_id": 6,
                                    "overasc": null,
                                    "overbase": null,
                                    "overcap": null,
                                    "overdesc": null,
                                    "overx": null,
                                    "penshifted": null,
                                    "penwidth": null,
                                    "pointname": "z1l",
                                    "pointshifted": null,
                                    "rightp": null,
                                    "rightp2": null,
                                    "serif_h_bot": null,
                                    "serif_h_top": null,
                                    "serif_v_left": null,
                                    "serif_v_right": null,
                                    "startp": 1,
                                    "tensionand": null,
                                    "theta": null,
                                    "tripledash": null,
                                    "type": "line",
                                    "upp": null,
                                    "upp2": null,
                                    "user_id": 1
                                }
                            }
                        }
                    ]
                }
            ],
            "versions": [
                {
                    "master_id": 1,
                    "version": "001",
                    "name": "Sean"
                }
            ],
            "metaglyphs": metaglyphs,
            "mode": "pen",
            "project_id": 6
        }