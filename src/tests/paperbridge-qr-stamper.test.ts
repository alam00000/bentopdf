import {
  defaultPosition,
  DEFAULT_QR_SIZE_PT,
} from '../js/paperbridge/qr-stamper';

const LETTER_W = 612; // US Letter in points
const LETTER_H = 792;
const A4_W = 595;
const A4_H = 842;

describe('defaultPosition', () => {
  it('places QR in bottom-right with 18pt margin on US Letter', () => {
    const marginPt = 18;
    const qrSize = DEFAULT_QR_SIZE_PT; // 60
    const labelBlockH = 18;

    const pos = defaultPosition(LETTER_W, LETTER_H);

    const expectedX = (LETTER_W - qrSize - marginPt) / LETTER_W;
    const expectedY = 1 - (qrSize + labelBlockH + marginPt) / LETTER_H;

    expect(pos.x).toBeCloseTo(expectedX, 6);
    expect(pos.y).toBeCloseTo(expectedY, 6);
  });

  it('places QR in bottom-right with 18pt margin on A4', () => {
    const marginPt = 18;
    const qrSize = DEFAULT_QR_SIZE_PT;
    const labelBlockH = 18;

    const pos = defaultPosition(A4_W, A4_H);

    const expectedX = (A4_W - qrSize - marginPt) / A4_W;
    const expectedY = 1 - (qrSize + labelBlockH + marginPt) / A4_H;

    expect(pos.x).toBeCloseTo(expectedX, 6);
    expect(pos.y).toBeCloseTo(expectedY, 6);
  });

  it('places QR in bottom-right on landscape Letter', () => {
    const marginPt = 18;
    const qrSize = DEFAULT_QR_SIZE_PT;
    const labelBlockH = 18;
    const w = LETTER_H;
    const h = LETTER_W;

    const pos = defaultPosition(w, h);

    const expectedX = (w - qrSize - marginPt) / w;
    const expectedY = 1 - (qrSize + labelBlockH + marginPt) / h;

    expect(pos.x).toBeCloseTo(expectedX, 6);
    expect(pos.y).toBeCloseTo(expectedY, 6);
  });

  it('x is less than 1 (QR stays on page)', () => {
    expect(defaultPosition(LETTER_W, LETTER_H).x).toBeLessThan(1);
    expect(defaultPosition(A4_W, A4_H).x).toBeLessThan(1);
  });

  it('y is between 0 and 1 (QR stays on page)', () => {
    const pos = defaultPosition(LETTER_W, LETTER_H);
    expect(pos.y).toBeGreaterThan(0);
    expect(pos.y).toBeLessThan(1);
  });

  it('respects a custom qrSize parameter', () => {
    const customSize = 40;
    const marginPt = 18;
    const labelBlockH = 18;

    const pos = defaultPosition(LETTER_W, LETTER_H, customSize);

    expect(pos.x).toBeCloseTo((LETTER_W - customSize - marginPt) / LETTER_W, 6);
    expect(pos.y).toBeCloseTo(
      1 - (customSize + labelBlockH + marginPt) / LETTER_H,
      6
    );
  });

  it('positions right of center (x > 0.5)', () => {
    expect(defaultPosition(LETTER_W, LETTER_H).x).toBeGreaterThan(0.5);
  });

  it('positions in bottom half (y > 0.5)', () => {
    expect(defaultPosition(LETTER_W, LETTER_H).y).toBeGreaterThan(0.5);
  });
});
