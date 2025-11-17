# Assets Directory

This directory contains the app's visual assets.

## Required Files

For a production version, you would need:

- **icon.png** (1024x1024) - App icon
- **splash.png** (1242x2436) - Splash screen image
- **adaptive-icon.png** (1024x1024) - Android adaptive icon
- **favicon.png** (48x48) - Web favicon

## Temporary Note

For development with Expo Go, these assets are optional. Expo will use default placeholders if they're not provided.

To add these later, you can:
1. Create your images with the specified dimensions
2. Place them in this directory
3. Update app.json if needed

## Creating Assets

You can use tools like:
- Figma
- Adobe Illustrator
- Canva
- Online icon generators

Or generate them using Expo:
```bash
npx expo install expo-asset
```
