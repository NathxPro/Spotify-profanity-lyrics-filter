# Spicetify Lyrics Filter

A Spicetify extension that automatically detects and blurs profanity in Spotify's lyrics view. Works with both standard Spotify lyrics and **Spicy Lyrics** along with **Spicy Lyrics fullscreen mode**.

---

## Features

- 🔍 Automatically detects and blurs swear words in lyrics as they load
- 🎛️ Adjustable blur intensity via a settings panel (click the icon in the top bar)
- 👆 Click any blurred word to reveal it
- 💾 Settings saved across restarts
- ✅ Works with **standard Spotify lyrics**
- ✅ Works with **Spicy Lyrics** and its fullscreen mode
- ✅ Case-insensitive — catches "Fuck", "FUCK", "fuck" equally

---

## Installation

**Prerequisites:** [Spicetify](https://spicetify.app/) must be installed.

1. Download `lyrics-filter.js`
2. Find your Spicetify extensions folder:

   Then navigate to the `Extensions` subfolder inside that directory.

3. Drop `lyrics-filter.js` into that folder

4. Run:
   ```
   spicetify config extensions lyrics-filter.js
   spicetify apply
   ```

5. Spotify will restart with the extension active ✓

---

## Usage

- Lyrics are filtered **automatically** whenever you open the lyrics view or Spicy Lyrics fullscreen
- A mute icon (🔇) appears in the **right side** — click it to open the settings panel
- In the settings panel, drag the **blur intensity slider** to adjust how strong the blur is, with a live preview
- Click any **blurred word** to toggle it revealed/hidden


---

## Compatibility

| Feature | Supported |
|---|---|
| Standard Spotify Lyrics | ✅ |
| Spicy Lyrics (fullscreen) | ✅ |
| Spicy Lyrics (sidebar) | ✅ |
| Free Spotify accounts | ✅ |
| Windows / Mac / Linux | ✅ |

---

## Uninstalling

```
spicetify config extensions lyrics-filter.js-
spicetify apply
```

---

## Contributing

Found a word that isn't being caught, or want to add support for another lyrics extension? Feel free to open an issue or pull request!
