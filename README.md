# Text Highlighter Chrome Extension

A powerful Chrome extension that highlights specified text on web pages with customizable styles and real-time notifications.

## Features

- **Flexible Text Matching**
  - Exact text matching
  - Regular expression support
  - Case-insensitive search
  - Multiple highlight rules

- **Customizable Highlight Styles**
  - Background color
  - Text color
  - Font size (Small, Default, Large, Extra Large)
  - Font weight (Normal, Bold, Bolder)
  - Padding spacing (None, Small 2px, Medium 4px, Large 8px, Extra Large 12px)
  - Border options:
    - Underline (Single)
    - Underline (Double)
    - Underline (Wavy)
    - Underline (Dashed)
    - Full Border

- **Advanced Features**
  - **Real-time Updates**: Changes apply immediately without page reload
  - **Persistent Storage**: Settings survive browser restarts
  - **Smart Notifications**: Optional toast notifications when matches are found
  - **Export/Import**: Backup and share your highlight rules
  - **Dynamic Content Support**: Automatically highlights new content as it loads

## Installation

### From Source (Developer Mode)

1. **Download or Clone the Repository**
   ```bash
   git clone https://github.com/okdtsk/chrome-extension-text-highlighter.git
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
   - Select the extension directory
   - The extension should now appear in your extensions list

5. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in the Chrome toolbar
   - Click the pin icon next to "Text Highlighter"

## Usage

### Basic Usage

1. **Open the Extension**
   - Click the Text Highlighter icon in the Chrome toolbar

2. **Add New Highlight Rule**
   - Click "+ Add New Text" button
   - Enter the text you want to highlight
   - Optionally check "Use Regular Expression" for pattern matching

3. **Customize Highlight Style**
   - **Background Color**: Choose the highlight background color
   - **Text Color**: Choose the text color
   - **Font Size**: Select from predefined sizes or keep default
   - **Font Weight**: Make text normal, bold, or bolder
   - **Padding**: Select spacing inside highlighted text
   - **Border**: Choose from various underline styles or full border

4. **Save and Apply**
   - Click "Save" to apply the rule
   - Highlights appear immediately on all open tabs

### Managing Rules

- **Edit**: Click the pencil icon to modify an existing rule
- **Delete**: Click the trash icon to remove a rule
- **Multiple Rules**: Add as many rules as needed, each with different styles

### Import/Export Settings

- **Export**: Click "Export Settings" to download your rules as a JSON file
- **Import**: Click "Import Settings" to load rules from a JSON file
- Perfect for backing up or sharing configurations

### Notifications

- Toggle "Show notifications when matches are found" to enable/disable
- Notifications appear when opening pages with matching text
- Shows match count and number of rules that matched
- Auto-dismisses after 6 seconds

## Examples

### Simple Text Highlight
```
Target Text: important
Background Color: Yellow (#ffff00)
```
Highlights all occurrences of "important" with yellow background

### Regular Expression
```
Target Text: \b(TODO|FIXME|NOTE)\b
Use Regular Expression: ✓
Background Color: Red (#ff0000)
Text Color: White (#ffffff)
```
Highlights all TODO, FIXME, and NOTE annotations

### Email Addresses
```
Target Text: \b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b
Use Regular Expression: ✓
Background Color: Light Blue (#e3f2fd)
Border: Underline (Single) Blue (#2196f3)
```
Highlights all email addresses with blue underline

### Phone Numbers
```
Target Text: \b\d{3}[-.]?\d{3}[-.]?\d{4}\b
Use Regular Expression: ✓
Background Color: Light Green (#e8f5e9)
Padding: Medium (4px)
```
Highlights phone numbers in format XXX-XXX-XXXX

## File Structure

```
chrome-extension-text-highlighter/
├── manifest.json       # Extension configuration
├── popup.html         # Settings interface HTML
├── popup.css          # Settings interface styles
├── popup.js           # Settings interface logic
├── content.js         # Text highlighting script
├── background.js      # Extension background service
├── icon16.png         # Extension icon (16x16)
├── icon48.png         # Extension icon (48x48)
├── icon128.png        # Extension icon (128x128)
├── CLAUDE.md          # Development instructions
└── README.md          # This file
```

## Permissions

The extension requires the following permissions:
- `storage`: To save your highlight settings
- `activeTab`: To apply highlights to the current tab
- `scripting`: To inject highlighting script dynamically
- `tabs`: To update highlights across all tabs
- `<all_urls>`: To work on all websites

## Troubleshooting

### Highlights not appearing
- Ensure the extension is enabled in Chrome
- Check that the target text exists on the page
- Verify regex syntax if using regular expressions
- Some websites may have CSS that overrides the highlight styles

### Settings not persisting
- The extension now properly maintains settings across browser restarts
- If issues persist, try exporting your settings as backup

### Performance issues
- Complex regular expressions may slow down large pages
- Consider using simpler patterns or exact text matching
- Disable notifications if not needed

### Notifications not showing
- Ensure notifications are enabled in the extension settings
- Some websites may block overlay elements
- Notifications have a 5-second cooldown to prevent spam

## Privacy

This extension:
- Stores settings locally in Chrome's sync storage
- Does not collect or transmit any user data
- Works entirely offline
- Only modifies the visual appearance of web pages

## Recent Updates

- **v1.1**: Fixed settings persistence across browser restarts
- **v1.2**: Increased popup window size for better usability
- **v1.3**: Removed margin setting, improved padding UI with dropdown
- **v1.4**: Added immediate highlight updates without page reload
- **v1.5**: Added notification feature for match detection

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please open an issue on the [GitHub repository](https://github.com/okdtsk/chrome-extension-text-highlighter).