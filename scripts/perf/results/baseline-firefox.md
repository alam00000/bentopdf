# Merge Baseline

Run: 2026-09-02T05:50:48.922Z browser=firefox

| combo                         | browser | load+parse(ms) | merge(ms) | outcome | dl bytes  | mem after load(MB) | mem after merge(MB) |
| ----------------------------- | ------- | -------------- | --------- | ------- | --------- | ------------------ | ------------------- |
| sample                        | firefox | 381            | 1574      | ok      | 18328     | —                  | —                   |
| 190826                        | firefox | 508            | 2613      | ok      | 53978495  | —                  | —                   |
| 100826WE+120826               | firefox | 1504           | 9072      | ok      | 307665250 | —                  | —                   |
| 170826+190826                 | firefox | 945            | 4657      | ok      | 135291395 | —                  | —                   |
| 100826WE+120826+170826+190826 | firefox | 2386           | 13185     | ok      | 442980891 | —                  | —                   |

## cpdf build(s) loaded (expected: none — merge runs on the qpdf engine)

## Notes per run

- **sample (firefox)**: console: alert: Success|PDFs merged successfully!
- **190826 (firefox)**: console: alert: Success|PDFs merged successfully!
- **100826WE+120826 (firefox)**: console: alert: Success|PDFs merged successfully!
- **170826+190826 (firefox)**: console: alert: Success|PDFs merged successfully!
- **100826WE+120826+170826+190826 (firefox)**: console: alert: Success|PDFs merged successfully!
