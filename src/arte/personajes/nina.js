/**
 * @file Dibujo de una protagonista con su ropa, pelo y complemento.
 *
 * Capa: arte. La mayor lleva el pelo largo; la pequeña, coletas.
 */
import { TINTA } from './adornos.js';
import { accesorio } from './complementos.js';
import { estampado } from './estampados.js';

/**
 * @typedef {object} AspectoNina
 * @property {string} piel
 * @property {string} pelo
 * @property {string} vestido
 * @property {string} [accesorio]
 * @property {string} [estampado]
 */

/**
 * @param {AspectoNina} cfg
 * @param {'largo'|'coletas'} [peinado='largo']
 * @returns {string} Un <svg> completo (viewBox 120×200).
 */
export function nina(cfg, peinado = 'largo') {
  const { piel, pelo, vestido } = cfg;
  const peloDetras = peinado === 'largo'
    ? `<path d="M27 56 Q22 104 34 116 L86 116 Q98 104 93 56 Z" fill="${pelo}"/>`
    : `<circle cx="26" cy="62" r="14" fill="${pelo}"/><circle cx="94" cy="62" r="14" fill="${pelo}"/><circle cx="34" cy="52" r="4" fill="#C9476B"/><circle cx="86" cy="52" r="4" fill="#C9476B"/>`;
  return `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    ${peloDetras}
    <rect x="44" y="148" width="11" height="36" rx="5" fill="${piel}"/><rect x="65" y="148" width="11" height="36" rx="5" fill="${piel}"/>
    <ellipse cx="48" cy="186" rx="12" ry="6.5" fill="${TINTA}"/><ellipse cx="72" cy="186" rx="12" ry="6.5" fill="${TINTA}"/>
    <rect x="23" y="98" width="12" height="44" rx="6" fill="${piel}" transform="rotate(16 29 100)"/>
    <rect x="85" y="98" width="12" height="44" rx="6" fill="${piel}" transform="rotate(-16 91 100)"/>
    <path d="M44 90 Q60 84 76 90 L95 156 Q60 168 25 156 Z" fill="${vestido}" stroke="${TINTA}" stroke-width="2.5" stroke-linejoin="round"/>
    ${estampado(cfg.estampado)}
    <path d="M30 150 Q60 160 90 150" stroke="#FFFFFF" stroke-width="3" fill="none" opacity=".55"/>
    <circle cx="60" cy="56" r="30" fill="${piel}"/>
    <path d="M30 54 Q32 22 60 22 Q90 22 90 54 Q78 38 62 42 Q56 34 46 42 Q38 44 30 54 Z" fill="${pelo}"/>
    <circle cx="49" cy="61" r="3.8" fill="${TINTA}"/><circle cx="71" cy="61" r="3.8" fill="${TINTA}"/>
    <circle cx="50.3" cy="59.7" r="1.3" fill="#FFFFFF"/><circle cx="72.3" cy="59.7" r="1.3" fill="#FFFFFF"/>
    <circle cx="41" cy="70" r="5" fill="#F08A8A" opacity=".45"/><circle cx="79" cy="70" r="5" fill="#F08A8A" opacity=".45"/>
    <path d="M51 72 Q60 80 69 72" stroke="${TINTA}" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${accesorio(cfg.accesorio, vestido, cfg)}
  </svg>`;
}
