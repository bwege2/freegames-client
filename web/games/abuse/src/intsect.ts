// intsect.cpp: where a moving point's line meets a boundary line (int32 arithmetic, wrapping as compiled)
const imul = Math.imul;
const idiv = (a: number, b: number): number => (a / b) | 0;

/** setback_intersect(x1, y1, &x2, &y2, ...): returns [hit, x2, y2] */
export function setback_intersect(x1: number, y1: number, x2: number, y2: number, xp1: number, yp1: number, xp2: number,
  yp2: number, inside: number): [number, number, number] {
  const a1 = (y2 - y1) | 0, b1 = (x1 - x2) | 0, c1 = (-imul(x1, y2) + imul(x2, y1)) | 0;
  let r1: number, r2: number;
  if (yp1 < yp2 || (yp1 === yp2 && xp1 > xp2)) {
    r1 = yp1; yp1 = yp2; yp2 = r1;
    r1 = xp1; xp1 = xp2; xp2 = r1;
  }
  r1 = (imul(xp1, a1) + imul(yp1, b1) + c1) | 0;
  r2 = (imul(xp2, a1) + imul(yp2, b1) + c1) | 0;
  if ((r1 ^ r2) <= 0 || r1 === 0 || r2 === 0) {
    const a2 = (yp2 - yp1) | 0, b2 = (xp1 - xp2) | 0, c2 = (-imul(xp1, yp2) + imul(xp2, yp1)) | 0;
    r1 = (imul(x1, a2) + imul(y1, b2) + c2) | 0;
    r2 = (imul(x2, a2) + imul(y2, b2) + c2) | 0;
    if ((r1 ^ r2) <= 0 || r1 === 0 || r2 === 0) {
      if ((xp1 < xp2 && (r2 ^ inside) > 0) || (xp1 >= xp2 && (r2 ^ inside) < 0) || inside === 0 || r2 === 0) {
        const ae = imul(a1, b2), bd = imul(b1, a2);
        if (ae !== bd) {
          x2 = idiv((imul(b1, c2) - imul(b2, c1)) | 0, (ae - bd) | 0);
          y2 = idiv((imul(a1, c2) - imul(a2, c1)) | 0, (bd - ae) | 0);
          if (y2 !== y1) {
            if (y2 > y1) y2--;
            else y2++;
          }
          if (x2 !== x1) {
            if (x2 > x1) x2--;
            else x2++;
          }
          if (inside) {
            r1 = (imul(x1, a2) + imul(y1, b2) + c2) | 0;
            r2 = (imul(x2, a2) + imul(y2, b2) + c2) | 0;
            if (r2 !== 0 && (r1 ^ r2) < 0) {
              x2 = x1;
              y2 = y1;
            }
          }
          return [1, x2, y2];
        }
      }
    }
  }
  return [0, x2, y2];
}
