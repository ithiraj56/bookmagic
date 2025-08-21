export type Template = {
  id: string;
  name: string;
  size: string;
  font: string;
  description: string;
  previewUrl: string;
};

export const templates: Template[] = [
  {
    id: "serif-classic",
    name: "Serif Classic",
    size: "6\" × 9\"",
    font: "EB Garamond",
    description: "Timeless style with literary charm.",
    previewUrl: "/previews/serif-classic.png",
  },
  {
    id: "trade-clean",
    name: "Trade Clean",
    size: "5.5\" × 8.5\"",
    font: "Lora",
    description: "Modern, clean look for nonfiction.",
    previewUrl: "/previews/trade-clean.png",
  },
  {
    id: "novella-a5",
    name: "Novella A5",
    size: "A5",
    font: "Source Serif",
    description: "Compact size, great for novellas.",
    previewUrl: "/previews/novella-a5.png",
  },
];

// Helper function to get a template by ID
export function getTemplateById(id: string): Template | undefined {
  return templates.find(template => template.id === id);
}

// Helper function to get all templates
export function getAllTemplates(): Template[] {
  return templates;
} 