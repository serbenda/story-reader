/**
 * @file Lo que se pone en la cabeza (o en la cara): sombrero, corona, gafas…
 *
 * Capa: arte. Para añadir uno nuevo: añade un «case» con el mismo valor que
 * tenga en src/config/apariencia.js (gratis) o src/config/tienda.js (de pago).
 * Las coordenadas son las del dibujo de la niña (viewBox 120×200; la cara
 * está centrada en x=60, y=56).
 */
import { TINTA, flor, estrellita } from './adornos.js';

/**
 * @param {string} tipo   Valor del complemento («sombrero», «tiara»…). Desconocido → nada.
 * @param {string} color  Color del vestido (algunos complementos lo usan).
 * @param {{pelo?: string}} [cfg]  Configuración de la niña (las orejas de gato usan el color del pelo).
 * @returns {string} Trozo de SVG.
 */
export function accesorio(tipo, color, cfg = {}) {
  switch (tipo) {
    case 'flores': {
      let f = '';
      [['#F7B7C8', 32, 40], ['#FFFFFF', 40, 29], ['#F7B7C8', 50, 23], ['#FFFFFF', 60, 21], ['#F7B7C8', 70, 23], ['#FFFFFF', 80, 29], ['#F7B7C8', 88, 40]]
        .forEach(([c, x, y]) => { f += flor(x, y, c); });
      return `<path d="M30 42 Q60 12 90 42" stroke="#4E9A42" stroke-width="3" fill="none"/>${f}`;
    }
    case 'orejas': return `<path d="M33 38 L36 10 L54 27 Z" fill="${cfg.pelo || '#6B3E26'}" stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round"/><path d="M38 31 L39.5 17 L48 26 Z" fill="#F7B7C8"/>
      <path d="M87 38 L84 10 L66 27 Z" fill="${cfg.pelo || '#6B3E26'}" stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round"/><path d="M82 31 L80.5 17 L72 26 Z" fill="#F7B7C8"/>`;
    case 'gorro': return `<path d="M28 46 Q28 14 60 14 Q92 14 92 46 Z" fill="${color}" stroke="${TINTA}" stroke-width="2.5"/>
      <rect x="26" y="38" width="68" height="12" rx="6" fill="#FFF7E6" stroke="${TINTA}" stroke-width="2.5"/>
      <path d="M38 22 V38 M48 17 V38 M60 15 V38 M72 17 V38 M82 22 V38" stroke="#FFFFFF" stroke-width="2" opacity=".45"/>
      <circle cx="60" cy="12" r="8" fill="#FFF7E6" stroke="${TINTA}" stroke-width="2.5"/>`;
    case 'tiara': return `<path d="M34 40 Q60 22 86 40" stroke="#E2B04A" stroke-width="4" fill="none" stroke-linecap="round"/>${estrellita(60, 22, 9, '#FFD45E')}${estrellita(44, 31, 6, '#FFD45E')}${estrellita(76, 31, 6, '#FFD45E')}`;
    case 'pirata': return `<path d="M28 48 Q28 20 60 20 Q92 20 92 48 Q60 36 28 48 Z" fill="#C2453B" stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round"/>
      <circle cx="46" cy="32" r="2.6" fill="#FFFFFF"/><circle cx="60" cy="27" r="2.6" fill="#FFFFFF"/><circle cx="74" cy="32" r="2.6" fill="#FFFFFF"/><circle cx="54" cy="38" r="2.2" fill="#FFFFFF"/><circle cx="68" cy="38" r="2.2" fill="#FFFFFF"/>
      <path d="M90 42 L104 36 L100 50 Z M90 44 L102 56 L94 58 Z" fill="#C2453B" stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round"/>`;
    case 'casco': return `<circle cx="60" cy="56" r="40" fill="#CFEFFF" opacity=".28" stroke="#FFFFFF" stroke-width="4"/>
      <path d="M30 34 Q42 20 58 18" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" opacity=".9"/>
      <rect x="30" y="88" width="60" height="10" rx="5" fill="#E2E2EA" stroke="${TINTA}" stroke-width="2.5"/>`;
    case 'corona': return '<path d="M38 32 L42 12 L51 25 L60 8 L69 25 L78 12 L82 32 Z" fill="#F4B740" stroke="#B9831A" stroke-width="2.5" stroke-linejoin="round"/><circle cx="60" cy="22" r="3" fill="#C9476B"/>';
    case 'lazo': return `<path d="M74 28 L92 16 L90 40 Z M74 28 L60 14 L58 36 Z" fill="${color}" stroke="${TINTA}" stroke-width="2" stroke-linejoin="round"/><circle cx="74" cy="28" r="5" fill="${color}" stroke="${TINTA}" stroke-width="2"/>`;
    case 'gorra': return `<path d="M29 46 Q30 18 60 18 Q90 18 91 46 Z" fill="${color}" stroke="${TINTA}" stroke-width="2"/><path d="M86 44 Q106 42 110 51 L86 51 Z" fill="${color}" stroke="${TINTA}" stroke-width="2"/><circle cx="60" cy="19" r="3" fill="${TINTA}"/>`;
    case 'gafas': return `<g fill="none" stroke="${TINTA}" stroke-width="2.6"><circle cx="49" cy="60" r="8"/><circle cx="71" cy="60" r="8"/><path d="M57 60 H63 M41 58 L31 54 M79 58 L89 54"/></g>`;
    case 'sombrero': return '<ellipse cx="60" cy="32" rx="40" ry="8" fill="#C9A36A" stroke="#7E5E34" stroke-width="2"/><path d="M38 32 Q40 10 60 10 Q80 10 82 32 Z" fill="#D9B87E" stroke="#7E5E34" stroke-width="2"/><rect x="39" y="24" width="42" height="6" fill="#7E5E34"/>';
    default: return '';
  }
}
