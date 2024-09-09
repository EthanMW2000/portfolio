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
          label: "Resident Evil 4",
          icon: "/re4.png",
        },
        {
          label: "College Football 25",
          icon: "/CFB-logo.png",
        },
        {
          label: "Counter Strike 2",
          icon: "/cs2.png",
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
          label: "Fullmetal Alchemist",
          icon: "/fullmetal-alchemist.webp",
        },
      ] 
    },
  ];

const [games, anime] = allTabs;
export const initialTabs = [games, anime];

