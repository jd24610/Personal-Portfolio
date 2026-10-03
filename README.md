# Joseph Decossard - Portfolio Website

A modern, interactive portfolio website showcasing my journey as a Computer Science graduate, security researcher, and Software Engineer. Built with a focus on performance, accessibility, and user experience.

## 🌟 Features

### Main Portfolio (`index.html`)
- **Dynamic Content Rendering**: All content loaded from `resume.json` for easy updates
- **3D Experience Carousel**: Interactive coverflow-style showcase of work experiences
- **Particle Animation Background**: Subtle animated particles for visual appeal
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern Aesthetics**: "Warm Terminal" color scheme with developer-inspired design
- **Smooth Animations**: Scroll-triggered fade-in effects and smooth transitions
- **Accessibility**: WCAG compliant with keyboard navigation and screen reader support

### Cyber Lab Page (`glass.html`)
- **Interactive 5 Windows Framework**: Explore Leadership, Global Competency, Academic Excellence, Service, and Professional Development
- **Timeline**: Navigate through growth and achievements
- **Dynamic Navigation**: Separate navigation for cybersecurity-specific content
- **Modern Dark Theme**: Professional hacker-inspired aesthetics
- **UN SDG Integration**: Links projects to Sustainable Development Goals

## 🛠️ Tech Stack

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom properties, flexbox, grid, keyframe animations
- **Vanilla JavaScript**: No frameworks - lightweight and fast
- **Lucide Icons**: Modern, professional icon system
- **Canvas API**: Particle animation system
- **Intersection Observer API**: Efficient scroll-triggered animations

## 📁 Project Structure

```
portfolio-main/
├── index.html                      # Main portfolio page
├── glass.html                      # Cyber Lab page
├── script.js                       # Main portfolio JavaScript
├── styles.css                      # All styles (main + Cyber Lab)
├── resume.json                     # Portfolio content data
├── assets/                         # Images, logos, documents
│   ├── *.jpg/png                   # Images for projects and experiences
│   ├── Joseph_Decossard_Resume.pdf # Downloadable resume
│   └── *.svg                       # SVGs (such as MU logo)
└── README.md                       # This file
```

## 🚀 Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/jd24610/Personal-Portfolio.git
   cd Personal-Portfolio
   ```

2. **Open with a local server**
   
   Using Python:
   ```bash
   python -m http.server 8000
   ```
   
   Using Node.js:
   ```bash
   npx http-server
   ```
   
   Or simply open `index.html` in your browser.

3. **View the site**
   - Main Portfolio: `http://localhost:8000/index.html`
   - GLASS Page: `http://localhost:8000/glass.html`

### Deployment

This is a static site and can be deployed to:
- **GitHub Pages**: Enable in repository settings
- **Netlify**: Drag and drop the folder
- **Vercel**: Connect to your repository
- **Any static hosting service**

## ✏️ Customization

### Update Content

**Main Portfolio Content** - Edit `resume.json`:
```json
{
  "name": "Your Name",
  "contact": { ... },
  "experience": [ ... ],
  "projects": [ ... ],
  "education": [ ... ],
  "skills": { ... }
}
```

**GLASS Content** - Edit `glass_portfolio_content.json`:
```json
{
  "personal": { ... },
  "about": { ... },
  "glassFiveWindows": { ... },
  "experiences": [ ... ]
}
```

### Update Colors

Edit CSS variables in `styles.css` (around line 1-80):
```css
:root {
  --bg-deep: #0a0a0b;
  --accent-main: #f5a623;
  --text-primary: #e8dcc4;
  /* ... more variables */
}
```

### Add Gallery Images

1. Place images in `assets/` folder
2. Name them: `glass-gallery-1.jpg`, `glass-gallery-2.jpg`, etc.
3. Update `glass.html` if adding more than 24 images

### Adjust Gallery Speed

In `styles.css`, find `.glass-gallery__track`:
```css
animation: galleryScroll 60s linear infinite;
```
Change `60s` to desired speed (lower = faster).

## 🎨 Design Features

### Color Schemes
- **Main Portfolio**: Warm Terminal (amber/gold accents on dark background)
- **GLASS Page**: NYU Purple (violet theme honoring the program)

### Typography
- **Headings**: IBM Plex Sans
- **Body**: IBM Plex Sans (lighter weight)
- **Code/Metadata**: JetBrains Mono

### Animations
- Smooth fade-in on scroll
- 3D coverflow carousel for experiences
- Auto-scrolling photo gallery with pause on hover
- Particle background animation
- Hover effects on cards and buttons

## 📱 Responsive Breakpoints

- **Desktop**: > 1024px (full layout)
- **Tablet**: 768px - 1024px (adjusted columns)
- **Mobile**: < 768px (single column, stacked layout)
- **Small Mobile**: < 640px (optimized touch targets)

## ♿ Accessibility Features

- Semantic HTML5 elements
- ARIA labels and roles
- Keyboard navigation support
- Focus indicators on interactive elements
- Alt text for all images
- Respects `prefers-reduced-motion`
- High contrast text
- Touch-friendly targets (minimum 44x44px)

## 🔧 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📊 Performance

- No external dependencies (except Lucide icons CDN)
- Optimized images with lazy loading
- Minimal JavaScript - vanilla only
- CSS animations use GPU acceleration
- Total page weight: < 2MB

## 🤝 Contributing

This is a personal portfolio, but suggestions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Submit a pull request

## 📄 License

This project is open source and available for educational purposes. Feel free to use the code structure, but please replace personal content with your own.

## 📬 Contact

- **Email**: jedecossard@gmail.com
- **LinkedIn**: [linkedin.com/in/josephdecossard](https://linkedin.com/in/josephdecossard)
- **GitHub**: [github.com/jd24610](https://github.com/jd24610)

## 🙏 Acknowledgments

- **Manhattan University**: For the supportive community and academic foundation
- **Lucide Icons**: For the beautiful icon system
- **IBM Plex Fonts**: For the modern, accessible typography

---

**Built with curiosity, deployed with passion.** 🚀

Last Updated: October 2026

