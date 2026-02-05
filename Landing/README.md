# 🎮 TaskMind Landing Page

A pixel-perfect landing page with a retro gaming (Minecraft-inspired) theme for the TaskMind project.

## 🌟 Features

### Visual Design
- **Pixel Art Theme**: Minecraft-inspired blocky design with retro gaming aesthetics
- **Parallax Background**: Multi-layer animated background for depth
- **Vibrant Colors**: Gaming-inspired color palette (green, blue, purple, yellow)
- **Pixel Font**: Press Start 2P font for authentic retro feel
- **Smooth Animations**: Hover effects, transitions, and micro-animations throughout

### Interactive Elements
- **Gamified Task Demo**: Interactive task list with XP system
- **Game Console**: Functional D-pad and action buttons
- **Pixel Effects**: Click burst effects and particle animations
- **Smooth Scrolling**: Animated navigation between sections
- **Easter Eggs**: Press 'P' for pixel rain effect
- **Keyboard Controls**: Arrow keys interact with console

### Sections
1. **Hero Section**: Eye-catching introduction with stats and call-to-action
2. **Features Grid**: 6 power-up cards showcasing features with rarity badges
3. **Demo Section**: Interactive game console demonstration
4. **CTA Section**: Final call-to-action with character animations
5. **Footer**: Comprehensive links and information

## 📁 File Structure

```
Landing/
├── index.html          # Main HTML structure
├── styles.css          # Pixel-themed styling
├── script.js           # Interactive functionality
└── README.md           # This file
```

## 🚀 Quick Start

### Option 1: Open Directly
Simply open `index.html` in your browser:
```bash
# Windows
start index.html

# Or just double-click the file
```

### Option 2: Use Live Server
For better development experience with hot reload:

1. **Using VS Code**:
   - Install "Live Server" extension
   - Right-click `index.html` → "Open with Live Server"

2. **Using Python**:
   ```bash
   cd Landing
   python -m http.server 8000
   # Then open http://localhost:8000
   ```

3. **Using Node.js**:
   ```bash
   npx http-server ./Landing -p 8000
   # Then open http://localhost:8000
   ```

## 🎨 Color Scheme

| Color | Hex Code | Usage |
|-------|----------|-------|
| Pixel Green | `#7cd956` | Primary actions, highlights |
| Pixel Blue | `#4a9eff` | Secondary actions, links |
| Pixel Purple | `#9d4dff` | Special elements |
| Pixel Yellow | `#ffd93d` | Alerts, XP, achievements |
| Pixel Dark | `#1a1a1a` | Background |

## 🎯 Rarity System

Features are categorized by rarity:
- **Common** (`#b0b0b0`): Basic features
- **Uncommon** (`#7cd956`): Enhanced features
- **Rare** (`#4a9eff`): Advanced features
- **Epic** (`#9d4dff`): Premium features
- **Legendary** (`#ffd93d`): Ultimate features

## 🎮 Interactive Features

### Task System
Click on tasks in the pixel screen to:
- Mark tasks as completed
- Earn XP (+100 per task)
- See completion animations
- Level up when reaching 1000 XP

### Game Console
- **D-Pad**: Navigate in different directions
- **A Button**: Start the mini game
- **B Button**: Exit the game
- All buttons provide visual and console feedback

### Easter Eggs
- **Press 'P'**: Trigger pixel rain effect
- **Arrow Keys**: Control console direction
- **Console Logs**: Check browser console for messages

## 📱 Responsive Design

The landing page is fully responsive with breakpoints at:
- **Desktop**: 1400px+ (full experience)
- **Tablet**: 768px - 1399px (adjusted layout)
- **Mobile**: < 768px (stacked layout, simplified navigation)

## 🛠️ Customization

### Changing Colors
Edit CSS variables in `styles.css`:
```css
:root {
    --pixel-green: #7cd956;
    --pixel-blue: #4a9eff;
    /* ... modify as needed */
}
```

### Adding New Sections
1. Add HTML section in `index.html`
2. Style in `styles.css`
3. Add interactions in `script.js` if needed

### Modifying Animations
All animations are defined in CSS with `@keyframes`:
- `pulse`, `float`, `glitch`, `shimmer`, etc.
- Adjust timing and easing in the animation properties

## 🌐 Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ⚠️ IE11 (limited support, no CSS variables)

## 📝 Performance

- **No Dependencies**: Pure HTML, CSS, and JavaScript
- **Optimized Animations**: GPU-accelerated transforms
- **Lazy Loading Ready**: Easy to add for images
- **Minimal JS**: ~400 lines of vanilla JavaScript

## 🔗 Integration

### With Backend
Add API calls in `script.js`:
```javascript
// Example: Fetch real task data
async function loadTasks() {
    const response = await fetch('http://your-api.com/tasks');
    const tasks = await response.json();
    // Update UI
}
```

### With Frontend App
Link to your main app:
```html
<!-- Update buttons in index.html -->
<a href="../FE/index.html" class="pixel-button">
    Launch App
</a>
```

## 🎨 Design Inspiration

This landing page draws inspiration from:
- **Minecraft**: Blocky pixel aesthetics
- **Retro Gaming**: 8-bit/16-bit era design
- **Modern Web**: Smooth animations and interactions
- **Gamification**: XP, levels, achievements

## 📄 License

Part of the TaskMind project. See main project README for license information.

## 🤝 Contributing

To improve the landing page:
1. Modify the files
2. Test across different browsers
3. Ensure mobile responsiveness
4. Keep the pixel theme consistent

## 🐛 Known Issues

- Large parallax backgrounds may impact performance on low-end devices
- Press Start 2P font requires internet connection (Google Fonts)
- Some animations may not work in older browsers

## 📞 Support

For issues or questions about the landing page:
- Check the browser console for errors
- Verify all files are in the same directory
- Ensure internet connection for fonts

---

**Made with ❤️ and pixels** 🎮
