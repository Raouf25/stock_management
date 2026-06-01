# 📧 Amélioration du Système d'Emails — Stock ERP

## 📋 Vue d'ensemble

Refonte complète du système d'emails de l'application Stock ERP avec :
- ✅ **Design moderne** avec gradients purple/indigo
- ✅ **Templates HTML professionnels** réutilisables
- ✅ **Cohérence visuelle** avec l'application
- ✅ **Architecture propre** avec Thymeleaf
- ✅ **Documentation complète**

---

## 🎨 Improvements — Design & Branding

### Avant
- HTML inline dans le code Java
- Design basique avec couleurs génériques (bleu/violet différent de l'app)
- Pas de cohérence visuelle
- Difficile à maintenir et modifier

### Après
- Templates Thymeleaf séparés dans `resources/email-templates/`
- Design moderne avec les couleurs exactes de l'application
- Gradients purple/indigo (#667eea → #764ba2)
- Logo/icône avec effet glassmorphism
- Footer unifié avec branding "Stock ERP"
- Responsive design optimisé pour tous les clients email

---

## 📁 Structure des Fichiers

```
backend/src/main/resources/
├── email-templates/                      ← ✨ NOUVEAU DOSSIER
│   ├── README.md                         ← Documentation complète
│   ├── password-reset.html               ← Réinitialisation mot de passe
│   ├── invoice-notification.html         ← Notification facture
│   ├── delivery-note-notification.html   ← Notification bon de livraison
│   └── generic-notification.html         ← Template générique réutilisable
```

```
backend/src/main/java/.../
├── configuration/
│   └── EmailTemplateConfiguration.java   ← ✨ Config Thymeleaf pour emails
└── service/
    ├── EmailTemplateService.java         ← ✨ Service de rendu des templates
    ├── EmailService.java                 ← ✅ Amélioré avec templates
    └── PasswordResetEmailService.java    ← ✅ Refactorisé avec templates
```

---

## 🎨 Charte Graphique des Emails

### Couleurs Principales

| Élément | Couleur | Code |
|---------|---------|------|
| **Header gradient** | Purple → Violet | `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` |
| **Bouton CTA** | Même gradient + shadow | `box-shadow: 0 8px 20px rgba(102,126,234,0.35)` |
| **Titre principal** | Gray-800 | `#1f2937` |
| **Texte secondaire** | Gray-500 | `#6b7280` |
| **Texte muted** | Gray-400 | `#9ca3af` |
| **Background container** | Gray-100 | `#f3f4f6` |
| **Background card** | White | `#ffffff` |
| **Footer** | Gray-50 | `#f9fafb` |

### Éléments de Design

- **Logo/Icône** : Émoji dans un cercle avec effet glassmorphism (backdrop-filter)
- **Bordures arrondies** : `border-radius: 16px` (conteneur principal), `12px` (boutons)
- **Ombres** : `box-shadow: 0 4px 24px rgba(102,126,234,0.12)`
- **Typographie** : 'Segoe UI', Arial, sans-serif
- **Responsive** : max-width 600px avec padding adaptatif

---

## 📧 Templates Disponibles

### 1. 🔐 Password Reset (`password-reset.html`)

**Usage** : Réinitialisation de mot de passe

**Variables** :
- `userName` : Nom de l'utilisateur
- `resetLink` : Lien de réinitialisation (expire en 1h)

**Caractéristiques** :
- ⏰ Message d'expiration (1 heure)
- 🔗 Bouton CTA + lien de secours
- 🛡️ Note de sécurité

### 2. 📄 Invoice Notification (`invoice-notification.html`)

**Usage** : Envoi de facture avec PDF joint

**Variables** :
- `customerName` : Nom du client
- `billNumber` : Numéro de facture (ex: FAC-0001)
- `billDate` : Date de la facture
- `totalAmount` : Montant total formaté (1,234.560 DNT)

**Caractéristiques** :
- 📊 Tableau récapitulatif élégant
- 📎 Indicateur de pièce jointe PDF
- 💰 Mise en évidence du montant total

### 3. 🚚 Delivery Note Notification (`delivery-note-notification.html`)

**Usage** : Envoi de bon de livraison avec PDF joint

**Variables** :
- `customerName` : Nom du client
- `deliveryNoteNumber` : Numéro du BL (ex: BL-0001)
- `deliveryDate` : Date de livraison
- `recipientName` : Nom du destinataire (optionnel)

**Caractéristiques** :
- 📦 Design vert pour différencier des factures
- 👤 Info destinataire optionnelle
- 📎 Indicateur de pièce jointe PDF

### 4. 📧 Generic Notification (`generic-notification.html`)

**Usage** : Notifications personnalisées

**Variables** :
- `icon` : Émoji/icône (📧, ✅, ⚠️, etc.)
- `title` : Titre de l'email
- `greeting` : Salutation personnalisée
- `message` : Corps du message (HTML supporté)
- `footer` : Texte de pied de page
- `ctaText` : Texte du bouton (optionnel)
- `ctaLink` : Lien du bouton (optionnel)

**Caractéristiques** :
- 🎨 Totalement personnalisable
- 🔘 Bouton CTA optionnel
- 📝 Message HTML flexible

---

## 🛠️ Services & Architecture

### EmailTemplateConfiguration

Configuration Thymeleaf pour le rendu des templates d'emails.

```java
@Configuration
public class EmailTemplateConfiguration {
    @Bean(name = "emailTemplateEngine")
    public TemplateEngine emailTemplateEngine() { ... }
}
```

### EmailTemplateService

Service de rendu des templates avec Thymeleaf.

**Méthodes principales** :
- `renderPasswordResetEmail(userName, resetLink)` → HTML
- `renderInvoiceNotification(customerName, billNumber, billDate, totalAmount)` → HTML
- `renderDeliveryNoteNotification(customerName, deliveryNoteNumber, deliveryDate, recipientName)` → HTML
- `renderGenericNotification(icon, title, greeting, message, footer, ctaText, ctaLink)` → HTML
- `renderTemplate(templateName, variables)` → HTML (méthode générique)

### EmailService (amélioré)

Service d'envoi d'emails via Resend API avec support des templates.

**Nouvelles méthodes** :
```java
// Envoyer une facture avec template professionnel
sendInvoiceEmail(to, customerName, billNumber, billDate, totalAmount, pdfBytes)

// Envoyer un bon de livraison avec template professionnel
sendDeliveryNoteEmail(to, customerName, deliveryNoteNumber, deliveryDate, recipientName, pdfBytes)

// Envoyer une notification générique
sendNotification(to, icon, title, greeting, message, footer, ctaText, ctaLink)
```

**Méthodes existantes (conservées)** :
- `sendSimpleEmail(to, subject, body)` — Email simple
- `sendEmailWithPdfAttachment(to, subject, body, pdfBytes, pdfFileName)` — Email avec PDF

### PasswordResetEmailService (refactorisé)

Utilise maintenant `EmailTemplateService` au lieu de HTML inline.

**Avant** :
```java
private String buildEmailHtml(String userName, String resetLink) {
    return """
        <!DOCTYPE html>
        <html>...500 lignes de HTML inline...</html>
    """.formatted(userName, resetLink);
}
```

**Après** :
```java
String emailHtml = emailTemplateService.renderPasswordResetEmail(userName, resetLink);
```

---

## 💻 Exemples d'Utilisation

### Exemple 1 : Envoi de facture

```java
@Service
public class BillService {
    
    @Autowired
    private EmailService emailService;
    
    public void sendBillToCustomer(Bill bill, byte[] pdfBytes) {
        emailService.sendInvoiceEmail(
            bill.getCustomer().getEmail(),
            bill.getCustomer().getName(),
            bill.getBillNumber(),
            formatDate(bill.getDate()),
            formatAmount(bill.getTotalAmount()),
            pdfBytes
        );
    }
}
```

### Exemple 2 : Envoi de bon de livraison

```java
@Service
public class DeliveryNoteService {
    
    @Autowired
    private EmailService emailService;
    
    public void sendDeliveryNote(DeliveryNote dn, byte[] pdfBytes) {
        emailService.sendDeliveryNoteEmail(
            dn.getCustomer().getEmail(),
            dn.getCustomer().getName(),
            dn.getDeliveryNoteNumber(),
            formatDate(dn.getDate()),
            dn.getRecipientFullName(),
            pdfBytes
        );
    }
}
```

### Exemple 3 : Notification personnalisée

```java
emailService.sendNotification(
    "user@example.com",
    "✅",                                // Icône
    "Commande validée",                  // Titre
    "Bonjour Jean",                      // Salutation
    "Votre commande #12345 a été validée avec succès.", // Message
    "Merci de votre confiance.",         // Footer
    "Voir ma commande",                  // Texte bouton CTA
    "https://app.stock-erp.com/orders/12345" // Lien CTA
);
```

### Exemple 4 : Template personnalisé

```java
@Service
public class CustomEmailService {
    
    @Autowired
    private EmailTemplateService emailTemplateService;
    @Autowired
    private EmailService emailService;
    
    public void sendLowStockAlert(Product product) {
        Map<String, Object> vars = Map.of(
            "productName", product.getName(),
            "currentStock", product.getStock(),
            "minStock", product.getMinStock()
        );
        
        String html = emailTemplateService.renderTemplate("low-stock-alert", vars);
        emailService.sendSimpleEmail(
            "admin@example.com",
            "⚠️ Alerte Stock Faible — " + product.getName(),
            html
        );
    }
}
```

---

## ✅ Avantages de la Nouvelle Architecture

### Pour les Développeurs

✅ **Séparation des responsabilités** : HTML séparé du code Java  
✅ **Réutilisabilité** : Templates réutilisables pour différents cas  
✅ **Maintenabilité** : Modification du design sans toucher au code Java  
✅ **Testabilité** : Service EmailTemplateService facilement testable  
✅ **Type safety** : Méthodes typées avec paramètres explicites

### Pour le Design

✅ **Cohérence visuelle** : Tous les emails suivent le même design system  
✅ **Branding unifié** : Couleurs, logo, et footer identiques partout  
✅ **Facilité de modification** : Designer peut modifier les templates directement  
✅ **Responsive** : Emails optimisés pour mobile et desktop

### Pour les Utilisateurs

✅ **Emails professionnels** : Design moderne et attrayant  
✅ **Lisibilité améliorée** : Hiérarchie visuelle claire  
✅ **Confiance** : Branding cohérent avec l'application  
✅ **Accessibilité** : Structure sémantique et contrastes corrects

---

## 🔧 Configuration Requise

### Dependencies (déjà présentes)

```xml
<!-- Thymeleaf (pour templates) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>

<!-- Spring Web (pour RestTemplate) -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

### application.properties

```properties
# Resend API Configuration
resend.api-key=re_xxxxxxxxxxxxx
resend.from-email=onboarding@resend.dev
resend.from-name=Stock ERP
```

---

## 🧪 Tests & Validation

### Test manuel

```bash
# 1. Démarrer l'application
cd backend && ./mvnw spring-boot:run

# 2. Tester un email de réinitialisation
curl -X POST http://localhost:8080/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'

# 3. Vérifier les logs
tail -f logs/stock_management.log | grep "Email"
```

### Aperçu du rendu

Pour prévisualiser les templates :
1. Ouvrir le fichier `.html` dans un navigateur
2. Ou utiliser un outil comme [Litmus](https://litmus.com/) ou [Email on Acid](https://www.emailonacid.com/)

---

## 📚 Documentation

Documentation complète disponible dans :
- `backend/src/main/resources/email-templates/README.md` — Guide complet des templates
- [Ce fichier] — Vue d'ensemble et architecture

---

## 🚀 Prochaines Étapes (Optionnel)

### Améliorations Futures

- [ ] Ajouter template pour confirmation d'inscription
- [ ] Ajouter template pour rappel de paiement
- [ ] Ajouter template pour alerte de stock faible
- [ ] Internationalisation (i18n) des emails (FR/EN/AR)
- [ ] Mode sombre / clair selon préférences utilisateur
- [ ] Tests unitaires pour EmailTemplateService
- [ ] A/B testing des templates (taux d'ouverture)

### Templates Additionnels Possibles

1. **welcome-email.html** — Email de bienvenue après inscription
2. **payment-reminder.html** — Rappel de paiement facture
3. **order-confirmation.html** — Confirmation de commande
4. **stock-alert.html** — Alerte stock faible
5. **weekly-report.html** — Rapport hebdomadaire
6. **account-locked.html** — Compte verrouillé (sécurité)
7. **two-factor-auth.html** — Code 2FA

---

## 📊 Récapitulatif des Changements

| Fichier | Type | Description |
|---------|------|-------------|
| `email-templates/password-reset.html` | ✨ Nouveau | Template de réinitialisation mot de passe |
| `email-templates/invoice-notification.html` | ✨ Nouveau | Template de notification facture |
| `email-templates/delivery-note-notification.html` | ✨ Nouveau | Template de notification BL |
| `email-templates/generic-notification.html` | ✨ Nouveau | Template générique personnalisable |
| `email-templates/README.md` | ✨ Nouveau | Documentation complète des templates |
| `EmailTemplateConfiguration.java` | ✨ Nouveau | Configuration Thymeleaf pour emails |
| `EmailTemplateService.java` | ✨ Nouveau | Service de rendu des templates |
| `PasswordResetEmailService.java` | ✅ Modifié | Refactorisé pour utiliser templates |
| `EmailService.java` | ✅ Modifié | Ajout méthodes pour templates |

---

## ✨ Conclusion

Le système d'emails de Stock ERP est maintenant :
- ✅ **Moderne et professionnel**
- ✅ **Cohérent avec l'identité visuelle de l'app**
- ✅ **Facile à maintenir et étendre**
- ✅ **Bien documenté**
- ✅ **Prêt pour la production**

**Branding** : Tous les emails affichent fièrement le logo et les couleurs de **Stock ERP** avec le tagline "Gestion intelligente de stock" 📦

---

© 2026 Stock ERP — Amélioration du système d'emails

