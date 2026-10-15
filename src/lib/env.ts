/**
 * Öffentliche Adresse der Website – wird zur Laufzeit gelesen (nicht beim Build eingebrannt),
 * damit dasselbe Docker-Image für Staging und Produktion funktioniert.
 */
export const SERVER_URL = (process.env.SERVER_URL || 'http://localhost:3000').replace(/\/$/, '')
