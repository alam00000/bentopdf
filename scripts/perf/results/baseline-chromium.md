# Merge Baseline

Run: 2026-09-01T14:45:16.710Z browser=chromium

| combo                         | browser  | load+parse(ms) | merge(ms) | outcome | dl bytes  | mem after load(MB) | mem after merge(MB) |
| ----------------------------- | -------- | -------------- | --------- | ------- | --------- | ------------------ | ------------------- |
| sample                        | chromium | 241            | 1539      | ok      | 18328     | 22                 | 22                  |
| 190826                        | chromium | 354            | 1588      | ok      | 53978495  | 121                | 122                 |
| 100826WE+120826               | chromium | 889            | 3758      | ok      | 307665250 | 598                | 602                 |
| 170826+190826                 | chromium | 3018           | 2621      | ok      | 135291395 | 273                | 149                 |
| 100826WE+120826+170826+190826 | chromium | 1515           | 5164      | ok      | 442980891 | 436                | 442                 |

## cpdf build(s) loaded (expected: none - merge runs on the qpdf engine)

## Notes per run

- **sample (chromium)**: console: alert: Success|PDFs merged successfully!
- **190826 (chromium)**: console: alert: Success|PDFs merged successfully!
- **100826WE+120826 (chromium)**: console: alert: Success|PDFs merged successfully!
- **170826+190826 (chromium)**: console: alert: Success|PDFs merged successfully!
- **100826WE+120826+170826+190826 (chromium)**: console: alert: Success|PDFs merged successfully!
