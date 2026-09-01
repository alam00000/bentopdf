# Merge Baseline

Run: 2026-09-01T17:03:53.534Z browser=firefox

| combo                         | browser | load+parse(ms) | merge(ms) | outcome | dl bytes  | mem after load(MB) | mem after merge(MB) |
| ----------------------------- | ------- | -------------- | --------- | ------- | --------- | ------------------ | ------------------- |
| sample                        | firefox | 346            | 1578      | ok      | 18328     | —                  | —                   |
| 190826                        | firefox | 453            | 2606      | ok      | 53978495  | —                  | —                   |
| 100826WE+120826               | firefox | 1478           | 9758      | ok      | 307665250 | —                  | —                   |
| 170826+190826                 | firefox | 950            | 4688      | ok      | 135291395 | —                  | —                   |
| 100826WE+120826+170826+190826 | firefox | 2344           | 14045     | ok      | 442980891 | —                  | —                   |

## cpdf build(s) loaded (expected: none - merge runs on the qpdf engine)

## Notes per run

- **sample (firefox)**: console: alert: Success|PDFs merged successfully!
- **190826 (firefox)**: console: alert: Success|PDFs merged successfully!
- **100826WE+120826 (firefox)**: console: alert: Success|PDFs merged successfully!
- **170826+190826 (firefox)**: console: alert: Success|PDFs merged successfully!
- **100826WE+120826+170826+190826 (firefox)**: console: alert: Success|PDFs merged successfully!
