# UniMarket - University Marketplace Application

<p align="center">
  <img src="generated-icon.png" alt="UniMarket Logo" width="120" height="120"/>
</p>

UniMarket is a dynamic web application designed specifically for university communities, enabling students and faculty to buy, sell, and trade unused goods easily and securely. Built with a modern tech stack and responsive design, it provides a seamless user experience across all devices.

## 🌟 Features

### User Authentication
- Email & Password registration and login
- Google Authentication integration
- User profile management
- Profile image upload

### Marketplace Functionality
- Create product listings with multiple images (up to 5 per product)
- Product categorization with filters
- Edit product details (title, description, price, condition, etc.)
- Mark products as sold
- Toggle bidding availability
- Flexible pricing options

### Search and Discovery
- Advanced search with filters
- Category browsing
- Featured products section
- University-specific filters
- Price range filtering
- Product condition filtering

### Social and Communication
- WhatsApp integration for direct seller communication
- In-app messaging system
- Social media sharing options for product listings (Facebook, Twitter, WhatsApp, Email)

### User Experience
- Responsive design for all devices
- Real-time updates
- Receipt generation for completed transactions
- Light/Dark mode support

### Progressive Web App (PWA)
- Offline functionality
- Local data caching
- Background synchronization
- Push notifications support
- Installable on home screen

## 🛠️ Tech Stack

### Frontend
- React.js with TypeScript
- TailwindCSS for styling
- Shadcn/UI component library
- Wouter for routing
- React Hook Form for form handling
- TanStack Query for data fetching
- Zod for validation

### Backend
- Firebase services:
  - Firebase Authentication
  - Firestore Database
  - Firebase Storage
  - Firebase Analytics
- Express.js server
- TypeScript

### Storage
- Firebase Firestore (database)
- Firebase Storage (files/images)
- ImgBB API (image hosting)

### Deployment
- Replit (development)
- Firebase Hosting (production option)
- Netlify (production option)

## 📋 Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Firebase account
- ImgBB API key
- Git

## 🚀 Getting Started

### Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/yourusername/unimarket.git
cd unimarket

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the root directory with the following variables:

```
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# ImgBB API Key
IMGBB_API_KEY=your_imgbb_api_key
```

### ImgBB Setup

1. Go to the [ImgBB website](https://imgbb.com/)
2. Create an account if you don't have one
3. Go to your account dashboard
4. Navigate to the API settings or Developer section
5. Generate an API key
6. Add the API key to your `.env` file as `IMGBB_API_KEY`

The application uses ImgBB for image hosting with both client-side and server-side fallback approaches:
- Primary method: Server-side API that securely uploads images using the API key
- Fallback method: Direct API that uses client-side code in case the server endpoint fails

### WhatsApp Integration

UniMarket features direct WhatsApp integration for real-time communication between buyers and sellers:

1. **Setup**: Sellers provide their WhatsApp number during product listing creation
2. **Buyer Access**: Buyers see a "Contact via WhatsApp" button on product detail pages
3. **Direct Communication**: The button opens WhatsApp with a pre-filled message
4. **Smart Behavior**: 
   - For product owners: The WhatsApp button is replaced with an "Edit Product" button
   - For regular users: The WhatsApp button provides direct seller contact
5. **Message Template**: Initial message includes product details and inquiry text

The WhatsApp integration uses the WhatsApp Web API URL format:
```
https://wa.me/{phone_number}?text={encoded_message}
```

This allows for seamless communication without requiring complex API integrations or paid services.

### Social Media Sharing

UniMarket enables easy sharing of product listings across various social platforms:

1. **Share Button**: Every product listing includes a share button (visible in product detail and My Listings pages)
2. **Share Options**: Users can share products via:
   - Facebook
   - Twitter
   - WhatsApp
   - Email
   - Copy link to clipboard
3. **Share Content**: When sharing, the product title, price, description, and image are included
4. **Implementation**: Uses Web Share API when available, with custom fallbacks for specific platforms
5. **Modal Interface**: Clean dialog interface with platform icons for easy access

This feature increases product visibility and helps university users spread the word about their listings, potentially reaching more interested buyers within their community.

### Firebase Setup

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Add a web app to your project
4. Enable Authentication methods (Email/Password and Google)
5. Create Firestore database
6. Set up Firestore rules
7. Set up Storage rules (see below)
8. Configure CORS for Firebase Storage (see below)
9. Add the web app's Firebase configuration to your `.env` file

#### Firebase Storage Rules

Create the following security rules for Firebase Storage:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to all files
    match /{allPaths=**} {
      // Allow anyone to read files
      allow read;
      
      // Only authenticated users can write files
      allow write: if request.auth != null;
      
      // User-specific storage - only the user can write to their own folder
      match /users/{userId}/{allUserFiles=**} {
        allow write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Product images - only the owner of the product can upload images
      match /products/{userId}/{allProductFiles=**} {
        allow write: if request.auth != null && request.auth.uid == userId;
      }
      
      // Profile images - only the user can upload their own profile image
      match /profiles/{userId}/{profileImg} {
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

#### Firebase Storage CORS Configuration

Create a `cors.json` file with the following content:

```json
{
  "cors": [
    {
      "origin": ["*"],
      "method": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "maxAgeSeconds": 3600
    }
  ]
}
```

Then run the following command with Firebase CLI:

```bash
firebase storage:cors set cors.json
```

For production, limit the origins to your domains:

```json
{
  "cors": [
    {
      "origin": ["https://yourdomain.com", "https://*.replit.app"],
      "method": ["GET", "PUT", "POST", "DELETE", "HEAD"],
      "maxAgeSeconds": 3600
    }
  ]
}
```

### Running Locally

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5000`

### IDE Setup (IntelliJ IDEA)

1. Open IntelliJ IDEA
2. Select "Open" or "Import Project"
3. Navigate to the project directory and click "OK"
4. Make sure Node.js plugin is installed
5. Configure TypeScript compiler:
   - Go to Settings/Preferences
   - Languages & Frameworks > TypeScript
   - Set "TypeScript version" to "Use TypeScript from node_modules"
6. Set up Run/Debug Configuration:
   - Add new npm configuration
   - Set "Command" to "run"
   - Set "Scripts" to "dev"
   - Apply and save

## 📱 PWA Features and Offline Support

UniMarket is designed as a Progressive Web App (PWA), offering enhanced user experience with offline capabilities:

### Service Worker Implementation
- Caches app assets (HTML, CSS, JS, images) for offline access
- Implements network-first strategy for dynamic content
- Falls back to cached content when network is unavailable

### Offline Data Storage
- Uses IndexedDB for client-side data persistence
- Stores product listings, messages, and user data locally
- Implements data sync when connection is restored

### Background Synchronization
- Queues failed network requests during offline periods
- Automatically processes pending operations when online
- Supports operations like sending messages and creating listings

### User Experience Enhancements
- "Add to Home Screen" functionality for app-like experience
- Fast loading with cached assets
- Seamless transition between online and offline states
- Push notification support for important events and updates

### How Offline Mode Works
1. **Initial Load**: App downloads and caches critical assets
2. **Browsing**: User can browse previously viewed products offline
3. **Actions**: User can create drafts of listings, messages, etc. while offline
4. **Reconnection**: When connection is restored, pending actions are processed
5. **Sync**: Data is synchronized with the server to ensure consistency

### Testing Offline Mode
1. Open the app and browse some content to populate the cache
2. Toggle airplane mode or disconnect from the internet
3. Continue using the app - you should be able to view cached content
4. Create draft listings or messages
5. Reconnect to the internet to see your actions sync with the server

## 🌐 Deployment

### Firebase Deployment

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```
- Select Hosting and other Firebase services you need
- Select your Firebase project
- Set the public directory to "dist"
- Configure as a single-page app
- Set up other options as needed

4. Build the project:
```bash
npm run build
```

5. Deploy to Firebase:
```bash
firebase deploy
```

### Netlify Deployment

1. Create a `netlify.toml` file in your project root:
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Deploy using Netlify CLI:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize project
netlify init

# Deploy
netlify deploy
```

Alternatively, connect your GitHub repository to Netlify for continuous deployment.

## 📦 Dependencies

### Main Dependencies

```json
{
  "@hookform/resolvers": "^3.3.2",
  "@radix-ui/react-*": "^1.0.0",
  "@tanstack/react-query": "^4.36.1",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "date-fns": "^2.30.0",
  "drizzle-orm": "^0.28.6",
  "express": "^4.18.2",
  "express-session": "^1.17.3",
  "firebase": "^10.5.0",
  "form-data": "^4.0.0",
  "jspdf": "^2.5.1",
  "jspdf-autotable": "^3.7.0",
  "lucide-react": "^0.288.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-hook-form": "^7.47.0",
  "react-icons": "^4.11.0",
  "tailwind-merge": "^1.14.0",
  "tailwindcss": "^3.3.3",
  "tailwindcss-animate": "^1.0.7",
  "typescript": "^5.2.2",
  "wouter": "^2.11.0",
  "zod": "^3.22.4"
}
```

### Development Dependencies

```json
{
  "@types/express": "^4.17.19",
  "@types/node": "^20.8.6",
  "@types/react": "^18.2.28",
  "@types/react-dom": "^18.2.13",
  "@vitejs/plugin-react": "^4.1.0",
  "autoprefixer": "^10.4.16",
  "postcss": "^8.4.31",
  "tsx": "^3.13.0",
  "vite": "^4.4.11"
}
```

## 🧩 Project Structure

```
unimarket/
├── client/                # Frontend code
│   ├── public/            # Static assets
│   │   └── service-worker.js  # PWA service worker
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── context/       # React contexts
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Helper functions
│   │   ├── App.tsx        # Main application component
│   │   ├── index.css      # Global styles
│   │   ├── main.tsx       # Application entry point
│   │   └── layout.tsx     # Main layout component
│   └── index.html         # HTML template
├── server/                # Backend code
│   ├── api/               # API routes
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # Route definitions
│   ├── storage.ts         # Storage interface
│   └── vite.ts            # Vite server integration
├── shared/                # Shared code
│   └── schema.ts          # Database schema and types
├── drizzle.config.ts      # Drizzle ORM configuration
├── package.json           # Project dependencies
├── postcss.config.js      # PostCSS configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── theme.json            # Theme configuration
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

List project contributors here.

## 🙏 Acknowledgements

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Shadcn/UI](https://ui.shadcn.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Replit](https://replit.com/)
- [ImgBB](https://imgbb.com/)