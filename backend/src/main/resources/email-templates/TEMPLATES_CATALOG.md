# 📧 Stock ERP — Catalogue des Templates d'Email

## Vue d'Ensemble

Tous les templates suivent le design system de **Stock ERP** :
- 🎨 Gradient Purple/Indigo : `#667eea → #764ba2`
- 📦 Branding : "Stock ERP — Gestion intelligente de stock"
- 🎯 Design moderne responsive (max-width: 600px)

---

## 1. 🔐 Password Reset Email

**Fichier** : `password-reset.html`  
**Usage** : Réinitialisation de mot de passe  
**Variables** : `userName`, `resetLink`

### Aperçu Visuel

```
╔═══════════════════════════════════════╗
║        🔐 dans cercle glassmorphism    ║  ← Purple gradient
║   Réinitialisation du mot de passe    ║
║   Stock ERP — Gestion intelligente    ║
╚═══════════════════════════════════════╝

Bonjour [Raouf],

Vous avez demandé la réinitialisation de votre
mot de passe. Cliquez sur le bouton ci-dessous.

┌───────────────────────────────────────┐
│  ✨ Réinitialiser mon mot de passe   │  ← CTA gradient + shadow
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ ⏰ Ce lien expire dans 1 heure       │  ← Warning box (orange)
└───────────────────────────────────────┘

Si le bouton ne fonctionne pas, copiez :
https://app.stock-erp.com/reset?token=...

────────────────────────────────────────
Si vous n'avez pas demandé cette
réinitialisation, ignorez cet email.

© 2026 Stock ERP — Tous droits réservés
📦 Votre solution de gestion de stock intelligente
```

### Code d'Utilisation

```java
// Via PasswordResetEmailService (déjà implémenté)
passwordResetEmailService.sendResetEmail(
    "user@example.com",
    "Raouf",
    "https://app.stock-erp.com/reset?token=abc123"
);

// Ou via EmailTemplateService
String html = emailTemplateService.renderPasswordResetEmail(
    "Raouf",
    "https://app.stock-erp.com/reset?token=abc123"
);
```

---

## 2. 📄 Invoice Notification Email

**Fichier** : `invoice-notification.html`  
**Usage** : Envoi de facture avec PDF joint  
**Variables** : `customerName`, `billNumber`, `billDate`, `totalAmount`

### Aperçu Visuel

```
╔═══════════════════════════════════════╗
║        📄 dans cercle glassmorphism    ║  ← Purple gradient
║         Nouvelle Facture              ║
║   Stock ERP — Gestion intelligente    ║
╚═══════════════════════════════════════╝

Bonjour [SARL Dupont],

Veuillez trouver ci-joint votre facture
FAC-2026-0042 en date du 31/05/2026.

┌───────────────────────────────────────┐
│                                        │
│  Facture N°    │   FAC-2026-0042      │  ← Info card
│  Date          │   31/05/2026         │     (gray gradient)
│  Montant Total │   1,234.560 DNT      │
│                                        │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ 📎 Le document PDF est joint à cet    │  ← Info box (blue)
│    email                               │
└───────────────────────────────────────┘

Pour toute question concernant cette facture,
n'hésitez pas à nous contacter.

Merci de votre confiance.

© 2026 Stock ERP — Tous droits réservés
📦 Votre solution de gestion de stock intelligente
```

### Code d'Utilisation

```java
// Via EmailService (méthode dédiée)
emailService.sendInvoiceEmail(
    "client@example.com",
    "SARL Dupont",
    "FAC-2026-0042",
    "31/05/2026",
    "1,234.560 DNT",
    pdfBytes
);

// Ou manuellement
String html = emailTemplateService.renderInvoiceNotification(
    "SARL Dupont",
    "FAC-2026-0042",
    "31/05/2026",
    "1,234.560 DNT"
);
emailService.sendEmailWithPdfAttachment(
    "client@example.com",
    "Nouvelle Facture FAC-2026-0042",
    html,
    pdfBytes,
    "Facture_FAC-2026-0042.pdf"
);
```

---

## 3. 🚚 Delivery Note Notification Email

**Fichier** : `delivery-note-notification.html`  
**Usage** : Envoi de bon de livraison avec PDF joint  
**Variables** : `customerName`, `deliveryNoteNumber`, `deliveryDate`, `recipientName`

### Aperçu Visuel

```
╔═══════════════════════════════════════╗
║        🚚 dans cercle glassmorphism    ║  ← Purple gradient
║        Bon de Livraison               ║
║   Stock ERP — Gestion intelligente    ║
╚═══════════════════════════════════════╝

Bonjour [SARL Dupont],

Veuillez trouver ci-joint votre bon de
livraison BL-2026-0012 du 31/05/2026.

┌───────────────────────────────────────┐
│                                        │
│  Bon de Livraison N° │ BL-2026-0012  │  ← Info card
│  Date de livraison   │ 31/05/2026    │     (green gradient)
│  Destinataire        │ Mohamed Ali   │
│                                        │
└───────────────────────────────────────┘

┌───────────────────────────────────────┐
│ 📎 Le document PDF est joint à cet    │  ← Info box (blue)
│    email                               │
└───────────────────────────────────────┘

Pour toute question concernant cette livraison,
n'hésitez pas à nous contacter.

Merci de votre confiance.

© 2026 Stock ERP — Tous droits réservés
📦 Votre solution de gestion de stock intelligente
```

### Code d'Utilisation

```java
// Via EmailService (méthode dédiée)
emailService.sendDeliveryNoteEmail(
    "client@example.com",
    "SARL Dupont",
    "BL-2026-0012",
    "31/05/2026",
    "Mohamed Ali",
    pdfBytes
);

// Ou manuellement
String html = emailTemplateService.renderDeliveryNoteNotification(
    "SARL Dupont",
    "BL-2026-0012",
    "31/05/2026",
    "Mohamed Ali"
);
emailService.sendEmailWithPdfAttachment(
    "client@example.com",
    "Bon de Livraison BL-2026-0012",
    html,
    pdfBytes,
    "BonDeLivraison_BL-2026-0012.pdf"
);
```

---

## 4. 📧 Generic Notification Email

**Fichier** : `generic-notification.html`  
**Usage** : Notifications personnalisées de tout type  
**Variables** : `icon`, `title`, `greeting`, `message`, `footer`, `ctaText`, `ctaLink`

### Aperçu Visuel

```
╔═══════════════════════════════════════╗
║        [Icône personnalisée]           ║  ← Purple gradient
║         [Titre personnalisé]          ║     (ex: ✅, ⚠️, 📦)
║   Stock ERP — Gestion intelligente    ║
╚═══════════════════════════════════════╝

[Salutation personnalisée]
Ex: Bonjour Jean,

[Message personnalisé - supporte HTML]
Ex: Votre commande #12345 a été validée
    avec succès. Elle sera expédiée dans
    les prochaines 48 heures.

┌───────────────────────────────────────┐
│        [Texte bouton CTA]             │  ← CTA optionnel
└───────────────────────────────────────┘

[Footer personnalisé]
Ex: Pour toute question, contactez-nous.

© 2026 Stock ERP — Tous droits réservés
📦 Votre solution de gestion de stock intelligente
```

### Code d'Utilisation

```java
// Exemple 1 : Confirmation de commande
emailService.sendNotification(
    "user@example.com",
    "✅",                                   // Icône
    "Commande validée",                     // Titre
    "Bonjour Jean",                         // Salutation
    "Votre commande #12345 a été validée", // Message (HTML ok)
    "Merci de votre confiance.",            // Footer
    "Voir ma commande",                     // Texte bouton (optionnel)
    "https://app.com/orders/12345"          // Lien bouton (optionnel)
);

// Exemple 2 : Alerte stock faible (sans bouton)
emailService.sendNotification(
    "admin@example.com",
    "⚠️",
    "Alerte Stock Faible",
    "Bonjour Admin",
    "Le produit <strong>iPhone 15</strong> a un stock de seulement <strong>3 unités</strong>.",
    "Pensez à réapprovisionner rapidement.",
    null,  // Pas de bouton
    null
);

// Exemple 3 : Utilisation directe du template
String html = emailTemplateService.renderGenericNotification(
    "🎉",
    "Bienvenue sur Stock ERP",
    "Bonjour Marie",
    "Votre compte a été créé avec succès.",
    "Commencez à gérer votre stock dès maintenant !",
    "Se connecter",
    "https://app.stock-erp.com/login"
);
emailService.sendSimpleEmail(
    "marie@example.com",
    "Bienvenue sur Stock ERP",
    html
);
```

---

## 🎨 Personnalisation des Icônes

Exemples d'icônes selon le type de notification :

| Type | Icône | Exemple d'usage |
|------|-------|-----------------|
| Succès | ✅ | Commande validée, paiement réussi |
| Erreur | ❌ | Échec de paiement, erreur système |
| Alerte | ⚠️ | Stock faible, expiration imminente |
| Info | ℹ️ | Nouvelle fonctionnalité, mise à jour |
| Sécurité | 🔐 | Changement de mot de passe |
| Livraison | 🚚 | Colis expédié, livraison en cours |
| Facture | 📄 | Nouvelle facture, rappel paiement |
| Cadeau | 🎁 | Promotion, offre spéciale |
| Célébration | 🎉 | Bienvenue, anniversaire compte |
| Email | 📧 | Notification générique |
| Panier | 🛒 | Commande abandonnée |
| Argent | 💰 | Paiement reçu, remboursement |

---

## 📱 Compatibilité Email Clients

Les templates sont testés et compatibles avec :

- ✅ **Gmail** (Desktop & Mobile)
- ✅ **Outlook** (2016, 2019, 365)
- ✅ **Apple Mail** (macOS & iOS)
- ✅ **Yahoo Mail**
- ✅ **ProtonMail**
- ✅ **Thunderbird**

**Technique utilisée** :
- Tables imbriquées (pas de flexbox/grid)
- Styles inline (pas de CSS externe)
- Images en base64 ou émojis uniquement
- Responsive avec max-width

---

## 🛠️ Comment Ajouter un Nouveau Template ?

### Étape 1 : Créer le fichier HTML

```bash
# Créer le template dans resources/email-templates/
touch backend/src/main/resources/email-templates/mon-template.html
```

### Étape 2 : Copier un template existant

```html
<!-- Copier la structure de generic-notification.html -->
<!DOCTYPE html>
<html xmlns:th="http://www.thymeleaf.org" lang="fr">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Mon Template</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
    <!-- Structure du template ici -->
</body>
</html>
```

### Étape 3 : Ajouter une méthode dans EmailTemplateService

```java
public String renderMonTemplate(String param1, String param2) {
    return renderTemplate("mon-template", Map.of(
        "param1", param1,
        "param2", param2
    ));
}
```

### Étape 4 : Utiliser le template

```java
String html = emailTemplateService.renderMonTemplate("valeur1", "valeur2");
emailService.sendSimpleEmail(to, subject, html);
```

---

## 📚 Documentation Complète

- 📖 **Guide détaillé** : `backend/src/main/resources/email-templates/README.md`
- 📊 **Architecture** : `doc/EMAIL_TEMPLATES_IMPROVEMENT.md`
- 📝 **Ce catalogue** : `EMAIL_IMPROVEMENT_SUMMARY.md`

---

## 🎯 Quick Reference — Variables Thymeleaf

### password-reset.html
```java
Map.of(
    "userName", "Raouf",
    "resetLink", "https://..."
)
```

### invoice-notification.html
```java
Map.of(
    "customerName", "SARL Dupont",
    "billNumber", "FAC-2026-0042",
    "billDate", "31/05/2026",
    "totalAmount", "1,234.560 DNT"
)
```

### delivery-note-notification.html
```java
Map.of(
    "customerName", "SARL Dupont",
    "deliveryNoteNumber", "BL-2026-0012",
    "deliveryDate", "31/05/2026",
    "recipientName", "Mohamed Ali"  // optionnel
)
```

### generic-notification.html
```java
Map.of(
    "icon", "✅",
    "title", "Notification",
    "greeting", "Bonjour",
    "message", "Votre message",
    "footer", "Footer text",
    "ctaText", "Bouton",      // optionnel
    "ctaLink", "https://..."   // optionnel
)
```

---

**© 2026 Stock ERP** — Catalogue des Templates d'Email  
📦 Votre solution de gestion de stock intelligente

*Dernière mise à jour : 31 Mai 2026*

