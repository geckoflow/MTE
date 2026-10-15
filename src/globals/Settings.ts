import type { GlobalConfig } from 'payload'

import { anyone, isLoggedIn } from '@/access'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Einstellungen',
  admin: { group: 'Verwaltung' },
  access: { read: anyone, update: isLoggedIn },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Unternehmen & Kontakt',
          fields: [
            { name: 'brandName', label: 'Markenname', type: 'text', defaultValue: 'Schaftböller Ebner', required: true },
            { name: 'legalName', label: 'Firmenwortlaut (Impressum)', type: 'text' },
            { name: 'contactPerson', label: 'Ansprechperson', type: 'text', defaultValue: 'David Ebner' },
            {
              type: 'row',
              fields: [
                { name: 'street', label: 'Straße', type: 'text' },
                { name: 'zip', label: 'PLZ', type: 'text' },
                { name: 'city', label: 'Ort', type: 'text', defaultValue: 'Oberalm' },
              ],
            },
            { name: 'region', label: 'Region/Bundesland', type: 'text', defaultValue: 'Salzburg' },
            {
              type: 'row',
              fields: [
                { name: 'phone', label: 'Telefon', type: 'text' },
                { name: 'email', label: 'E-Mail (öffentlich)', type: 'email' },
              ],
            },
            { name: 'openingNote', label: 'Hinweis Werkstattbesuch', type: 'text', defaultValue: 'Besuche in der Werkstatt nach Terminvereinbarung.' },
            {
              name: 'social',
              label: 'Social Media',
              type: 'array',
              labels: { singular: 'Profil', plural: 'Profile' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'network',
                      label: 'Netzwerk',
                      type: 'select',
                      required: true,
                      options: ['Instagram', 'Facebook', 'YouTube', 'TikTok'].map((n) => ({ label: n, value: n.toLowerCase() })),
                    },
                    { name: 'url', label: 'URL', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Anfragen & Preise',
          fields: [
            {
              name: 'inquiryRecipient',
              label: 'Empfänger für Anfragen',
              type: 'email',
              admin: { description: 'An diese Adresse gehen alle Anfragen aus Konfigurator und Kontaktformular. Leer = öffentliche E-Mail-Adresse.' },
            },
            {
              name: 'showPrices',
              label: 'Preise anzeigen',
              type: 'checkbox',
              defaultValue: true,
              admin: { description: 'Ausgeschaltet zeigt die Website „Preis auf Anfrage“, auch im Konfigurator.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'vatMode',
                  label: 'Umsatzsteuer',
                  type: 'select',
                  defaultValue: 'regel',
                  required: true,
                  options: [
                    { label: 'Preise inkl. USt. (Regelbesteuerung)', value: 'regel' },
                    { label: 'Kleinunternehmer (keine USt.)', value: 'kleinunternehmer' },
                  ],
                },
                { name: 'vatRate', label: 'USt.-Satz (%)', type: 'number', defaultValue: 20, min: 0, max: 30 },
              ],
            },
            {
              name: 'leadTimeNote',
              label: 'Hinweis Lieferzeit',
              type: 'text',
              defaultValue: 'Fertigung auf Bestellung, Lieferzeit nach Vereinbarung.',
            },
            {
              name: 'inquiryNote',
              label: 'Hinweis im Anfrageformular',
              type: 'textarea',
              defaultValue: 'Die Anfrage ist unverbindlich. Wir melden uns mit einem Angebot und einem Liefertermin.',
            },
          ],
        },
        {
          label: 'Website',
          fields: [
            { name: 'introEnabled', label: 'Logo-Intro auf der Startseite', type: 'checkbox', defaultValue: true },
            { name: 'introTagline', label: 'Text unter dem Logo im Intro', type: 'text', defaultValue: 'Handwerk mit Tradition' },
            {
              name: 'previewBanner',
              label: 'Vorschau-Hinweis anzeigen',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: 'Zeigt oben einen Hinweis „Vorschau – Inhalte und Preise sind Beispielwerte“. Vor dem Go-live ausschalten.' },
            },
            {
              name: 'footerNote',
              label: 'Kurztext im Footer',
              type: 'text',
              defaultValue: 'Handgefertigte Schaftböller aus Oberalm, Salzburg.',
            },
            { name: 'defaultOgImage', label: 'Standard-Vorschaubild (Social Media)', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
