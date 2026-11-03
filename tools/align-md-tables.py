#!/usr/bin/env python3
"""Re-pad every GitHub-flavoured Markdown table in the given files so that all
columns are aligned (space-padded to the widest cell, separator dashes span
the column). Rewrites files in place; prints the files it changed.

    tools/align-md-tables.py notes/rust-port/*.md crates/*/tests/README.md
"""
import sys, unicodedata

def width(s):
    return sum(2 if unicodedata.east_asian_width(c) in 'WF' else 1 for c in s)

def split_row(line):
    s = line.strip()
    assert s.startswith('|') and s.endswith('|')
    cells, cur, esc, code = [], '', False, False
    for c in s[1:-1]:
        if c == '`': code = not code
        if c == '|' and not esc and not code:
            cells.append(cur.strip()); cur = ''
        else:
            cur += c
        esc = (c == '\\') and not esc
    cells.append(cur.strip())
    return cells

def is_sep(cells):
    return all(c and set(c) <= set('-:') for c in cells)

def align(block):
    rows = [split_row(l) for l in block]
    n = max(len(r) for r in rows)
    rows = [r + [''] * (n - len(r)) for r in rows]
    w = [max([width(r[i]) for r in rows if not is_sep(r)] + [3]) for i in range(n)]
    out = []
    for r in rows:
        if is_sep(r):
            out.append('|' + '|'.join('-' * (w[i] + 2) for i in range(n)) + '|')
        else:
            out.append('|' + '|'.join(' ' + r[i] + ' ' * (w[i] - width(r[i])) + ' ' for i in range(n)) + '|')
    return out

def process(text):
    lines = text.split('\n')
    out, i, fence = [], 0, False
    while i < len(lines):
        l = lines[i]
        if l.lstrip().startswith('```'):
            fence = not fence
        if not fence and l.strip().startswith('|') and l.strip().endswith('|'):
            j = i
            while j < len(lines) and lines[j].strip().startswith('|') and lines[j].strip().endswith('|'):
                j += 1
            block = lines[i:j]
            if len(block) >= 2 and is_sep(split_row(block[1])):
                indent = l[:len(l) - len(l.lstrip())]
                out.extend(indent + x for x in align(block))
            else:
                out.extend(block)
            i = j
            continue
        out.append(l)
        i += 1
    return '\n'.join(out)

for p in sys.argv[1:]:
    t = open(p, encoding='utf-8').read()
    n = process(t)
    if n != t:
        open(p, 'w', encoding='utf-8').write(n)
        print(p)
