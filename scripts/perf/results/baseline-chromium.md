# Merge Baseline

Run: 2026-09-02T05:48:39.738Z browser=chromium

| combo                         | browser  | load+parse(ms) | merge(ms) | outcome | dl bytes  | mem after load(MB) | mem after merge(MB) |
| ----------------------------- | -------- | -------------- | --------- | ------- | --------- | ------------------ | ------------------- |
| sample                        | chromium | 262            | 1565      | ok      | 18328     | 20                 | 20                  |
| 190826                        | chromium | 341            | 1571      | ok      | 53978495  | 121                | 173                 |
| 100826WE+120826               | chromium | 951            | 3820      | ok      | 307665250 | 598                | 602                 |
| 170826+190826                 | chromium | 3022           | 2601      | ok      | 135291395 | 273                | 276                 |
| 100826WE+120826+170826+190826 | chromium | 1565           | 5150      | ok      | 442980891 | 436                | 858                 |

## cpdf build(s) loaded (expected: none — merge runs on the qpdf engine)

## Notes per run

- **sample (chromium)**: console: alert: Success|PDFs merged successfully!
- **190826 (chromium)**: console: alert: Success|PDFs merged successfully!
- **100826WE+120826 (chromium)**: console: alert: Success|PDFs merged successfully!
- **170826+190826 (chromium)**: console: alert: Success|PDFs merged successfully!
- **100826WE+120826+170826+190826 (chromium)**: console: alert: Success|PDFs merged successfully!
