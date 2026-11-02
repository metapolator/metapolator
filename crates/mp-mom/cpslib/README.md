# Embedded CPS libraries

These are *data*: the CPS rules the MOM is computed with. They are copied
verbatim from the pinned JS dependencies (tools/js-reference/deps.lock) and
compiled into `mp-mom` with `include_str!`.

| here                         | source                                                                 | mounted as (CPS source name)     |
|------------------------------|------------------------------------------------------------------------|----------------------------------|
| `MOM/primary.cps`            | Atem-MOM `lib/cpsLib/primary.cps` @ 8bbefbf                  | `lib/MOM/primary.cps`            |
| `metapolator/*.cps`          | metapolator-cpsLib `lib/*.cps` @ 158f6e1           | `lib/metapolator/<name>.cps`     |
| `generators/*.tpl`           | Atem-MOM `lib/cpsGenerators/*.tpl` @ 8bbefbf                 | `generated://<name>/0/<n>`       |

In the JS app the libraries were mounted into the project's CPS directory by
Atem-IO (`Project` with `cpsLibIoMounts`), which hid any `CPS/lib/` of
the project itself.
