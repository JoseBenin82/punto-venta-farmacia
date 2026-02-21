/**
 * RF-003: Base de datos de Interacciones Medicamentosas
 * Alertas de Farmacovigilancia
 *
 * Cada grupo define interacciones con otros grupos.
 * severity: 'ALTA' (bloqueo sugerido), 'MEDIA' (alerta), 'BAJA' (info)
 */

const INTERACCIONES = [
    {
        grupoA: 'ANTICOAGULANTES',
        grupoB: 'AINES',
        severity: 'ALTA',
        mensaje: 'Riesgo de hemorragia severa. Anticoagulantes + AINEs aumentan el sangrado.',
        recomendacion: 'Se recomienda utilizar un analgésico alternativo como Paracetamol.'
    },
    {
        grupoA: 'ANTICOAGULANTES',
        grupoB: 'ANTIBIOTICOS',
        severity: 'MEDIA',
        mensaje: 'Algunos antibióticos pueden potenciar el efecto anticoagulante.',
        recomendacion: 'Monitorear INR del paciente más frecuentemente.'
    },
    {
        grupoA: 'OPIOIDES',
        grupoB: 'BENZODIACEPINAS',
        severity: 'ALTA',
        mensaje: 'Riesgo de depresión respiratoria severa. Combinación potencialmente letal.',
        recomendacion: 'Evitar combinación. Consultar con el médico prescriptor.'
    },
    {
        grupoA: 'ANTIDEPRESIVOS',
        grupoB: 'OPIOIDES',
        severity: 'ALTA',
        mensaje: 'Riesgo de síndrome serotoninérgico, especialmente con tramadol.',
        recomendacion: 'Monitorear signos de agitación, temblor, diaforesis.'
    },
    {
        grupoA: 'ANTIHIPERTENSIVOS',
        grupoB: 'AINES',
        severity: 'MEDIA',
        mensaje: 'Los AINEs pueden reducir efecto antihipertensivo y dañar la función renal.',
        recomendacion: 'Vigilar presión arterial y función renal.'
    },
    {
        grupoA: 'ANTIBIOTICOS',
        grupoB: 'ALCOHOL_INTERACCION',
        severity: 'ALTA',
        mensaje: 'Reacción tipo disulfiram (náuseas, vómito, cefalea) con Metronidazol.',
        recomendacion: 'Evitar consumo de alcohol durante tratamiento y 48h después.'
    },
    {
        grupoA: 'BENZODIACEPINAS',
        grupoB: 'ALCOHOL_INTERACCION',
        severity: 'ALTA',
        mensaje: 'Potenciación de depresión del SNC. Riesgo de sobredosis.',
        recomendacion: 'Advertir al paciente sobre no consumir alcohol.'
    },
    {
        grupoA: 'ANTIDEPRESIVOS',
        grupoB: 'BENZODIACEPINAS',
        severity: 'MEDIA',
        mensaje: 'Potenciación de sedación y efectos sobre el SNC.',
        recomendacion: 'Monitorear somnolencia excesiva.'
    }
];

/**
 * Verifica interacciones entre los grupos de productos en el carrito.
 * @param {string[]} grupos - Array de grupoInteraccion de los productos en el carrito
 * @returns {Array<{severity, mensaje, recomendacion, pares}>} Lista de interacciones encontradas
 */
export function verificarInteracciones(grupos) {
    const gruposUnicos = [...new Set(grupos.filter(g => g && g !== 'NINGUNO'))];
    const interaccionesEncontradas = [];

    for (let i = 0; i < gruposUnicos.length; i++) {
        for (let j = i + 1; j < gruposUnicos.length; j++) {
            const grupoA = gruposUnicos[i];
            const grupoB = gruposUnicos[j];

            const interaccion = INTERACCIONES.find(
                int =>
                    (int.grupoA === grupoA && int.grupoB === grupoB) ||
                    (int.grupoA === grupoB && int.grupoB === grupoA)
            );

            if (interaccion) {
                interaccionesEncontradas.push({
                    ...interaccion,
                    pares: `${grupoA} + ${grupoB}`
                });
            }
        }
    }

    // Ordenar por severidad (ALTA primero)
    return interaccionesEncontradas.sort((a, b) => {
        const orden = { 'ALTA': 0, 'MEDIA': 1, 'BAJA': 2 };
        return orden[a.severity] - orden[b.severity];
    });
}

/**
 * Verifica si hay interacciones al agregar un nuevo producto al carrito.
 * @param {string} nuevoGrupo - Grupo del producto nuevo
 * @param {string[]} gruposExistentes - Grupos ya en el carrito
 * @returns {Array} Interacciones con el nuevo producto
 */
export function verificarInteraccionConNuevo(nuevoGrupo, gruposExistentes) {
    if (!nuevoGrupo || nuevoGrupo === 'NINGUNO') return [];

    const interacciones = [];
    const existentesUnicos = [...new Set(gruposExistentes.filter(g => g && g !== 'NINGUNO'))];

    for (const grupoExistente of existentesUnicos) {
        const interaccion = INTERACCIONES.find(
            int =>
                (int.grupoA === nuevoGrupo && int.grupoB === grupoExistente) ||
                (int.grupoA === grupoExistente && int.grupoB === nuevoGrupo)
        );
        if (interaccion) {
            interacciones.push({
                ...interaccion,
                pares: `${nuevoGrupo} + ${grupoExistente}`
            });
        }
    }

    return interacciones;
}

export default { verificarInteracciones, verificarInteraccionConNuevo };
