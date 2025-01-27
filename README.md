Here are the steps to add an extension to your browser, specifically for a **Chrome extension** in **developer mode**:

---

### **Steps to Add an Extension to Your Browser:**

#### 1. **Prepare the Extension Files**
   - Ensure your extension files (e.g., `manifest.json`, `popup.html`, `popup.js`, etc.) are ready and stored in a folder on your computer.
   - Double-check that the `manifest.json` file is correctly configured, as this file is the core of the extension.

#### 2. **Open Chrome and Access Extensions Page**
   - Open your **Chrome browser**.
   - In the top-right corner, click on the three dots (menu icon) → go to **More Tools** → **Extensions**.
     OR
   - Directly navigate to `chrome://extensions/` in your address bar.

#### 3. **Enable Developer Mode**
   - At the top-right of the **Extensions** page, toggle the **Developer mode** switch to enable it. This allows you to load custom extensions.

#### 4. **Load Unpacked Extension**
   - Click on the **"Load unpacked"** button.
   - A file picker dialog will appear. Navigate to the folder where your extension files are stored.
   - Select the folder and click **Open** (or **Select Folder**).

#### 5. **Verify the Extension**
   - If everything is set up correctly, your extension should appear in the list of extensions with its name, icon, and description.
   - If there are errors, check the error message displayed on the extension card and debug accordingly.

#### 6. **Pin the Extension (Optional)**
   - Click on the **puzzle icon** (Extensions menu) in the top-right corner of the browser.
   - Find your extension in the list and click the **pin icon** next to it to make it visible in the browser toolbar.

---

### **Test Your Extension**
   - Click on the extension icon (if it has a popup) or perform any actions your extension is supposed to handle.
   - Debug using the **Chrome Developer Tools** (right-click → Inspect or `Ctrl+Shift+I`) to view the console output or troubleshoot issues.

---

### **Keep in Mind**
   - If you make changes to your extension's code, you will need to return to the Extensions page and click **Reload** (circular arrow) on your extension's card.
   - The extension will only work in the browser where it's loaded unless published to the Chrome Web Store.

