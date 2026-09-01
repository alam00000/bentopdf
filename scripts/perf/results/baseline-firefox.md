# Merge Baseline

Run: 2026-09-01T14:46:02.930Z browser=firefox

| combo                         | browser | load+parse(ms) | merge(ms) | outcome | dl bytes  | mem after load(MB) | mem after merge(MB) |
| ----------------------------- | ------- | -------------- | --------- | ------- | --------- | ------------------ | ------------------- |
| sample                        | firefox | 345            | 1615      | ok      | 18328     | —                  | —                   |
| 190826                        | firefox | 494            | 2577      | ok      | 53978495  | —                  | —                   |
| 100826WE+120826               | firefox | 1448           | 9703      | ok      | 307665250 | —                  | —                   |
| 170826+190826                 | firefox | 983            | 4732      | ok      | 135291395 | —                  | —                   |
| 100826WE+120826+170826+190826 | firefox | 2368           | 13786     | ok      | 442980891 | —                  | —                   |

## cpdf build(s) loaded (expected: none - merge runs on the qpdf engine)

## Notes per run

- **sample (firefox)**: console: alert: Success|PDFs merged successfully!
- **190826 (firefox)**: console: alert: Success|PDFs merged successfully!
- **100826WE+120826 (firefox)**: console: alert: Success|PDFs merged successfully!
- **170826+190826 (firefox)**: console: alert: Success|PDFs merged successfully!
- **100826WE+120826+170826+190826 (firefox)**: console: alert: Success|PDFs merged successfully!
