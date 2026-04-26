# Le Fou du Métro 🚇

An interactive quiz about the rail transport network in Île-de-France (Paris).

> [!NOTE]
> The game interface and station names are in French.

## Getting Started

```bash
git clone https://github.com/ethanbandasack/fou-du-metro.git

cd fou-du-metro

npm install

npm run dev
```

## About the Game

Test your knowledge of the Parisian transport network (Metro, RER, Train, Tramway) through various game modes, including a classic quiz and an advanced "Intersection" mode to master the network.

> [!IMPORTANT]
> **Data Quality**: The `stations-enriched.csv` file is currently undergoing a manual checking process. While most data is accurate, some entries may still need verification. Users are encouraged to contribute to this process or modify the data as needed.

## Font Installation

To achieve the "full experience" and match the official RATP signage aesthetics, you can manually add the **Parisine** font to the project.

> [!WARNING]
> **Intellectual Property**: Parisine is a proprietary font and the property of RATP. It is **not included** in this repository. Users must ensure they have the right to use it. If the font is not detected, the application will automatically fall back to standard system fonts (Arial/Helvetica).

To install:
1. Place your Parisine font files in `fou-du-metro/fonts/Parisine/`.
2. Ensure the paths match those expected in `src/app/layout.tsx`.