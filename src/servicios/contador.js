/**
 * @file Cuenta las partidas empezadas con GoatCounter (sin cookies ni datos personales).
 *
 * Capa: servicios. El script de GoatCounter se carga en index.html; si un
 * bloqueador lo impide o no hay red, esto no hace nada. Las cifras se ven en
 * serbenda.goatcounter.com.
 */

/** Ruta con la que se cuentan las partidas en GoatCounter. */
const RUTA_PARTIDA = 'partida/story-reader';

/** Suma una partida empezada. Nunca falla. */
export function contarPartida() {
  try { globalThis.goatcounter?.count?.({ path: RUTA_PARTIDA, title: 'Partida empezada', event: true }); } catch { /* sin contador de visitas */ }
}
