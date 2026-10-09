#!/usr/bin/env python3
"""
sync_vocab.py — keep every copy of vocabulary_database.csv in step with the master.

MASTER: spanish_app/vocabulary_database.csv   (Spanish, English, Section, Source, capitals)
COPIES: spanish_worksheets/vocabulary_database.csv   (Spanish, English, Section, capitals)
        video_generation/vocabulary_database.csv      (Spanish, English, Section, capitals)
        buhisimo/data/vocabulary_database.csv         (same columns as the master)
MIRRORS (one-way, master → copy): helper_words.csv and names.csv → buhisimo/data/

What it does, in order:
  1. Rows that exist only in a copy (e.g. another agent added 3.7 to the worksheets copy)
     are added to the master, inside their section, with Source "added via <copy>".
     Exception: if the row existed at the last sync, it was DELETED from the master,
     so it is removed from the copy instead (remembered in .vocab_sync_state.json).
  2. If the same word (Spanish + Section) has a different English or capitals value in
     two files, it STOPS and lists the conflicts. Fix them by hand, then run again.
  3. Writes the master, then rewrites each copy from the master in that copy's own
     column layout (so tools reading the copies see no format change).

Deleting or editing a word: do it in the MASTER, then run this script.
(A row deleted only from a copy is put back, because the master still has it.)

  python3 sync_vocab.py            # sync
  python3 sync_vocab.py --check    # report only, change nothing
"""
import csv
import io
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
MASTER = HERE / 'vocabulary_database.csv'
COPIES = {
    'spanish_worksheets': HERE.parent / 'spanish_worksheets' / 'vocabulary_database.csv',
    'video_generation': Path.home() / 'Documents' / 'video_generation' / 'vocabulary_database.csv',
    'buhisimo': HERE.parent / 'buhisimo' / 'data' / 'vocabulary_database.csv',
}
# Edited only in spanish_app; copied as-is into the Buhísimo v2 repo
MIRRORS = [(HERE / f, HERE.parent / 'buhisimo' / 'data' / f) for f in ('helper_words.csv', 'names.csv')]
MASTER_COLS = ['Spanish', 'English', 'Section', 'Source', 'capitals']
STATE = HERE / '.vocab_sync_state.json'   # keys present at the last successful sync


def read(path):
    with open(path, encoding='utf-8', newline='') as f:
        reader = csv.DictReader(f)
        return reader.fieldnames, [dict(r) for r in reader]


def key(row):
    return (row['Spanish'].strip(), row['Section'].strip())


def render(cols, rows):
    out = io.StringIO()
    w = csv.writer(out, lineterminator='\n')
    w.writerow(cols)
    for r in rows:
        w.writerow([r.get(c, '') for c in cols])
    return out.getvalue()


def section_sort_key(section):
    # "2.4 Espejito…" -> (2, 4); unknown formats go last
    try:
        major, minor = section.split(' ', 1)[0].split('.')
        return (int(major), int(minor))
    except ValueError:
        return (99, 99)


def main():
    check_only = '--check' in sys.argv
    _, master = read(MASTER)
    by_key = {key(r): r for r in master}
    last_synced = set()
    if STATE.exists():
        last_synced = {tuple(k) for k in json.loads(STATE.read_text(encoding='utf-8'))}
    added, removed, conflicts = [], set(), []

    for name, path in COPIES.items():
        if not path.exists():
            print(f'  (skipping {name}: {path} not found)')
            continue
        _, rows = read(path)
        for r in rows:
            k = key(r)
            m = by_key.get(k)
            if m is None and k in last_synced:
                removed.add((name, r['Section'], r['Spanish']))
                continue
            if m is None:
                new = {'Spanish': r['Spanish'], 'English': r['English'], 'Section': r['Section'],
                       'Source': f'added via {name}', 'capitals': r.get('capitals', '')}
                # insert after the last master row of the same section (or by section order)
                idx = max((i for i, x in enumerate(master) if x['Section'] == r['Section']), default=None)
                if idx is None:
                    idx = max((i for i, x in enumerate(master)
                               if section_sort_key(x['Section']) <= section_sort_key(r['Section'])), default=-1)
                master.insert(idx + 1, new)
                by_key[k] = new
                added.append((name, r['Section'], r['Spanish']))
            else:
                for field in ('English', 'capitals'):
                    if (m.get(field) or '').strip() != (r.get(field) or '').strip():
                        conflicts.append((name, r['Section'], r['Spanish'], field, m.get(field), r.get(field)))

    for name, sec, es in added:
        print(f'  + from {name}: [{sec}] {es}')
    for name, sec, es in sorted(removed):
        print(f'  - deleted in master, removing from {name}: [{sec}] {es}')
    if conflicts:
        print('\nCONFLICTS: nothing written. Make these agree (edit the master or the copy), then run again:')
        for name, sec, es, field, mv, cv in conflicts:
            print(f'  [{sec}] {es}: {field} is "{mv}" in master but "{cv}" in {name}')
        sys.exit(1)

    if check_only:
        print(f'\n--check: {len(added)} row(s) would be added to the master, {len(removed)} removed from copies.')
        return

    MASTER.write_text(render(MASTER_COLS, master), encoding='utf-8')
    for name, path in COPIES.items():
        if not path.exists():
            continue
        cols, _ = read(path)
        text = render(cols, master)
        if path.read_text(encoding='utf-8') != text:
            path.write_text(text, encoding='utf-8')
            print(f'  updated {name} copy')
    for src, dst in MIRRORS:
        if dst.parent.exists() and (not dst.exists() or dst.read_bytes() != src.read_bytes()):
            dst.write_bytes(src.read_bytes())
            print(f'  mirrored {src.name} -> {dst.parent.parent.name}/data/')
    STATE.write_text(json.dumps(sorted(by_key)), encoding='utf-8')
    print(f'\nSynced: master has {len(master)} words.')


if __name__ == '__main__':
    main()
