// main.jsx — Point d'entrée de l'application React
// ReactDOM monte l'arbre de composants dans le <div id="root"> du HTML

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' // Styles Tailwind globaux

// StrictMode active des avertissements supplémentaires en développement
// (double-rendu intentionnel pour détecter les effets de bord)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
