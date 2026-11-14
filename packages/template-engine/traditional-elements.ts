/**
 * Culturally Rich Traditional Indian Wedding Vector Elements
 * Self-contained vector artwork generators for royal Indian wedding ceremonies.
 */

export function renderGaneshaRoyal(stroke: string, _fill: string = 'none'): string {
  return `
    <g stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Crown / Mukut -->
      <path d="M42 22 L50 6 L58 22 Z" fill="${stroke}" fill-opacity="0.25" stroke-width="1.5"/>
      <path d="M46 16 L50 8 L54 16 Z" fill="${stroke}" stroke-width="1"/>
      <path d="M38 22 Q50 18 62 22" stroke-width="2"/>
      
      <!-- Forehead & Trishul Tilak -->
      <path d="M50 20 L50 32" stroke-width="2"/>
      <path d="M47 24 Q50 22 53 24" stroke-width="1.5"/>
      <circle cx="50" cy="34" r="1.5" fill="${stroke}"/>
      
      <!-- Ears (Large Auspicious) -->
      <!-- Left Ear -->
      <path d="M38 23 C20 22 18 38 26 48 C32 54 39 46 38 40" stroke-width="1.8" fill="${stroke}" fill-opacity="0.08"/>
      <!-- Right Ear -->
      <path d="M62 23 C80 22 82 38 74 48 C68 54 61 46 62 40" stroke-width="1.8" fill="${stroke}" fill-opacity="0.08"/>
      
      <!-- Head Contour & Brow -->
      <path d="M38 28 C42 26 46 26 50 26 C54 26 58 26 62 28" stroke-width="1.5"/>
      <path d="M36 36 Q42 34 46 37" stroke-width="1.2"/>
      <path d="M64 36 Q58 34 54 37" stroke-width="1.2"/>
      
      <!-- Divine Eyes -->
      <path d="M42 36 Q45 34 48 36" stroke-width="1.2"/>
      <circle cx="45" cy="36" r="0.8" fill="${stroke}"/>
      <path d="M52 36 Q55 34 58 36" stroke-width="1.2"/>
      <circle cx="55" cy="36" r="0.8" fill="${stroke}"/>
      
      <!-- Trunk (Vakratunda) curving left with Modak -->
      <path d="M50 38 C51 48 48 58 42 66 C36 74 24 73 24 65 C24 58 32 58 34 62" stroke-width="2.2"/>
      <path d="M46 42 C48 50 45 56 40 62" stroke-width="1.2"/>
      <!-- Modak in trunk -->
      <path d="M22 62 Q24 56 28 58 Q30 62 26 66 Z" fill="${stroke}" stroke-width="1"/>
      
      <!-- Single Tusk (Ekadanta) -->
      <path d="M55 42 L60 45 L56 46 Z" fill="${stroke}" stroke-width="1"/>
      <path d="M44 42 L42 44" stroke-width="1.5"/>
      
      <!-- Auspicious Halo / Prabhavali Arc -->
      <path d="M22 30 C20 12 80 12 78 30" stroke-width="1" stroke-dasharray="2 3" opacity="0.6"/>
      <circle cx="50" cy="5" r="2" fill="${stroke}"/>
    </g>
  `;
}

export function renderGaneshaMinimal(stroke: string): string {
  return `
    <g stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Calligraphic single stroke Ganesha -->
      <path d="M48 10 Q50 6 52 10 Q54 18 50 22" stroke-width="2"/>
      <path d="M34 24 C24 24 22 38 32 44 C42 50 58 36 50 24 C44 16 38 22 38 32 C38 46 62 52 56 68 C52 76 38 78 36 68 C34 60 44 60 46 64" stroke-width="2.5"/>
      <!-- Tilak / Tika -->
      <path d="M42 16 Q50 14 58 16" stroke-width="1.8"/>
      <circle cx="50" cy="18" r="1.5" fill="${stroke}"/>
      <!-- Modak sweet -->
      <circle cx="34" cy="64" r="3" fill="${stroke}"/>
    </g>
  `;
}

export function renderSwastik(stroke: string, _fill: string = 'none'): string {
  return `
    <g stroke="${stroke}" stroke-linecap="square" stroke-linejoin="miter" fill="none">
      <!-- Central Vedic Cross -->
      <line x1="50" y1="15" x2="50" y2="85" stroke-width="5"/>
      <line x1="15" y1="50" x2="85" y2="50" stroke-width="5"/>
      <!-- 4 Clockwise Auspicious Arms -->
      <line x1="50" y1="15" x2="85" y2="15" stroke-width="5"/>
      <line x1="85" y1="50" x2="85" y2="85" stroke-width="5"/>
      <line x1="50" y1="85" x2="15" y2="85" stroke-width="5"/>
      <line x1="15" y1="50" x2="15" y2="15" stroke-width="5"/>
      <!-- 4 Sacred Bindu Dots (Dharma, Artha, Kama, Moksha) -->
      <circle cx="32" cy="32" r="3.5" fill="${stroke}" stroke="none"/>
      <circle cx="68" cy="32" r="3.5" fill="${stroke}" stroke="none"/>
      <circle cx="68" cy="68" r="3.5" fill="${stroke}" stroke="none"/>
      <circle cx="32" cy="68" r="3.5" fill="${stroke}" stroke="none"/>
    </g>
  `;
}

export function renderOm(stroke: string, _fill: string = 'none'): string {
  return `
    <g stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Sacred ॐ (Pranava) Calligraphy -->
      <!-- Left Upper 3 Loop -->
      <path d="M38 32 C34 22 46 16 56 22 C64 28 60 38 50 42" stroke-width="3.5"/>
      <!-- Left Lower 3 Loop with Upper Tail -->
      <path d="M50 42 C62 44 66 56 60 66 C52 76 34 74 34 62 C34 54 44 52 48 58" stroke-width="3.5"/>
      <!-- Center Upward Sweep -->
      <path d="M50 42 C64 42 74 54 78 72" stroke-width="3"/>
      <!-- Right S-curve Arch -->
      <path d="M68 36 C76 32 82 38 80 50 C78 62 84 68 88 64" stroke-width="3"/>
      <!-- Chandrabindu (Crescent Moon and Dot) -->
      <path d="M64 22 Q74 28 84 22" stroke-width="2.5"/>
      <circle cx="74" cy="15" r="2.5" fill="${stroke}" stroke="none"/>
    </g>
  `;
}

export function renderDoli(stroke: string, _fill: string = 'none'): string {
  return `
    <g stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Carrying Poles (Front & Back Doli Dande) -->
      <line x1="4" y1="52" x2="96" y2="52" stroke-width="2.8"/>
      <circle cx="4" cy="52" r="2.5" fill="${stroke}"/>
      <circle cx="96" cy="52" r="2.5" fill="${stroke}"/>

      <!-- Palanquin Dome & Kalash Finial -->
      <path d="M50 14 L50 20" stroke-width="2"/>
      <circle cx="50" cy="13" r="2" fill="${stroke}"/>
      <path d="M32 30 C34 20 66 20 68 30 Z" fill="${stroke}" fill-opacity="0.2" stroke-width="1.8"/>

      <!-- Ornate Scalloped Canopy Roof -->
      <path d="M26 36 Q38 30 50 30 Q62 30 74 36 L72 40 L28 40 Z" fill="${stroke}" fill-opacity="0.1" stroke-width="1.8"/>
      <!-- Hanging Pearl Tassels on Canopy -->
      <circle cx="30" cy="42" r="1.2" fill="${stroke}"/>
      <circle cx="40" cy="42" r="1.2" fill="${stroke}"/>
      <circle cx="50" cy="42" r="1.2" fill="${stroke}"/>
      <circle cx="60" cy="42" r="1.2" fill="${stroke}"/>
      <circle cx="70" cy="42" r="1.2" fill="${stroke}"/>

      <!-- Carved Royal Pillars -->
      <line x1="30" y1="40" x2="30" y2="76" stroke-width="2"/>
      <line x1="70" y1="40" x2="70" y2="76" stroke-width="2"/>
      <line x1="50" y1="40" x2="50" y2="76" stroke-width="1.2" stroke-dasharray="2 3"/>

      <!-- Draped Curtains (Parda) Tied With Silk Cord -->
      <path d="M30 42 Q38 56 32 70" stroke-width="1.5"/>
      <path d="M70 42 Q62 56 68 70" stroke-width="1.5"/>
      <ellipse cx="33" cy="58" rx="2" ry="1.5" fill="${stroke}"/>
      <ellipse cx="67" cy="58" rx="2" ry="1.5" fill="${stroke}"/>

      <!-- Base Carriage & Floral Floor -->
      <path d="M24 76 L76 76 L72 82 L28 82 Z" fill="${stroke}" fill-opacity="0.25" stroke-width="2"/>
      <line x1="28" y1="82" x2="72" y2="82" stroke-width="1.5"/>
      
      <!-- Bottom Decorative Hanging Latkan / Bells -->
      <path d="M36 82 L36 86" stroke-width="1.2"/>
      <circle cx="36" cy="87" r="1.5" fill="${stroke}"/>
      <path d="M50 82 L50 87" stroke-width="1.2"/>
      <circle cx="50" cy="88" r="1.8" fill="${stroke}"/>
      <path d="M64 82 L64 86" stroke-width="1.2"/>
      <circle cx="64" cy="87" r="1.5" fill="${stroke}"/>
    </g>
  `;
}

export function renderShehnai(stroke: string, _fill: string = 'none'): string {
  return `
    <g stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Shehnai Pipe -->
      <path d="M24 76 L62 38" stroke-width="3"/>
      <!-- Mouthpiece (Pari) -->
      <line x1="62" y1="38" x2="68" y2="32" stroke-width="1.8"/>
      <ellipse cx="69" cy="31" rx="2" ry="1.2" fill="${stroke}"/>
      <!-- Flared Bell (Pitali Horn) -->
      <path d="M24 76 C18 82 12 78 16 70 C20 62 26 70 24 76 Z" fill="${stroke}" fill-opacity="0.3" stroke-width="2"/>
      <!-- Sound Holes -->
      <circle cx="36" cy="64" r="1.2" fill="${stroke}"/>
      <circle cx="43" cy="57" r="1.2" fill="${stroke}"/>
      <circle cx="50" cy="50" r="1.2" fill="${stroke}"/>
      <circle cx="57" cy="43" r="1.2" fill="${stroke}"/>
      <!-- Hanging Decorative Silk Ribbons -->
      <path d="M22 75 Q18 88 24 94 Q28 92 24 84" stroke-width="1.2"/>

      <!-- Festive Dholak / Tabla -->
      <!-- Dholak Body -->
      <ellipse cx="68" cy="68" rx="18" ry="12" fill="${stroke}" fill-opacity="0.15" stroke-width="2" transform="rotate(-20 68 68)"/>
      <!-- Drum Heads -->
      <ellipse cx="53" cy="74" rx="3.5" ry="9" fill="${stroke}" fill-opacity="0.3" stroke-width="1.5" transform="rotate(-20 53 74)"/>
      <ellipse cx="83" cy="62" rx="3" ry="8" fill="${stroke}" fill-opacity="0.3" stroke-width="1.5" transform="rotate(-20 83 62)"/>
      <!-- Zig-Zag Tuning Cords (Kassi) -->
      <path d="M53 66 L66 61 L54 75 L73 63 L60 80 L80 66" stroke-width="1"/>
      
      <!-- Celebratory Musical Notes & Sparkles -->
      <path d="M78 28 Q82 24 88 28 L88 38" stroke-width="1.2"/>
      <circle cx="86" cy="38" r="2" fill="${stroke}"/>
      <path d="M70 18 Q74 14 80 18 L80 26" stroke-width="1.2"/>
      <circle cx="78" cy="26" r="1.8" fill="${stroke}"/>
      <circle cx="38" cy="26" r="1" fill="${stroke}"/>
      <circle cx="30" cy="36" r="1.5" fill="${stroke}"/>
    </g>
  `;
}

export function renderBaaratElephant(stroke: string, _fill: string = 'none'): string {
  return `
    <g stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Royal Howdah (Canopy / Seat atop Elephant) -->
      <path d="M44 26 L56 26 L58 32 L42 32 Z" fill="${stroke}" fill-opacity="0.3" stroke-width="1.5"/>
      <path d="M42 26 Q50 20 58 26" stroke-width="1.5"/>
      <line x1="50" y1="20" x2="50" y2="16" stroke-width="1.2"/>
      <circle cx="50" cy="15" r="1.2" fill="${stroke}"/>

      <!-- Elephant Head & Raised Auspicious Trunk -->
      <!-- Forehead & Ear -->
      <path d="M54 36 C64 36 68 44 64 52 C60 58 54 54 52 48" stroke-width="1.8" fill="${stroke}" fill-opacity="0.1"/>
      <!-- Forehead Jeweled Plate (Nettipattam) -->
      <path d="M60 40 L64 48 L58 48 Z" fill="${stroke}" stroke-width="1"/>
      <circle cx="61" cy="44" r="1" fill="${stroke}"/>
      <!-- Raised Trunk (Greeting / Blessing) -->
      <path d="M66 42 C76 42 86 32 82 24 C80 20 74 22 75 26 C76 30 72 36 64 46" stroke-width="2.5"/>
      <!-- Tusk -->
      <path d="M66 48 L74 46 L70 50 Z" fill="${stroke}" stroke-width="1"/>
      <!-- Eye -->
      <circle cx="60" cy="40" r="1" fill="${stroke}"/>

      <!-- Body Contour -->
      <path d="M42 34 C30 36 24 46 26 62 L26 78 L34 78 L36 66 C42 66 46 66 50 66 L52 78 L60 78 L62 58 C62 50 56 42 50 36" stroke-width="2"/>
      <!-- Rear Leg Detail & Tail -->
      <path d="M26 58 Q22 66 24 74" stroke-width="1.2"/>
      <circle cx="24" cy="74" r="1" fill="${stroke}"/>

      <!-- Royal Saddle Cloth (Jhool) with Embroidered Scallops -->
      <path d="M34 40 L52 40 L50 56 L36 56 Z" fill="${stroke}" fill-opacity="0.25" stroke-width="1.5"/>
      <path d="M36 56 Q40 60 44 56 Q48 60 50 56" stroke-width="1.2"/>
      
      <!-- Jeweled Anklets -->
      <line x1="26" y1="74" x2="34" y2="74" stroke-width="1.5"/>
      <line x1="52" y1="74" x2="60" y2="74" stroke-width="1.5"/>
    </g>
  `;
}

export function renderHavanKund(stroke: string, _fill: string = 'none'): string {
  return `
    <g stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Sacred Holy Flames (Agni Shikha) -->
      <!-- Center Main Flame -->
      <path d="M50 20 C46 32 38 38 42 48 C46 56 54 56 58 48 C62 38 54 32 50 20 Z" fill="${stroke}" fill-opacity="0.35" stroke-width="1.8"/>
      <!-- Inner Glowing Core -->
      <path d="M50 30 C48 38 44 42 46 48 C48 52 52 52 54 48 C56 42 52 38 50 30 Z" fill="${stroke}" stroke-width="1"/>
      <!-- Left Flame Tongue -->
      <path d="M42 32 C36 40 38 48 44 50" stroke-width="1.8"/>
      <!-- Right Flame Tongue -->
      <path d="M58 32 C64 40 62 48 56 50" stroke-width="1.8"/>

      <!-- Sacred Wood Logs (Samidha) -->
      <line x1="32" y1="52" x2="68" y2="52" stroke-width="3"/>
      <line x1="36" y1="48" x2="64" y2="54" stroke-width="2"/>
      <line x1="64" y1="48" x2="36" y2="54" stroke-width="2"/>

      <!-- Copper Havan Kund - Upper Tier -->
      <polygon points="26,54 74,54 68,66 32,66" fill="${stroke}" fill-opacity="0.15" stroke-width="2"/>
      <!-- Side Handles -->
      <path d="M26 56 C20 56 20 64 27 64" stroke-width="1.8"/>
      <path d="M74 56 C80 56 80 64 73 64" stroke-width="1.8"/>

      <!-- Mid Step Tier -->
      <polygon points="32,66 68,66 64,74 36,74" fill="${stroke}" fill-opacity="0.25" stroke-width="1.8"/>

      <!-- Base Altar Tier -->
      <rect x="28" y="74" width="44" height="6" rx="1.5" fill="${stroke}" fill-opacity="0.3" stroke-width="2"/>
      <rect x="22" y="80" width="56" height="4" rx="1" fill="${stroke}" fill-opacity="0.2" stroke-width="1.8"/>
    </g>
  `;
}

export function renderMangalsutra(stroke: string, _fill: string = 'none'): string {
  return `
    <g stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Sacred Black & Gold Beaded Necklace Chain -->
      <path d="M20 22 C30 46 42 62 50 64 C58 62 70 46 80 22" stroke-width="1.5"/>
      <!-- Auspicious Beads on Chain -->
      <circle cx="28" cy="38" r="2" fill="${stroke}"/>
      <circle cx="36" cy="49" r="2" fill="${stroke}"/>
      <circle cx="44" cy="58" r="2" fill="${stroke}"/>
      <circle cx="56" cy="58" r="2" fill="${stroke}"/>
      <circle cx="64" cy="49" r="2" fill="${stroke}"/>
      <circle cx="72" cy="38" r="2" fill="${stroke}"/>

      <!-- Golden Center Pendant (Tanmaniya) -->
      <!-- Center Floral Knot -->
      <circle cx="50" cy="65" r="4" fill="${stroke}" fill-opacity="0.3" stroke-width="1.8"/>
      <circle cx="50" cy="65" r="1.5" fill="${stroke}"/>
      <!-- Two Golden Vati (Auspicious Half Spheres) -->
      <ellipse cx="44" cy="72" rx="4.5" ry="5.5" fill="${stroke}" fill-opacity="0.25" stroke-width="1.8"/>
      <ellipse cx="56" cy="72" rx="4.5" ry="5.5" fill="${stroke}" fill-opacity="0.25" stroke-width="1.8"/>
      <!-- Hanging Pearl Droplets -->
      <line x1="44" y1="77.5" x2="44" y2="82" stroke-width="1.2"/>
      <circle cx="44" cy="83" r="1.5" fill="${stroke}"/>
      <line x1="56" y1="77.5" x2="56" y2="82" stroke-width="1.2"/>
      <circle cx="56" cy="83" r="1.5" fill="${stroke}"/>
      <line x1="50" y1="69" x2="50" y2="76" stroke-width="1.2"/>
      <circle cx="50" cy="77" r="1.5" fill="${stroke}"/>
    </g>
  `;
}

export function renderPeacockPair(stroke: string, _fill: string = 'none'): string {
  return `
    <g stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Left Peacock -->
      <!-- Crest -->
      <line x1="36" y1="36" x2="33" y2="28" stroke-width="1"/>
      <circle cx="33" cy="27" r="1" fill="${stroke}"/>
      <line x1="37" y1="35" x2="37" y2="26" stroke-width="1"/>
      <circle cx="37" cy="25" r="1" fill="${stroke}"/>
      <!-- Head & Graceful Neck -->
      <path d="M38 38 C34 40 32 46 38 52 C44 58 42 66 36 72" stroke-width="2"/>
      <!-- Eye & Beak -->
      <circle cx="36" cy="38" r="0.8" fill="${stroke}"/>
      <path d="M38 39 L42 40 L38 41 Z" fill="${stroke}" stroke-width="0.8"/>
      <!-- Left Body & Wing -->
      <ellipse cx="30" cy="62" rx="10" ry="7" fill="${stroke}" fill-opacity="0.15" stroke-width="1.8" transform="rotate(30 30 62)"/>
      <!-- Tail Plumes -->
      <path d="M22 66 C14 62 8 72 16 80 C24 88 32 78 30 70" stroke-width="1.5"/>
      <circle cx="16" cy="76" r="2" fill="${stroke}"/>

      <!-- Right Facing Peacock -->
      <!-- Crest -->
      <line x1="64" y1="36" x2="67" y2="28" stroke-width="1"/>
      <circle cx="67" cy="27" r="1" fill="${stroke}"/>
      <line x1="63" y1="35" x2="63" y2="26" stroke-width="1"/>
      <circle cx="63" cy="25" r="1" fill="${stroke}"/>
      <!-- Head & Graceful Neck -->
      <path d="M62 38 C66 40 68 46 62 52 C56 58 58 66 64 72" stroke-width="2"/>
      <!-- Eye & Beak -->
      <circle cx="64" cy="38" r="0.8" fill="${stroke}"/>
      <path d="M62 39 L58 40 L62 41 Z" fill="${stroke}" stroke-width="0.8"/>
      <!-- Right Body & Wing -->
      <ellipse cx="70" cy="62" rx="10" ry="7" fill="${stroke}" fill-opacity="0.15" stroke-width="1.8" transform="rotate(-30 70 62)"/>
      <!-- Tail Plumes -->
      <path d="M78 66 C86 62 92 72 84 80 C76 88 68 78 70 70" stroke-width="1.5"/>
      <circle cx="84" cy="76" r="2" fill="${stroke}"/>

      <!-- Center Interlaced Lotus Garland -->
      <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="${stroke}" fill-opacity="0.25" stroke-width="1.5"/>
      <path d="M50 54 Q44 48 50 42 Q56 48 50 54 Z" fill="${stroke}" fill-opacity="0.3" stroke-width="1.2"/>
    </g>
  `;
}

export function renderDiya(stroke: string, _fill: string = 'none'): string {
  return `
    <g stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Auspicious Glow Aura -->
      <circle cx="50" cy="32" r="18" fill="${stroke}" fill-opacity="0.08" stroke="none"/>
      
      <!-- Holy Flame (Deepak Shikha) -->
      <path d="M50 18 C46 26 42 32 46 40 C48 44 52 44 54 40 C58 32 54 26 50 18 Z" fill="${stroke}" fill-opacity="0.3" stroke-width="1.8"/>
      <!-- Core Flame -->
      <path d="M50 25 C48 31 46 34 48 39 C49 41 51 41 52 39 C54 34 52 31 50 25 Z" fill="${stroke}" stroke-width="1"/>

      <!-- Brass Oil Cup (Deepak Bowl) -->
      <path d="M24 50 C24 64 76 64 76 50 Q50 54 24 50 Z" fill="${stroke}" fill-opacity="0.25" stroke-width="2"/>
      <path d="M22 50 Q50 46 78 50" stroke-width="1.5"/>
      <!-- Wick Holder Lip -->
      <path d="M46 48 L50 44 L54 48" stroke-width="1.5"/>

      <!-- Tiered Pedestal Base -->
      <path d="M44 61 L42 72 L58 72 L56 61" stroke-width="1.8"/>
      <rect x="34" y="72" width="32" height="6" rx="2" fill="${stroke}" fill-opacity="0.2" stroke-width="2"/>
      <rect x="28" y="78" width="44" height="4" rx="1.5" fill="${stroke}" fill-opacity="0.15" stroke-width="1.5"/>
    </g>
  `;
}

export function renderNamaste(stroke: string, _fill: string = 'none'): string {
  return `
    <g stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Lotus Blossom Backdrop -->
      <path d="M50 22 C42 34 32 48 34 60 C38 64 46 64 50 56 C54 64 62 64 66 60 C68 48 58 34 50 22 Z" fill="${stroke}" fill-opacity="0.1" stroke-width="1.2"/>

      <!-- Folded Hands in Anjali Mudra (Namaste / Atithi Devo Bhava) -->
      <!-- Left Hand Fingers & Palm -->
      <path d="M50 26 C48 30 46 38 46 48 C46 56 42 66 38 72 L44 76 C48 70 50 62 50 50" stroke-width="2"/>
      <path d="M49 32 C47 38 46 46 47 54" stroke-width="1.2"/>
      
      <!-- Right Hand Fingers & Palm (Mirror) -->
      <path d="M50 26 C52 30 54 38 54 48 C54 56 58 66 62 72 L56 76 C52 70 50 62 50 50" stroke-width="2"/>
      <path d="M51 32 C53 38 54 46 53 54" stroke-width="1.2"/>

      <!-- Wrist Cuffs & Auspicious Bracelets (Kangan) -->
      <path d="M38 72 Q44 74 50 72" stroke-width="2"/>
      <path d="M50 72 Q56 74 62 72" stroke-width="2"/>
      <path d="M36 76 Q44 78 50 76" stroke-width="1.5"/>
      <path d="M50 76 Q56 78 64 76" stroke-width="1.5"/>
      <circle cx="50" cy="80" r="1.5" fill="${stroke}"/>
    </g>
  `;
}

export function renderMarigoldGarland(stroke: string, _fill: string = 'none'): string {
  return `
    <g stroke="${stroke}" stroke-linecap="round" stroke-linejoin="round" fill="none">
      <!-- Hanging Thread / Dori -->
      <line x1="50" y1="4" x2="50" y2="96" stroke-width="1.2" stroke-dasharray="2 2"/>
      
      <!-- Blossom 1 (Top) -->
      <circle cx="50" cy="18" r="10" fill="${stroke}" fill-opacity="0.3" stroke-width="1.5"/>
      <circle cx="50" cy="18" r="6" fill="${stroke}" fill-opacity="0.4" stroke-width="1.2"/>
      <circle cx="50" cy="18" r="2.5" fill="${stroke}"/>
      <!-- Mango Leaf Accent -->
      <path d="M50 26 Q40 30 42 36 Q48 34 50 28" fill="${stroke}" fill-opacity="0.2" stroke-width="1"/>

      <!-- Blossom 2 (Middle) -->
      <circle cx="50" cy="46" r="11" fill="${stroke}" fill-opacity="0.3" stroke-width="1.5"/>
      <circle cx="50" cy="46" r="7" fill="${stroke}" fill-opacity="0.4" stroke-width="1.2"/>
      <circle cx="50" cy="46" r="3" fill="${stroke}"/>
      <!-- Mango Leaf Accent -->
      <path d="M50 55 Q60 59 58 65 Q52 63 50 57" fill="${stroke}" fill-opacity="0.2" stroke-width="1"/>

      <!-- Blossom 3 (Bottom with Latkan) -->
      <circle cx="50" cy="74" r="11" fill="${stroke}" fill-opacity="0.3" stroke-width="1.5"/>
      <circle cx="50" cy="74" r="7" fill="${stroke}" fill-opacity="0.4" stroke-width="1.2"/>
      <circle cx="50" cy="74" r="3" fill="${stroke}"/>

      <!-- Bottom Hanging Auspicious Brass Bell / Latkan -->
      <path d="M46 88 L54 88 L56 94 L44 94 Z" fill="${stroke}" fill-opacity="0.35" stroke-width="1.5"/>
      <circle cx="50" cy="96" r="2" fill="${stroke}"/>
    </g>
  `;
}

/**
 * Returns raw SVG inner contents for any traditional shapeType.
 */
export function getTraditionalOrnamentSvg(
  shapeType: string,
  stroke: string,
  fill: string = 'none'
): string | null {
  switch (shapeType) {
    case 'ganesha_royal':
      return renderGaneshaRoyal(stroke, fill);
    case 'ganesha_minimal':
      return renderGaneshaMinimal(stroke);
    case 'swastik':
      return renderSwastik(stroke, fill);
    case 'om':
      return renderOm(stroke, fill);
    case 'doli':
      return renderDoli(stroke, fill);
    case 'shehnai':
      return renderShehnai(stroke, fill);
    case 'baarat_elephant':
      return renderBaaratElephant(stroke, fill);
    case 'havan_kund':
      return renderHavanKund(stroke, fill);
    case 'mangalsutra':
      return renderMangalsutra(stroke, fill);
    case 'peacock_pair':
      return renderPeacockPair(stroke, fill);
    case 'diya':
      return renderDiya(stroke, fill);
    case 'namaste':
      return renderNamaste(stroke, fill);
    case 'marigold_garland':
      return renderMarigoldGarland(stroke, fill);
    default:
      return null;
  }
}
