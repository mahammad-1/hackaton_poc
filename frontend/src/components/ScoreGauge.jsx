// components/ScoreGauge.jsx — Jauge circulaire SVG du score de procrastination
// Affiche un score 0-100 avec animation CSS et couleur dynamique

/**
 * ScoreGauge — Jauge demi-cercle animée
 * @param {number} score  - Score de procrastination 0-100
 * @param {number} size   - Taille du SVG en px (défaut: 200)
 * @param {string} label  - Texte sous le score
 */
export default function ScoreGauge({ score = 0, size = 200, label = 'Score procrastination' }) {
  // Calculs géométriques pour le tracé SVG en arc
  const rayon = 80               // Rayon du cercle (en unités SVG)
  const circonference = Math.PI * rayon  // Demi-périmètre (on fait un demi-cercle)
  const centre = size / 2

  // Calcul du "dashoffset" : contrôle quelle portion de l'arc est visible
  // dashoffset = 0 → arc complet ; dashoffset = circonférence → arc vide
  const clampedScore = Math.min(100, Math.max(0, score))
  const offset = circonference - (clampedScore / 100) * circonference

  // Couleur de l'arc selon le niveau de score
  // Score élevé = beaucoup de procrastination = rouge
  const couleurArc =
    clampedScore < 35 ? '#10b981' :  // vert : peu de procrastination
    clampedScore < 65 ? '#f59e0b' :  // ambre : niveau modéré
    '#ef4444'                         // rouge : niveau élevé

  // Label interprétatif
  const interpretation =
    clampedScore < 35 ? 'Faible' :
    clampedScore < 65 ? 'Modéré' :
    'Élevé'

  return (
    <div className="flex flex-col items-center gap-2">
      {/* SVG principal de la jauge */}
      <svg
        width={size}
        height={size * 0.6} // On n'affiche que la moitié supérieure
        viewBox={`0 0 ${size} ${size * 0.6}`}
        overflow="visible"
      >
        {/* Piste grise de fond (arc complet) */}
        <path
          d={`M ${centre - rayon} ${size * 0.55}
              A ${rayon} ${rayon} 0 0 1 ${centre + rayon} ${size * 0.55}`}
          fill="none"
          stroke="#21262d"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Arc de progression coloré */}
        {/* stroke-dasharray définit la longueur totale du tiret */}
        {/* stroke-dashoffset décale le début du tiret = contrôle la progression */}
        <path
          d={`M ${centre - rayon} ${size * 0.55}
              A ${rayon} ${rayon} 0 0 1 ${centre + rayon} ${size * 0.55}`}
          fill="none"
          stroke={couleurArc}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circonference}
          strokeDashoffset={offset}
          // L'animation CSS fait passer l'offset de circonférence→valeur cible
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 8px ${couleurArc}60)`, // Halo lumineux
          }}
        />

        {/* Score numérique au centre */}
        <text
          x={centre}
          y={size * 0.52}
          textAnchor="middle"
          fill={couleurArc}
          fontSize={size * 0.22}
          fontFamily="DM Mono, monospace"
          fontWeight="500"
        >
          {clampedScore}
        </text>

        {/* Sous-texte "/100" */}
        <text
          x={centre}
          y={size * 0.52}
          textAnchor="middle"
          fill="#8b949e"
          fontSize={size * 0.09}
          fontFamily="DM Mono, monospace"
          dy={size * 0.1}
        >
          /100 — {interpretation}
        </text>
      </svg>

      {/* Label sous la jauge */}
      <p className="text-muted text-sm text-center">{label}</p>
    </div>
  )
}
