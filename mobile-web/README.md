# MenMade Mobile Web - Landing Page

A modern, responsive mobile web landing page for MenMade - the social app for men to join squads, crush challenges, and build brotherhood.

## 🎨 Design Features

- **Color Scheme**: Black (`#0a0e27`) with Dark Orange (`#ff6b1a`) accents
- **Responsive**: Fully optimized for mobile, tablet, and desktop
- **Animations**: Smooth transitions, hover effects, and scroll animations
- **Modern UI**: Glass-morphism effects, gradient text, and animated shapes

## 📱 Sections

1. **Navigation**: Sticky navbar with mobile hamburger menu
2. **Hero Section**: Eye-catching introduction with animated text
3. **Features**: 4 key features showcasing app benefits
4. **How It Works**: 3-step visual guide to getting started
5. **Stats**: Social proof with impressive metrics
6. **CTA**: Call-to-action to download the app
7. **Footer**: Links and copyright

## 🚀 Getting Started

### Quick Start (Using Python)
```bash
# Navigate to the mobile-web directory
cd /workspaces/MenMade/mobile-web

# Run Python's built-in server (Python 3)
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Using Node.js
```bash
# If you have Node.js installed, you can use http-server
npm install -g http-server
http-server
```

### Using VS Code Live Server
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"

## 📁 File Structure

```
mobile-web/
├── index.html      # Main HTML file with page structure
├── styles.css      # All styling and animations
├── script.js       # JavaScript for interactivity
└── README.md       # This file
```

## ✨ Key Features

### Interactive Elements
- Mobile navigation toggle with animated hamburger menu
- Smooth scroll navigation
- Hover effects on cards and buttons
- Scroll-triggered animations
- Counter animations for statistics

### Animations
- Hero title words stagger in
- Feature cards fade in and lift on scroll
- Floating background shapes
- Button ripple effects on click
- Navbar shadow on scroll

### Mobile Optimized
- Responsive grid layouts
- Flexible typography (clamp)
- Touch-friendly buttons and navigation
- Mobile-first design approach

## 🎯 Next Steps

- [ ] Add sign-up/login modal
- [ ] Create in-app pages (squad management, challenges, chat)
- [ ] Add backend integration
- [ ] Implement PWA features
- [ ] Add analytics tracking
- [ ] Create admin dashboard

## 🔧 Customization

### Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-black: #0a0e27;
    --dark-orange: #ff6b1a;
    /* ... more colors ... */
}
```

### Animations
All animations are defined in `styles.css` with `@keyframes`. Adjust timing and values as needed.

### Content
Update text and icons in `index.html` to match your specific messaging.

## 📞 Support

For questions or suggestions, contact the development team.

---

**Built with ❤️ for MenMade**
