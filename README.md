# Canvas

Canvas is a modern, high-performance visual workspace and creative suite designed with Apple Human Interface Guidelines aesthetics, Liquid Glass (`backdrop-filter`) design, automatic dark mode support, and real-time synchronization between the desktop application and the web client.

---

## 🚀 Core Features & Architecture

### 1. Visual Infinite Canvas (`infinite-canvas.tsx`)
- **Moodboarding & Flowcharts:** Build spatial workspaces using React Flow v12.
- **Interactive Nodes:** Create, drag, connect, and customize sticky notes (with color picker), images, and web links.
- **Canvas Snapshots:** Capture and restore workspace states instantly.

### 2. Rich Text Documents (`document-sidebar.tsx`, `rich-text-editor.tsx`)
- **Tiptap Editor:** Fully featured rich text editing with headings, lists, tables, blockquotes, and inline code formatting.
- **File Management:** Create, rename, edit, and delete multiple text documents per project.

### 3. Double Diamond Methodology (`double-diamond.tsx`)
- **Design Thinking Framework:** Structured phases for **Discover**, **Define**, **Develop**, and **Deliver**.
- **Task Checklists:** Track progress with actionable tasks and notes for each phase.

### 4. Prototype Viewer (`prototype-viewer.tsx`)
- **Multi-Asset Preview:** Embed and preview website URLs, 3D models (`.gltf`, `.glb`, `.obj`), and high-res prototype images.

### 5. Screenplay Studio (`screenplay-editor.tsx`)
- **Fountain Syntax Engine:** Minimalist dual-pane editor that automatically recognizes and formats screenplays in real-time.
- **Standard Formatting:** Automatically styles Scene Headings (`INT./EXT.`), Character Cues, Parentheticals, Dialogue, and Action lines according to industry standards.
- **Export:** Instant export to `.fountain` files.

### 6. CAD & Technical Drawings (`cad-viewer.tsx`)
- **2D / CAD Viewer:** Upload and visualize architectural plans, technical drawings (`.dxf`, `.dwg`, `.pdf`), and images.
- **Manipulation Tools:** Zoom, pan, inspect metadata, rename drawings, and save/download files.

### 7. Real-Time Sync & Web Server (`sync-service.ts`)
- **Local & Remote Access:** Built-in secure HTTP/HTTPS server (`port 7531`) serving the exact app interface in any browser.
- **Multi-Device Presence:** Live online user tracking, change activity logging (`change-log.tsx`), and sub-second auto-save synchronization (`use-auto-save.ts`).

### 8. Apple Liquid Glass & iOS 27 UI
- **Design System:** Custom CSS (`styles.css`) featuring Apple system typography (`SF Pro`), translucent frosted glass surfaces, spring physics animations (`cubic-bezier`), and sliding segmented control navigation.
- **Accessibility:** Explicit `aria-label` attributes and spring-animated hover tooltips on all controls.

---

## 🛠️ Getting Started & Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/RodyKlayn/canvas-app.git
   cd canvas-app
   ```

2. **Install dependencies & run:**
   ```bash
   cd sources
   npm install
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```
