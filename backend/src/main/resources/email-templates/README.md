# 📧 Email Templates — Bhouri Stock

Ce dossier contient tous les templates HTML pour les emails envoyés par l'application Bhouri Stock.

## 🎨 Design & Branding

Tous les templates suivent le design system de l'application :
- **Couleurs principales** : Gradient purple/indigo (#667eea → #764ba2)
- **Nom de l'application** : Bhouri Stock
- **Tagline** : "Gestion intelligente de stock"
- **Footer** : © 2026 Bhouri Stock — Tous droits réservés

## 📁 Templates Disponibles

### 1. `password-reset.html`
**Usage** : Email de réinitialisation de mot de passe

**Variables Thymeleaf** :
- `${userName}` : Nom de l'utilisateur
- `${resetLink}` : Lien de réinitialisation (expire en 1h)

**Icône** : 🔐

---

### 2. `invoice-notification.html`
**Usage** : Notification d'envoi de facture avec PDF joint

**Variables Thymeleaf** :
- `${customerName}` : Nom du client
- `${billNumber}` : Numéro de facture (ex: FAC-0001)
- `${billDate}` : Date de la facture
- `${totalAmount}` : Montant total formaté (ex: 1,234.560 DNT)

**Icône** : 📄

---

### 3. `delivery-note-notification.html`
**Usage** : Notification d'envoi de bon de livraison avec PDF joint

**Variables Thymeleaf** :
- `${customerName}` : Nom du client
- `${deliveryNoteNumber}` : Numéro du bon de livraison (ex: BL-0001)
- `${deliveryDate}` : Date de livraison
- `${recipientName}` : Nom du destinataire (optionnel)

**Icône** : 🚚

---

### 4. `generic-notification.html`
**Usage** : Template générique pour toute notification personnalisée

**Variables Thymeleaf** :
- `${icon}` : Émoji ou icône (ex: 📧, ✅, ⚠️)
- `${title}` : Titre de l'email
- `${greeting}` : Formule d'accueil (ex: "Bonjour Raouf")
- `${message}` : Corps du message (supporte HTML)
- `${footer}` : Texte de pied de page optionnel
- `${ctaText}` : Texte du bouton d'action (optionnel)
- `${ctaLink}` : Lien du bouton d'action (optionnel)

**Icône** : Personnalisable

---

## 🛠️ Utilisation dans le code

### Service de rendu des templates

```java
@Service
@RequiredArgsConstructor
public class MyService {
    
    private final EmailTemplateService emailTemplateService;
    private final EmailService emailService;
    
    public void sendPasswordReset(String email, String userName, String resetLink) {
        String html = emailTemplateService.renderPasswordResetEmail(userName, resetLink);
        // OU directement via EmailService qui le fait automatiquement
    }
    
    public void sendInvoice(String email, String customerName, String billNumber, 
                           String billDate, String total, byte[] pdfBytes) {
        emailService.sendInvoiceEmail(email, customerName, billNumber, billDate, total, pdfBytes);
    }
}
```

### Méthodes disponibles

#### EmailTemplateService
- `renderPasswordResetEmail(userName, resetLink)` → HTML
- `renderInvoiceNotification(customerName, billNumber, billDate, totalAmount)` → HTML
- `renderDeliveryNoteNotification(customerName, deliveryNoteNumber, deliveryDate, recipientName)` → HTML
- `renderGenericNotification(icon, title, greeting, message, footer, ctaText, ctaLink)` → HTML
- `renderTemplate(templateName, variables)` → HTML (méthode générique)

#### EmailService
- `sendInvoiceEmail(to, customerName, billNumber, billDate, totalAmount, pdfBytes)` — Envoie facture avec PDF
- `sendDeliveryNoteEmail(to, customerName, deliveryNoteNumber, deliveryDate, recipientName, pdfBytes)` — Envoie BL avec PDF
- `sendNotification(to, icon, title, greeting, message, footer, ctaText, ctaLink)` — Notification générique
- `sendSimpleEmail(to, subject, body)` — Email simple (HTML personnalisé)
- `sendEmailWithPdfAttachment(to, subject, body, pdfBytes, pdfFileName)` — Email avec pièce jointe

---

## 🎨 Personnalisation des templates

### Structure HTML
Tous les templates utilisent :
- **Tables imbriquées** pour la compatibilité email (tous clients)
- **Styles inline** (requis pour les emails)
- **Gradient backgrounds** pour un design moderne
- **Responsive design** (max-width: 600px)
- **Émojis** pour un aspect visuel attractif

### Couleurs du design system

```css
/* Gradient principal (header) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Couleurs de texte */
Titre principal: #1f2937 (gray-800)
Texte secondaire: #6b7280 (gray-500)
Muted text: #9ca3af (gray-400)

/* Couleurs d'arrière-plan */
Body: white
Container externe: #f3f4f6 (gray-100)
Footer: #f9fafb (gray-50)
Info box: #f9fafb (gray-50)

/* Box d'alerte */
Warning (orange): #fef3c7 background, #f59e0b border, #92400e text
Info (blue): #dbeafe background, #3b82f6 border, #1e40af text
Success (green): #ecfdf5 background, #10b981 border, #065f46 text
```

### Modifier un template existant

1. Ouvrir le fichier `.html` dans `backend/src/main/resources/email-templates/`
2. Modifier le HTML (styles inline uniquement !)
3. Tester localement en redémarrant le backend
4. Vérifier l'aperçu dans différents clients email

---

## ✅ Bonnes pratiques

### ✅ À FAIRE
- Utiliser les templates existants plutôt que du HTML inline dans le code
- Utiliser des émojis pour rendre les emails plus attrayants
- Garder le design cohérent avec les couleurs de l'app
- Tester sur Gmail, Outlook, Apple Mail

### ❌ À ÉVITER
- Ne pas utiliser de balises `<style>` séparées → tout en inline
- Ne pas utiliser de CSS avancé (flexbox, grid) → tables uniquement
- Ne pas oublier de rendre les variables Thymeleaf (th:text, th:if)
- Ne pas utiliser de JavaScript dans les emails

---

## 🔧 Configuration

### Thymeleaf
La configuration se trouve dans `EmailTemplateConfiguration.java` :
```java
@Bean
public ClassLoaderTemplateResolver emailTemplateResolver() {
    ClassLoaderTemplateResolver resolver = new ClassLoaderTemplateResolver();
    resolver.setPrefix("/");
    resolver.setSuffix(".html");
    resolver.setTemplateMode(TemplateMode.HTML);
    resolver.setCharacterEncoding("UTF-8");
    resolver.setCacheable(false); // Cache désactivé en dev
    return resolver;
}
```

### Resend API
Les emails sont envoyés via Resend. Configuration dans `application.properties` :
```properties
resend.api-key=re_xxxxxxxxxxxxx
resend.from-email=onboarding@resend.dev
resend.from-name=Bhouri Stock
```

---

## 📚 Exemples

### Exemple 1 : Envoi de facture
```java
emailService.sendInvoiceEmail(
    "client@example.com",
    "SARL Dupont",
    "FAC-2026-0042",
    "31/05/2026",
    "1,234.560 DNT",
    pdfBytes
);
```

### Exemple 2 : Notification personnalisée
```java
emailService.sendNotification(
    "user@example.com",
    "✅",
    "Commande validée",
    "Bonjour Jean",
    "Votre commande #12345 a été validée avec succès.",
    "Merci de votre confiance.",
    "Voir ma commande",
    "https://app.stock-erp.com/orders/12345"
);
```

### Exemple 3 : Template personnalisé
```java
Map<String, Object> vars = Map.of(
    "userName", "Raouf",
    "productName", "iPhone 15",
    "quantity", 5
);
String html = emailTemplateService.renderTemplate("custom-alert", vars);
emailService.sendSimpleEmail("admin@example.com", "Alerte Stock", html);
```

---

## 🚀 Ajout d'un nouveau template

1. Créer un fichier `.html` dans `resources/email-templates/`
2. Copier la structure d'un template existant
3. Modifier le contenu (header, body, variables)
4. Ajouter une méthode dans `EmailTemplateService` :
```java
public String renderMyNewTemplate(String param1, String param2) {
    return renderTemplate("my-new-template", Map.of(
        "param1", param1,
        "param2", param2
    ));
}
```
5. Utiliser le template via `EmailService`

---

## 📄 Licence

© 2026 Bhouri Stock — Tous droits réservés

