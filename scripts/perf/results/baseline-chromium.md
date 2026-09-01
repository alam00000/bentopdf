# Merge Baseline

Run: 2026-09-01T17:03:03.717Z browser=chromium

| combo                         | browser  | load+parse(ms) | merge(ms) | outcome | dl bytes  | mem after load(MB) | mem after merge(MB) |
| ----------------------------- | -------- | -------------- | --------- | ------- | --------- | ------------------ | ------------------- |
| sample                        | chromium | 246            | 1557      | ok      | 18328     | 23                 | 23                  |
| 190826                        | chromium | 339            | 1571      | ok      | 53978495  | 121                | 122                 |
| 100826WE+120826               | chromium | 942            | 3716      | ok      | 307665250 | 598                | 313                 |
| 170826+190826                 | chromium | 3026           | 2583      | ok      | 135291395 | 273                | 149                 |
| 100826WE+120826+170826+190826 | chromium | 1509           | 5041      | ok      | 442980891 | 436                | 442                 |

## cpdf build(s) loaded (expected: none - merge runs on the qpdf engine)

## Notes per run

- **sample (chromium)**: console: alert: Success|PDFs merged successfully!
- **190826 (chromium)**: console: alert: Success|PDFs merged successfully!
- **100826WE+120826 (chromium)**: console: alert: Success|PDFs merged successfully!
- **170826+190826 (chromium)**: console: alert: Success|PDFs merged successfully!
- **100826WE+120826+170826+190826 (chromium)**: console: alert: Success|PDFs merged successfully!
