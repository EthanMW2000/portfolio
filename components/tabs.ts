export interface Tab {
  icon: string;
  label: string;
}

export const allTabs = [
    {
      label: "Games",
      icon: "🎮",
      list : [
        {
          label: "League of Legends",
          icon: "/league-of-legends.svg",
        },
        {
          label: "Apex Legends",
          icon: "/apex-legends.svg",
        },
        {
          label: "CS:GO",
          icon: "/csgo.svg",
        },
      ]
    },
    {
      label: "Anime",
      icon: "📺",
      list : [
        {
          label: "Haikyuu",
          icon: "/haikyuu-logo.png",
        },
        {
          label: "One Piece",
          icon: "/one-piece.png",
        },
        {
          label: "Fullmetal Alchemist: Brotherhood",
          icon: "/fullmetal-alchemist.webp",
        },
      ] 
    },
  ];

const [games, anime] = allTabs;
export const initialTabs = [games, anime];

