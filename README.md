# JunkShop - Antiques & Collectibles E-commerce Website

[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=flat&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Alpine.js](https://img.shields.io/badge/Alpine.js-8BC0D0?style=flat&logo=alpine.js&logoColor=black)](https://alpinejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![SumUp](https://img.shields.io/badge/SumUp-0D87D4?style=flat&logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAA7AAAAOwBeShxvQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAADDSURBVCiRY2AYBaNgFIyCoQ9kGBkZ/zMwMPxnYGD4z8DA8J+BgYERJse0YcOG/0wMDAwMTCDOBgYGhv8MDAwMDAwMDP8ZGBj+MzAwMPxnYmD4D5FnYmBg+M/AwPCfgYGB4T8DAwMjSB0jAwMDw38GBob/DAwMDP8ZGBj+MzIw/P/PwPD/PwMDw38GBob/DAwM/xkYGBj+MzEw/GdgYPjPwMDwn4GB4T8DAwPDfyYGhv8MDAwMDAwM/xkYGP4zMDD8Z2Bg+M/IwPCfkYGBYRQAAHVlJB1jgGzqAAAAAElFTkSuQmCC&logoColor=white)](https://sumup.com/)

A modern, fully-responsive e-commerce website for JunkShop, specializing in antiques and vintage collectibles. Built with Firebase, Alpine.js, and integrated with SumUp payment gateway.

---

## 🌟 Features

### Customer Features
- ✅ Browse antiques and collectibles catalog
- ✅ Filter products by category
- ✅ Product image zoom on hover
- ✅ Shopping cart with quantity management
- ✅ Multiple theme options (Light, Sepia, Charcoal, Slate, Parchment)
- ✅ Delivery or Collection options
- ✅ Secure payment processing via SumUp
- ✅ Mobile-responsive design
- ✅ GDPR-compliant cookie consent
- ✅ Comprehensive legal pages (T&Cs, Privacy Policy, Cookie Policy)

### Admin Features
- ✅ Product management (Add, Edit, Delete)
- ✅ Image upload with preview
- ✅ Order management system
- ✅ Order status tracking (New → Shipped → Completed)
- ✅ Featured product selection
- ✅ Hero slideshow configuration
- ✅ Product categorization
- ✅ Stock status management (Active/Sold)
- ✅ Postage cost management (including POA option)

---

## 🏗️ Architecture

### Frontend
- **Framework**: Alpine.js (lightweight reactive framework)
- **Styling**: TailwindCSS (utility-first CSS)
- **Hosting**: Firebase Hosting
- **Database**: Cloud Firestore (NoSQL)
- **Storage**: Firebase Storage (product images)
- **Authentication**: Firebase Auth (Anonymous + Email/Password)

### Backend
- **Cloud Functions**: Node.js serverless functions
- **Region**: europe-west2 (London)
- **Payment Gateway**: SumUp API
- **Runtime**: Node.js 18

---

## 📁 Project Structure

```
junkshop_live/
├── public/                 # Public assets (deployed)
│   ├── index.html         # Customer-facing website
│   └── admin.html         # Admin dashboard
├── functions/             # Firebase Cloud Functions
│   ├── index.js          # Payment processing & webhooks
│   └── package.json      # Function dependencies
├── index.html            # Main site (root)
├── admin.html            # Admin panel (root)
├── firebase.json         # Firebase configuration
├── .firebaserc           # Firebase project config
├── BUG_REPORT.md         # Bug analysis & fixes
├── DEPLOYMENT_GUIDE.md   # Deployment instructions
└── README.md             # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project created
- SumUp merchant account

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/landsendsolo/junkshop_live.git
   cd junkshop_live
   ```

2. **Install dependencies**:
   ```bash
   cd functions
   npm install
   cd ..
   ```

3. **Login to Firebase**:
   ```bash
   firebase login
   ```

4. **Configure SumUp API key**:
   ```bash
   firebase functions:config:set sumup.secret_key="YOUR_SUMUP_SECRET_KEY"
   ```

5. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```

For detailed deployment instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 🎨 Technology Stack

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Firebase Hosting** | Static site hosting | - |
| **Cloud Firestore** | NoSQL database | - |
| **Firebase Storage** | Image storage | - |
| **Firebase Auth** | User authentication | - |
| **Firebase Functions** | Serverless backend | Node 18 |
| **Alpine.js** | Frontend framework | 3.x |
| **TailwindCSS** | CSS framework | Latest CDN |
| **SumUp API** | Payment processing | v0.1 |

---

## 💳 Payment Flow

```
1. Customer adds items to cart
   ↓
2. Proceeds to checkout
   ↓
3. Fills in delivery details
   ↓
4. Clicks "Pay with Card"
   ↓
5. Cloud Function creates SumUp checkout session
   ↓
6. Order saved with status "pending_payment"
   ↓
7. Customer redirected to SumUp payment page
   ↓
8. Customer completes payment
   ↓
9. SumUp sends webhook to Cloud Function
   ↓
10. Order status updated to "paid"
    ↓
11. Products marked as "sold"
    ↓
12. Customer returns to website (order success)
```

---

## 🔒 Security Features

- ✅ Firestore security rules (read/write restrictions)
- ✅ Storage security rules (authenticated uploads only)
- ✅ HTTPS-only hosting
- ✅ Anonymous authentication for customers
- ✅ Email/password authentication for admins
- ✅ SumUp PCI DSS compliant payment processing
- ✅ No payment card data stored locally
- ✅ Environment variables for API keys
- ✅ GDPR-compliant cookie consent

---

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🧪 Testing

### Local Development

```bash
# Start Firebase emulators
firebase emulators:start
```

### Test Payment Flow

1. Use SumUp test credentials
2. Test card: `4242 4242 4242 4242`
3. Verify order creation and status updates

For detailed testing procedures, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md#testing)

---

## 📊 Admin Dashboard

Access the admin dashboard at: `https://your-domain.com/admin.html`

### Default Admin Setup

1. Go to Firebase Console → Authentication
2. Create user with email/password
3. Use credentials to login to admin panel

### Admin Capabilities

- **Product Management**: Full CRUD operations
- **Order Management**: View, update status, delete
- **Image Upload**: Direct upload to Firebase Storage
- **Category Management**: Organize products
- **Featured/Hero Selection**: Control homepage display

---

## 🐛 Known Issues & Fixes

This project has been thoroughly reviewed and fixed. All critical bugs have been resolved:

- ✅ **Fixed**: Payment processing now functional (previously bypassed)
- ✅ **Fixed**: SumUp integration completed
- ✅ **Fixed**: Webhook handler implemented
- ✅ **Fixed**: Proper error handling added
- ✅ **Fixed**: Form validation implemented

See [BUG_REPORT.md](./BUG_REPORT.md) for detailed analysis of issues and fixes.

---

## 📝 Configuration

### Firebase Configuration

Located in `index.html` and `admin.html`:

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyDnxZSN9VgIp2YE1qiZJdH9PYAx2ES_3tc",
    authDomain: "junkshop-website-gem.firebaseapp.com",
    projectId: "junkshop-website-gem",
    storageBucket: "junkshop-website-gem.firebasestorage.app",
    messagingSenderId: "233182522533",
    appId: "1:233182522533:web:9bc09e8730ca62e15df14c",
    measurementId: "G-DL2J14LQP0"
};
```

### SumUp Configuration

Set via Firebase CLI:
```bash
firebase functions:config:set sumup.secret_key="YOUR_KEY"
```

---

## 🔄 Deployment

### Deploy Everything
```bash
firebase deploy
```

### Deploy Functions Only
```bash
firebase deploy --only functions
```

### Deploy Hosting Only
```bash
firebase deploy --only hosting
```

---

## 📈 Future Enhancements

### Planned Features
- [ ] Email notifications (order confirmation, shipping)
- [ ] Customer account system
- [ ] Order tracking page
- [ ] Wishlist functionality
- [ ] Google Analytics integration
- [ ] Advanced search & filters
- [ ] Bulk product upload
- [ ] Discount codes/promotions
- [ ] Inventory management
- [ ] Multi-currency support

---

## 🤝 Contributing

This is a private project for JunkShop. For suggestions or issues, contact:

**Email**: junkshopdumfries@gmail.com

---

## 📄 License

© 2025 JunkShop. All rights reserved.

This project is proprietary and confidential.

---

## 📞 Contact & Support

**JunkShop**  
Unit 4 Huntingdon Road Ind. Est.  
Huntingdon Road  
Dumfries, DG1 1NF  
Scotland, UK

**Email**: junkshopdumfries@gmail.com  
**Website**: https://junkshop-website-gem.web.app

---

## 🏆 Credits

- **Design & Development**: Powered by AI assistance
- **Payment Integration**: SumUp
- **Hosting & Backend**: Google Firebase
- **Frontend Framework**: Alpine.js
- **Styling**: TailwindCSS

---

## 📚 Documentation

- [Bug Report & Analysis](./BUG_REPORT.md) - Detailed bug fixes
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - Step-by-step deployment
- [Firebase Documentation](https://firebase.google.com/docs)
- [SumUp API Documentation](https://developer.sumup.com/docs)
- [Alpine.js Documentation](https://alpinejs.dev/)

---

**Last Updated**: October 17, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready (after SumUp configuration)
