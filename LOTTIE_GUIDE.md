# Lottie Animations Setup Guide 🎨

## Overview
BloomIQ uses Lottie animations to enhance the user experience with beautiful, lightweight animations.

## Current Animations

### 1. **Plant Loader** (`plant-loader.json`)
- **Usage**: General loading animation used throughout the app
- **Where**: Dashboard, Analysis, Reports loading states
- **Recommended**: Search "plant growing" or "tree loading" on LottieFiles

### 2. **Red Tomato** (`red-tomato.json`)
- **Usage**: Show status of fully ripened tomatoes
- **Where**: Reports breakdown, Analysis results
- **Recommended**: Search "red tomato" or "ripe tomato" on LottieFiles

### 3. **Green Tomato** (`green-tomato.json`)
- **Usage**: Show status of half-ripened or green tomatoes
- **Where**: Reports breakdown, Analysis results
- **Recommended**: Search "green tomato" or "unripe tomato" on LottieFiles

### 4. **Flower** (`flower.json`)
- **Usage**: Show flowering stage status
- **Where**: Reports breakdown, Analysis results
- **Recommended**: Search "flower bloom" or "blossom" on LottieFiles

## How to Get Real Lottie Animations

### Option 1: LottieFiles (Recommended)
1. Go to [LottieFiles.com](https://lottiefiles.com/)
2. Search for your desired animation (e.g., "plant loading")
3. Download the JSON file
4. Replace the placeholder files in `web/src/assets/lottie/`

### Option 2: Create Custom Animations
1. Use Adobe After Effects with Bodymovin plugin
2. Export as Lottie JSON
3. Place in `web/src/assets/lottie/`

### Recommended Free Animations from LottieFiles:

#### Plant Loader
- Search: "plant growing animation"
- Keywords: seedling, tree growing, plant loader
- Suggested: Look for continuous loop animations

#### Red Tomato
- Search: "tomato animation"
- Keywords: red tomato, ripe, harvest
- Suggested: Subtle bounce or pulse animations

#### Green Tomato
- Search: "green tomato" or "unripe fruit"
- Keywords: growing tomato, green fruit
- Suggested: Growing or pulsing animations

#### Flower
- Search: "flower bloom"
- Keywords: blossom, flowering, flower opening
- Suggested: Blooming or swaying animations

## Implementation

### Using PlantLoader Component
\`\`\`javascript
import { PlantLoader } from '../components/loaders';

// In your component
<PlantLoader size={200} text="Analyzing your crop..." />
\`\`\`

### Using TomatoStatus Component
\`\`\`javascript
import { TomatoStatus } from '../components/loaders';

// For different types
<TomatoStatus type="red" size={100} label="Fully Ripened" />
<TomatoStatus type="green" size={100} label="Half Ripened" />
<TomatoStatus type="flower" size={100} label="Flowering" />
\`\`\`

### Type Mapping
The `TomatoStatus` component automatically maps detection classes:
- `'red'`, `'fully_ripened'`, `'l_fully_ripened'` → Red Tomato
- `'green'`, `'half_ripened'`, `'l_half_ripened'`, `'l_green'` → Green Tomato
- `'flower'`, `'flowering'`, `'b_green'` → Flower

## File Structure
\`\`\`
web/src/
├── assets/
│   └── lottie/
│       ├── plant-loader.json
│       ├── red-tomato.json
│       ├── green-tomato.json
│       └── flower.json
└── components/
    └── loaders/
        ├── PlantLoader.js
        ├── TomatoStatus.js
        └── index.js
\`\`\`

## Tips for Choosing Animations

1. **File Size**: Keep animations under 100KB for better performance
2. **Loop**: Choose animations that loop smoothly
3. **Colors**: Match your app's color scheme (greens, reds, pinks)
4. **Speed**: 60fps animations work best
5. **Simplicity**: Cleaner animations load faster

## Customization

### Adjust Animation Speed
\`\`\`javascript
<Lottie 
  animationData={animation} 
  loop={true}
  speed={1.5} // 1.5x faster
/>
\`\`\`

### Control Play/Pause
\`\`\`javascript
const lottieRef = useRef();

<Lottie 
  lottieRef={lottieRef}
  animationData={animation}
/>

// Later
lottieRef.current.play();
lottieRef.current.pause();
\`\`\`

## License Considerations

- Always check the license on LottieFiles
- Most free animations allow commercial use
- Attribution may be required for some
- Consider premium animations for unique branding

## Next Steps

1. Visit LottieFiles.com
2. Download 4 animations matching the descriptions above
3. Replace the placeholder JSON files
4. Test in your app
5. Adjust sizes and colors as needed

## Support

For Lottie-related issues:
- [Lottie Docs](https://airbnb.io/lottie/)
- [LottieFiles Community](https://lottiefiles.com/community)
- [Lottie React GitHub](https://github.com/LottieFiles/lottie-react)
