/**
 * Pure TypeScript QR Code Generator (Model 2, Byte Mode, Error Correction L/M)
 * Zero external dependencies. Generates crisp, scalable vector SVG and Data URLs.
 */

// Galois Field GF(256) arithmetic for Reed-Solomon Error Correction
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 256) x ^= 0x11d; // Primitive polynomial x^8 + x^4 + x^3 + x^2 + 1
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < degree; i++) {
    const next = new Uint8Array(poly.length + 1);
    const factor = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], factor);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsCompute(data: Uint8Array, ecLength: number): Uint8Array {
  const gen = rsGeneratorPoly(ecLength);
  const res = new Uint8Array(ecLength);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ res[0];
    res.copyWithin(0, 1);
    res[ecLength - 1] = 0;
    for (let j = 0; j < ecLength; j++) {
      res[j] ^= gfMul(gen[j], factor);
    }
  }
  return res;
}

// Version table: [version, totalCodewords, dataCodewordsEC_M, ecCodewordsPerBlock, numBlocks]
// Suitable for URLs up to ~120 chars (Versions 1 to 5)
interface QrVersionSpec {
  version: number;
  size: number;
  totalDataBytes: number;
  ecBytes: number;
  alignCoords: number[];
}

const QR_SPECS: QrVersionSpec[] = [
  { version: 1, size: 21, totalDataBytes: 16, ecBytes: 10, alignCoords: [] },
  { version: 2, size: 25, totalDataBytes: 28, ecBytes: 16, alignCoords: [6, 18] },
  { version: 3, size: 29, totalDataBytes: 44, ecBytes: 26, alignCoords: [6, 22] },
  { version: 4, size: 33, totalDataBytes: 64, ecBytes: 36, alignCoords: [6, 26] },
  { version: 5, size: 37, totalDataBytes: 86, ecBytes: 48, alignCoords: [6, 30] },
];

/**
 * Generates an SVG string representation of a QR Code for any text or URL.
 */
export function generateQrCodeSvg(
  text: string,
  options: {
    size?: number;
    color?: string;
    bgColor?: string;
    margin?: number;
    includeCenterBadge?: boolean;
    centerBadgeText?: string;
  } = {}
): string {
  const {
    size = 200,
    color = '#1e1b18',
    bgColor = '#ffffff',
    margin = 2,
    includeCenterBadge = false,
    centerBadgeText = 'RSVP',
  } = options;

  const utf8Bytes = new TextEncoder().encode(text);

  // Pick appropriate version
  let spec = QR_SPECS[0];
  for (const s of QR_SPECS) {
    if (s.totalDataBytes >= utf8Bytes.length + 3) {
      spec = s;
      break;
    }
    spec = s;
  }

  const matrixSize = spec.size;
  // Initialize grid: 0=white, 1=black, -1=unset
  const grid: number[][] = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(-1));
  const reserved: boolean[][] = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false));

  const setModule = (r: number, c: number, val: number) => {
    if (r >= 0 && r < matrixSize && c >= 0 && c < matrixSize) {
      grid[r][c] = val;
      reserved[r][c] = true;
    }
  };

  // 1. Finder Patterns (7x7) at (0,0), (0, size-7), (size-7, 0)
  const drawFinder = (top: number, left: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          setModule(top + r, left + c, 1);
        } else {
          setModule(top + r, left + c, 0);
        }
      }
    }
    // Separator around finders
    for (let i = -1; i <= 7; i++) {
      setModule(top - 1, left + i, 0);
      setModule(top + 7, left + i, 0);
      setModule(top + i, left - 1, 0);
      setModule(top + i, left + 7, 0);
    }
  };

  drawFinder(0, 0);
  drawFinder(0, matrixSize - 7);
  drawFinder(matrixSize - 7, 0);

  // 2. Alignment Patterns
  if (spec.alignCoords.length > 0) {
    for (const r of spec.alignCoords) {
      for (const c of spec.alignCoords) {
        // Skip if overlaps with finders
        if (
          (r < 8 && c < 8) ||
          (r < 8 && c >= matrixSize - 8) ||
          (r >= matrixSize - 8 && c < 8)
        ) {
          continue;
        }
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.max(Math.abs(dr), Math.abs(dc)) === 2;
            const isCenter = dr === 0 && dc === 0;
            setModule(r + dr, c + dc, isBorder || isCenter ? 1 : 0);
          }
        }
      }
    }
  }

  // 3. Timing Patterns (Row 6 and Col 6)
  for (let i = 8; i < matrixSize - 8; i++) {
    if (!reserved[6][i]) setModule(6, i, i % 2 === 0 ? 1 : 0);
    if (!reserved[i][6]) setModule(i, 6, i % 2 === 0 ? 1 : 0);
  }

  // Dark module
  setModule(matrixSize - 8, 8, 1);

  // Format info area reservation
  for (let i = 0; i < 9; i++) {
    if (!reserved[8][i]) {
      grid[8][i] = 0;
      reserved[8][i] = true;
    }
    if (!reserved[i][8]) {
      grid[i][8] = 0;
      reserved[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    if (!reserved[8][matrixSize - 1 - i]) {
      grid[8][matrixSize - 1 - i] = 0;
      reserved[8][matrixSize - 1 - i] = true;
    }
    if (!reserved[matrixSize - 1 - i][8]) {
      grid[matrixSize - 1 - i][8] = 0;
      reserved[matrixSize - 1 - i][8] = true;
    }
  }

  // 4. Encode Data in Byte Mode (0100)
  const bitBuffer: number[] = [];
  const pushBits = (val: number, length: number) => {
    for (let i = length - 1; i >= 0; i--) {
      bitBuffer.push((val >> i) & 1);
    }
  };

  pushBits(0b0100, 4); // Byte mode indicator
  pushBits(utf8Bytes.length, 8); // Character count indicator (8 bits for version 1-9)
  for (const b of utf8Bytes) {
    pushBits(b, 8);
  }

  // Terminator (up to 4 zeroes)
  const totalDataBits = spec.totalDataBytes * 8;
  const termLength = Math.min(4, totalDataBits - bitBuffer.length);
  for (let i = 0; i < termLength; i++) bitBuffer.push(0);

  // Pad to multiple of 8
  while (bitBuffer.length % 8 !== 0) bitBuffer.push(0);

  // Pad bytes (0xEC, 0x11)
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bitBuffer.length < totalDataBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to bytes
  const dataBytes = new Uint8Array(spec.totalDataBytes);
  for (let i = 0; i < spec.totalDataBytes; i++) {
    let byteVal = 0;
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bitBuffer[i * 8 + b];
    }
    dataBytes[i] = byteVal;
  }

  // Calculate Error Correction Codewords
  const ecCodewords = rsCompute(dataBytes, spec.ecBytes);

  // Combined Codewords (Data + EC)
  const allBytes = new Uint8Array(spec.totalDataBytes + spec.ecBytes);
  allBytes.set(dataBytes, 0);
  allBytes.set(ecCodewords, spec.totalDataBytes);

  const finalBits: number[] = [];
  for (const byte of allBytes) {
    for (let i = 7; i >= 0; i--) {
      finalBits.push((byte >> i) & 1);
    }
  }

  // 5. Place Data Bits in 2-column zig-zag upward/downward strips
  let bitIdx = 0;
  let upwards = true;
  for (let rightCol = matrixSize - 1; rightCol > 0; rightCol -= 2) {
    if (rightCol === 6) rightCol = 5; // Skip vertical timing column
    const rows = upwards
      ? Array.from({ length: matrixSize }, (_, i) => matrixSize - 1 - i)
      : Array.from({ length: matrixSize }, (_, i) => i);

    for (const r of rows) {
      for (const c of [rightCol, rightCol - 1]) {
        if (!reserved[r][c]) {
          const bit = bitIdx < finalBits.length ? finalBits[bitIdx++] : 0;
          // Apply Mask Pattern 000: (row + col) % 2 === 0
          const mask = (r + c) % 2 === 0;
          grid[r][c] = (bit ^ (mask ? 1 : 0)) === 1 ? 1 : 0;
        }
      }
    }
    upwards = !upwards;
  }

  // 6. Format Information (Mask 0, Error Correction M = 00) -> 101010000010010
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  // Write format info to grid
  for (let i = 0; i < 6; i++) grid[8][i] = formatBits[i];
  grid[8][7] = formatBits[6];
  grid[8][8] = formatBits[7];
  grid[7][8] = formatBits[8];
  for (let i = 0; i < 6; i++) grid[5 - i][8] = formatBits[9 + i];

  for (let i = 0; i < 7; i++) grid[matrixSize - 1 - i][8] = formatBits[i];
  for (let i = 0; i < 8; i++) grid[8][matrixSize - 8 + i] = formatBits[7 + i];

  // 7. Render SVG Path
  const totalDimension = matrixSize + margin * 2;
  const pathParts: string[] = [];

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (grid[r][c] === 1) {
        // Skip center modules if center badge is enabled
        if (includeCenterBadge) {
          const center = Math.floor(matrixSize / 2);
          if (Math.abs(r - center) <= 2 && Math.abs(c - center) <= 2) {
            continue;
          }
        }
        pathParts.push(`M${c + margin},${r + margin}h1v1h-1z`);
      }
    }
  }

  let centerBadgeSvg = '';
  if (includeCenterBadge) {
    const center = Math.floor(matrixSize / 2) + margin;
    centerBadgeSvg = `
      <rect x="${center - 2.5}" y="${center - 1.5}" width="5" height="3" rx="0.6" fill="${bgColor}" stroke="${color}" stroke-width="0.3"/>
      <text x="${center}" y="${center + 0.6}" font-family="Arial, sans-serif" font-weight="bold" font-size="1.4" text-anchor="middle" fill="${color}">${centerBadgeText}</text>
    `;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalDimension} ${totalDimension}" width="${size}" height="${size}" shape-rendering="crispEdges">
    <rect width="${totalDimension}" height="${totalDimension}" fill="${bgColor}"/>
    <path d="${pathParts.join('')}" fill="${color}"/>
    ${centerBadgeSvg}
  </svg>`;
}

/**
 * Returns a base64 Data URL for the QR code SVG.
 */
export function generateQrCodeDataUrl(text: string, options: Parameters<typeof generateQrCodeSvg>[1] = {}): string {
  const svg = generateQrCodeSvg(text, options);
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  return `data:image/svg+xml;charset=utf-8,${encoded}`;
}
