# mp-cps parity tests

| test (`cargo test -p mp-cps --test …`) | question it answers                                                                                                                                                                                                                                               | data producer                                                                                                       |
|----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| `cps_parse`                            | Does the port accept and reject the same CPS sources as JS (gonzales + Atem-CPS factories)? For accepted ones, does it produce the same rules, selectors (string, normalized name, specificity), property value strings, validity, and compiled postfix programs? | `node tests/probes/cps-parse.js 2>/dev/null > tests/data/cps-parse.json` (after `tools/js-reference/fetch-deps.sh`) |

**Inputs:** every `.cps` file of the two pinned CPS libraries and of
`tests/fixtures/`, the generated interpolation/metapolation CPS for 0–4
masters, the chunks of `tests/data/edge-cases.cps` (each parsed on its own),
and the selector strings in `tests/data/selectors.txt`.

**Signal:** error versus no error must agree. For parsed sources, the JSON
dumps must be equal, ignoring only the text of error messages. The postfix
programs compare numbers as f64 bit patterns.

**Recorded 2026-11-02:** of 166 sources, 130 were parsed and compared
structurally and 36 were rejected by both, with 0 mismatches. All selector
strings match. Negative control: corrupting one dumped field makes both tests
fail.

## Findings about the JS reference (reproduced by the port)

- One unsupported character in any value fails the **whole file**:
  `^ ~ ! @ $ % & | ? < > #` used alone, a lone `'`, `.` outside a number,
  or `{` inside a value. So the `^` (pow) operator can never appear in a CPS
  file.
- The following also fail the whole file: any invalid selector (`a ~ b`,
  `a + b`, `:nth-child(…)`, `:i()` without a number), pseudo-elements
  (`::x`), unknown at-rules, `@dictionary`, `//` comments at the top level,
  a broken `S"..."` selector literal inside a value, and an `@namespace`
  without a valid selector.
- `x-1` lexes as `x`, `-1`, so the stack is too crowded and the property is
  invalid. `x - 1` works.
- `minimum` lexes as the `min` operator followed by `imum`. Names starting
  with `min`/`max` cannot be used.
- `@x` in a value contributes just `x` (AtRuleName stringifies without the `@`).
