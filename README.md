# Beacon - Emergency GPS Navigation System

A completely independent emergency GPS navigation application with OpenStreetMap integration, weather alerts, and disaster avoidance capabilities.

## 🚀 Features

- **Real-time GPS Tracking** - Accurate location monitoring with position updates
- **OpenStreetMap Integration** - Free, open-source mapping with no API limits
- **Weather Alert System** - Automatic monitoring and emergency notifications
- **Emergency Mode** - Critical alert handling with enhanced visibility
- **Offline Capable** - Works without internet for basic GPS functions
- **Mobile Responsive** - Optimized for mobile devices and emergency use

## 🛠 Getting Started

### Prerequisites
- Node.js 18+ installed
- Modern web browser with GPS support
- Location permissions enabled

### Installation

1. **Clone or extract the beacon module**
   ```bash
   cd beacon_module
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`
   - Allow location permissions when prompted

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Usage

1. **Launch App** - Open browser to localhost:5173
2. **Allow GPS** - Grant location permissions when prompted
3. **View Location** - See real-time GPS coordinates and accuracy
4. **Monitor Alerts** - Weather alerts appear automatically
5. **Emergency Mode** - Activates automatically for critical alerts

## 🗺 OpenStreetMap Integration

The app uses OpenStreetMap tiles which provide:
- ✅ **Free usage** - No API keys or costs
- ✅ **No rate limits** - Unlimited map requests
- ✅ **Global coverage** - Worldwide mapping data
- ✅ **Open source** - Community-driven map data
- ✅ **Privacy focused** - No tracking or data collection

## 🏗 Architecture

```
beacon_module/
├── package.json              # Independent package config
├── vite.config.js            # Build configuration
├── frontend/
│   ├── src/
│   │   ├── main.jsx          # Standalone app entry point
│   │   ├── BeaconApp.jsx     # Main app component
│   │   └── index.css         # Base styles
│   ├── components/
│   │   ├── map/              # GPS and mapping components
│   │   ├── auth/             # Authentication components
│   │   ├── location/         # Location services
│   │   └── alerts/           # Weather alert system
│   ├── services/             # API and data services
│   ├── hooks/                # React custom hooks
│   └── public/               # Static assets
└── README.md                 # This file
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm start` - Alias for dev command

### Environment Setup

The app is designed to be completely self-contained with:
- All dependencies declared in local package.json
- No external service dependencies (beyond OpenStreetMap tiles)
- Mock authentication for development
- Local storage for user sessions

## 📦 Deployment Options

### Web Deployment
- Build with `npm run build`
- Deploy `dist/` folder to any static hosting
- Works on Netlify, Vercel, GitHub Pages, etc.

### Mobile App (Electron)
```bash
npm run electron-build
```

### PWA Installation
- The app includes PWA manifest
- Users can install it as a standalone app
- Works offline for basic GPS functions

## 🛡 Security & Privacy

- **No external analytics** - No tracking or data collection
- **Local data only** - User data stays on device
- **HTTPS recommended** - For location permissions on mobile
- **No API keys** - OpenStreetMap requires no authentication

## 🤝 Contributing

This is a standalone emergency navigation system. To contribute:

1. Fork the beacon_module directory
2. Make your changes
3. Test with `npm run dev`
4. Submit a pull request

## 📄 License

MIT License - See package.json for details

## 🆘 Emergency Use

This app is designed for emergency situations:
- Works offline for basic GPS
- Minimal battery usage
- Clear, high-contrast emergency mode
- Weather alert integration
- Mobile-optimized interface

Always have backup navigation methods in true emergencies.