# S2

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

S2 (SVG 2D) is a lightweight TypeScript library designed for creating **interactive SVG figures**, primarily for teaching Mathematics and algorithmics.

> [!IMPORTANT]
> This project is still under active development and should **not be considered stable**. No official release is planned yet, but a first release is expected around **mid-2026**.

---

## Features

- **Lightweight**: minimal dependencies; the only external library is [anime.js](https://animejs.com/) for animations.
- **Inspired by**: [Manim](https://www.manim.community/), TikZ, and 2D game development techniques.
- **Direct SVG DOM API**: works directly with the browser's SVG API for full flexibility.
- **Virtual world abstraction**: introduces a **camera** concept, allowing you to separate object positions in a virtual world from their actual positions in the generated SVG.
- **Animations**: implemented as an overlay using anime.js.

---

## Live Demo

A demonstration of the generated site is available at: [https://arnaudbannier.github.io/s2/](https://arnaudbannier.github.io/s2/).

---

## Installation

Make sure you have Node.js installed on your system. Then, navigate to the `s2` directory and run:

```bash
npm install
```

---

## Development

To develop locally, use:

```bash
npm run dev
```

To build the site for deployment, use:

```bash
npm run build
```

---

## License

This project is licensed under the MIT License.
