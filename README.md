# The Recipe Archive - Complete Documentation

## Overview
The Recipe Archive is a full-featured recipe management application with local storage support and cloud synchronization capabilities. Built with vanilla JavaScript, Tailwind CSS, and Firebase.

## Features

### Phase 1: Local Features (Complete ✅)
All Phase 1 features are fully implemented and tested.

#### 1. **Timing System**
- Prep time, cook time, servings tracking
- Difficulty level (Easy, Medium, Hard)
- Cuisine type selection
- Diet options (Vegan, Vegetarian, Gluten-free)

#### 2. **Categorization & Filtering**
- Filter by difficulty level
- Multi-select diet options
- Cuisine type filtering
- Search by recipe title or ingredients
- Favorites-only view toggle
- Reset all filters button

#### 3. **Favorites System**
- Toggle favorite status on any recipe
- Heart icon button in recipe detail
- Persistent storage across sessions
- Favorites filter to show only saved recipes

#### 4. **5-Star Rating System**
- Rate recipes 1-5 stars
- Visual star display
- Per-user rating storage
- Rating persistence in localStorage

#### 5. **Personal Notes Editor**
- Add custom notes to any recipe
- Modal editor interface
- Save/load notes per recipe
- Edit button for quick access

#### 6. **PDF Export**
- Download formatted recipe as PDF
- Includes title, ingredients, instructions
- Uses html2pdf.js library
- One-click download with timestamp

#### 7. **JSON Backup & Restore**
- Download all recipes as JSON file
- Includes all settings, ratings, favorites, notes
- Restore from backup file
- File validation before import

#### 8. **Countdown Timer**
- Per-step cooking timer
- Hover on any instruction to activate
- Prompt for minutes input
- Modal display with countdown
- Audio alert on completion
- Close button to dismiss

#### 9. **Additional Features**
- Cooking Mode (full-screen, large text)
- Ingredient/step checklist with 12-hour auto-reset
- Recipe sharing via URL
- Measurement system toggle (Metric/Imperial)
- Language selection
- Google Translate integration
- AI pairing suggestions (experimental)

### Phase 2: Cloud Features (Ready for Configuration ⚠️)
Phase 2 infrastructure is implemented but requires Firebase configuration.

#### 1. **Google Authentication**
- Sign in with Google account
- OAuth 2.0 secure flow
- User profile auto-population

#### 2. **User Profile Cloud Sync**
- Save profile to Firestore
- Sync across devices
- Public profile option
- Profile picture storage

#### 3. **Recipe Publishing**
- Publish recipes to database
- Makes recipes discoverable
- Author attribution
- Publish timestamp tracking
- View counter
- Like system (infrastructure ready)

#### 4. **Published Recipes Discovery**
- Load published recipes from community
- Sort by recent
- Limit 50 recipes per load
- Read-only access (unless you're author)

#### 5. **Cloud Account Management**
- Sign out functionality
- Session persistence
- Account-linked data

## Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** (via Tailwind CSS) - Styling framework
- **JavaScript ES6+** - Application logic
- **CDN Dependencies**:
  - Tailwind CSS v4
  - Lucide Icons (latest)
  - html2pdf.js v0.10.1
  - Google Translate Widget
  - Firebase SDK v10.7.0 (Phase 2)
  - Google Sign-In SDK (Phase 2)

### Backend (Phase 2)
- **Firebase Authentication** - Google Sign-In
- **Cloud Firestore** - NoSQL database
- **Google Cloud** - Infrastructure

### Storage
- **localStorage API** - Persistent local storage
  - `recipeArchiveSettings` - User settings, favorites, ratings
  - `recipeArchiveData` - Recipe collection

## File Structure
```
Uculi App/
├── index.html              # Main application file
├── PHASE_2_SETUP.md       # Firebase configuration guide
└── README.md              # This file
```

## Installation & Usage

### Phase 1: No Installation Required
1. Open `index.html` in any modern web browser
2. App works immediately with sample recipe
3. All data stored locally in browser

### Phase 2: Firebase Setup Required
See **PHASE_2_SETUP.md** for complete instructions:
1. Create Firebase project
2. Configure Google Authentication
3. Set up Firestore Database
4. Update Firebase credentials in `index.html`
5. Enable Google Sign-In UI

## Getting Started

### First Time Use
1. Open `index.html` in browser
2. You'll see sample recipe "Forester's Mushroom Stew"
3. Create new recipe: Click "New Recipe" button
4. Fill in recipe details (title, ingredients, instructions)
5. Add timing, categorization, cuisine info
6. Click "Save Recipe"

### Using Features

**Add Recipe:**
- Click "New Recipe" (desktop) or add button (mobile)
- Fill form with ingredients, instructions
- Optional: Use AI Magic Generator for name/description
- Set timing, difficulty, cuisine, diet options
- Save

**Manage Recipes:**
- Search by name or ingredients
- Filter by difficulty, diet, cuisine
- View detailed recipe with instructions
- Add personal notes
- Mark ingredients as done
- Use cooking timer
- Rate recipe
- Add to favorites
- Export as PDF
- Share recipe link

**Settings:**
- Edit profile name, bio, country
- Upload profile picture
- Change measurement system
- Select language
- Backup recipes as JSON
- Restore from JSON backup
- Sign in with Google (Phase 2)
- Publish recipes (Phase 2)

## Data Format

### Recipe Object
```javascript
{
  id: 1,
  title: "Recipe Name",
  author: "Author Name",
  category: "Main Course",
  country: "🇳🇱 Netherlands",
  profile: "base64_image_data",
  prepTime: 15,           // minutes
  cookTime: 40,           // minutes
  servings: 4,
  difficulty: "Easy",     // Easy, Medium, Hard
  diet: ["Vegan"],        // array of diet options
  cuisine: "European",
  ingredients: ["item1", "item2"],
  instructions: ["step1", "step2"],
  tips: "Optional tips",
  personalNotes: "User's notes",
  lastOpened: 1234567890,
  checkedIngredients: [0, 2],  // indices of checked items
  checkedSteps: [0],           // indices of checked steps
}
```

### User Settings Object
```javascript
{
  name: "User Name",
  country: "🇳🇱 Netherlands",
  bio: "Bio text",
  isPublic: false,
  profilePic: "base64_image_data",
  bannerPic: "base64_image_data",
  measurementSystem: "metric",  // or "imperial"
  language: "en",
  favorites: [1, 3, 5],  // recipe IDs
  myRecipeRatings: {
    1: 5,
    2: 4,
    3: 5
  }
}
```

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 15+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Notes
- Single-page application (instant navigation)
- localStorage limits: ~5-10MB per domain
- Suitable for 500-1000 recipes
- For larger volumes, use Phase 2 (Firestore)

## Privacy & Security

### Local Storage (Phase 1)
- All data stored locally in browser
- No data sent to servers
- Private unless explicitly shared
- Accessible only by this app

### Cloud Storage (Phase 2)
- Secured by Firebase authentication
- User can only modify own data
- Published recipes are public (by choice)
- HTTPS encryption in transit
- Google account required

## Troubleshooting

### Issue: Data not persisting
**Solution:** Check browser settings:
- Privacy mode disables localStorage
- Check if cookies are allowed
- Try in normal (non-private) browsing

### Issue: Large images slow down app
**Solution:**
- Resize images before upload (under 100KB)
- Use compressed formats (JPG, WebP)

### Issue: Firebase functions not working (Phase 2)
**Solution:**
- Check Firebase credentials configured
- Verify Google Sign-In enabled in Firebase
- Check browser console for errors
- See PHASE_2_SETUP.md

### Issue: Import fails
**Solution:**
- Verify JSON file from same app version
- Check file not corrupted
- Try exporting/importing single recipe first

## Limitations

### Phase 1 Limitations
- Data limited to device storage
- No cross-device sync
- No cloud backup
- Limited to ~1000 recipes
- No offline-first sync

### Phase 2 Limitations (if not configured)
- Publishing unavailable unless configured
- No cloud sync
- No public profile sharing
- No recipe discovery feed

## Future Enhancements

### Planned Features
- [ ] Recipe collections/categories
- [ ] Shopping list generator
- [ ] Meal planning calendar
- [ ] Social features (comments, reviews)
- [ ] Advanced search/filters
- [ ] Recipe recommendations
- [ ] Photo recipe parsing (OCR)
- [ ] Nutritional information
- [ ] Recipe scaling calculator
- [ ] Theme customization

### Architecture for Scale
Move from localStorage to:
- Progressive Web App (PWA) with service workers
- IndexedDB for larger offline storage
- Backend API for advanced features
- Caching strategy optimization

## Credits & Attribution

### Technologies Used
- Tailwind CSS - Utility-first CSS framework
- Lucide Icons - Beautiful icon library
- html2pdf.js - Client-side PDF generation
- Firebase - Backend-as-a-Service
- Google Cloud Platform - Infrastructure

### Fonts
- Cormorant Garamond - Display font
- Nunito - Body font

### Design Inspiration
- Recipe management best practices
- Modern cooking app UI patterns
- Accessibility guidelines (WCAG)

## License
This project is provided as-is for personal use.

## Support & Feedback

### Reporting Issues
Document:
- Steps to reproduce
- Browser and OS
- Expected vs actual behavior
- Console errors (F12 → Console)

### Feature Requests
Describe:
- Use case
- Expected behavior
- Mockup or reference
- Priority level

## Version History

### v1.0 (Phase 1 Complete)
- All Phase 1 features implemented
- Filter UI bug fixed
- 9/9 core features working
- Zero syntax errors
- Production ready for local use

### v1.1 (Phase 2 Implemented)
- Firebase integration added
- Google Auth infrastructure ready
- Cloud publishing infrastructure
- Setup documentation provided
- Awaiting Firebase configuration

---

**Last Updated:** Phase 2 Implementation
**Status:** Production Ready (Phase 1) + Cloud Ready (Phase 2)
**Next Step:** Configure Firebase credentials for Phase 2 features
