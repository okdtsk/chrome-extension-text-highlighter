# Text Highlighter Chrome Extension

A Chrome extension that highlights specified text on web pages with customizable styles.

## Features

- **Flexible Text Matching**
  - Exact text matching
  - Regular expression support
  - Case-insensitive search

- **Customizable Highlight Styles**
  - Background color
  - Text color
  - Font size (Small, Default, Large, Extra Large)
  - Font weight (Normal, Bold, Bolder)
  - Margin spacing
  - Border options (None, Underline, Full Border)

- **Real-time Updates**
  - Changes apply immediately to all open tabs
  - Highlights automatically update when new content loads
  - Settings persist across browser sessions

## Installation

### From Source (Developer Mode)

1. **Download or Clone the Repository**
   ```bash
   git clone https://github.com/okdtsk/text-highlighter.git
   ```
   Or download the ZIP file and extract it.

2. **Open Chrome Extensions Page**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Or go to Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top right corner

4. **Load the Extension**
   - Click "Load unpacked"
   - Select the `text-highlighter` directory
   - The extension should now appear in your extensions list

5. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in the Chrome toolbar
   - Click the pin icon next to "Text Highlighter"

## Usage

1. **Open the Extension**
   - Click the Text Highlighter icon in the Chrome toolbar

2. **Configure Target Text**
   - Enter the text you want to highlight
   - Check "Use Regular Expression" for pattern matching

3. **Customize Highlight Style**
   - **Background Color**: Choose the highlight background color
   - **Text Color**: Choose the text color
   - **Font Size**: Select from predefined sizes or keep default
   - **Font Weight**: Make text normal, bold, or bolder
   - **Margin**: Add spacing around highlighted text (0-20px)
   - **Padding**: Add internal spacing within highlighted text (0-20px)
   - **Border**: Add underline or full border with custom color

4. **Save Settings**
   - Click "Save" to apply changes
   - Changes apply immediately to all open tabs

5. **Reset to Defaults**
   - Click "Reset" to restore default settings

## Examples

### Simple Text Highlight
- Target Text: `important`
- Background Color: Yellow (#ffff00)
- This will highlight all occurrences of "important" with a yellow background

### Regular Expression
- Target Text: `\b(TODO|FIXME)\b`
- Use Regular Expression: ✓
- Background Color: Red (#ff0000)
- This will highlight all TODO and FIXME annotations

### Custom Style
- Target Text: `deadline`
- Background Color: Orange (#ffa500)
- Text Color: White (#ffffff)
- Font Weight: Bold
- Border: Underline with red color
- This creates a prominent highlight for deadline-related text

## File Structure

```
text-highlighter/
├── manifest.json       # Extension configuration
├── popup.html         # Settings interface HTML
├── popup.css          # Settings interface styles
├── popup.js           # Settings interface logic
├── content.js         # Text highlighting script
├── background.js      # Extension background service
├── icon16.png         # Extension icon (16x16)
├── icon48.png         # Extension icon (48x48)
├── icon128.png        # Extension icon (128x128)
└── README.md          # This file
```

## Development

### Requirements
- Chrome browser (version 88 or higher)
- Basic knowledge of HTML/CSS/JavaScript for customization

### Making Changes
1. Edit the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the Text Highlighter extension
4. Test your changes

### Icon Replacement
The current icons are placeholder SVGs. To use proper PNG icons:
1. Create 16x16, 48x48, and 128x128 pixel PNG images
2. Replace the existing icon files
3. Reload the extension

## Permissions

The extension requires the following permissions:
- `storage`: To save your highlight settings
- `activeTab`: To apply highlights to the current tab
- `<all_urls>`: To work on all websites

## Troubleshooting

### Highlights not appearing
- Ensure the extension is enabled in Chrome
- Check that the target text exists on the page
- Verify regex syntax if using regular expressions
- Some websites may have CSS that overrides the highlight styles

### Settings not saving
- Check Chrome's extension permissions
- Ensure you have enough storage space
- Try disabling and re-enabling the extension

### Performance issues
- Complex regular expressions may slow down large pages
- Consider using simpler patterns or exact text matching
- Limit the use of very broad patterns

## Privacy

This extension:
- Stores settings locally in Chrome's sync storage
- Does not collect or transmit any user data
- Works entirely offline
- Only modifies the visual appearance of web pages

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.