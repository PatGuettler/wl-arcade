//unicorn room images
import sparkleRoomBg from "../components/assets/sparkleRoom.png";
import rainbowRoom from "../components/assets/rainbowRoom.png";
import starRoom from "../components/assets/starRoom.png";
import cloudRoom from "../components/assets/cloudRoom.png";
import dreamRoom from "../components/assets/dreamRoom.png";
import mysticRoom from "../components/assets/mysticRoom.png";

//unicorn images
import sparkleImg from "../components/assets/sparkle.png";
import rainbowImg from "../components/assets/rainbow.png";
import starImg from "../components/assets/star.png";
import cloudImg from "../components/assets/cloud.png";
import dreamImg from "../components/assets/dreamer.png";
import mysticImg from "../components/assets/mystic.png";

const DB_KEY = "wl_arcade_x.x.x";

export const UNICORNS = [
  {
    id: "sparkle",
    name: "Sparkle",
    price: 0,
    desc: "The classic pink companion.",
    style: "bg-pink-950",
    bgImage: sparkleRoomBg,
    image: sparkleImg,
    accent: "text-pink-400",
  },
  {
    id: "rainbow",
    name: "Rainbow",
    price: 500,
    desc: "Leaves a trail of colors.",
    style: "bg-slate-900",
    image: rainbowImg,
    bgImage: rainbowRoom,
    accent: "text-cyan-400",
  },
  {
    id: "star",
    name: "Star",
    price: 1200,
    desc: "Shines brighter than the sun.",
    style: "bg-indigo-950",
    image: starImg,
    bgImage: starRoom,
    accent: "text-yellow-400",
  },
  {
    id: "cloud",
    name: "Cloud",
    price: 2500,
    desc: "Float above the competition.",
    style: "bg-sky-950",
    image: cloudImg,
    bgImage: cloudRoom,
    accent: "text-sky-300",
  },
  {
    id: "dream",
    name: "Dreamer",
    price: 5000,
    desc: "Straight out of a fantasy.",
    style: "bg-purple-950",
    image: dreamImg,
    bgImage: dreamRoom,
    accent: "text-purple-400",
  },
  {
    id: "mystic",
    name: "Mystic",
    price: 10000,
    desc: "Pure magical energy.",
    style: "bg-emerald-950",
    image: mysticImg,
    bgImage: mysticRoom,
    accent: "text-emerald-400",
    scale: 1.6,
  },
];

export const FURNITURE = [
  { id: "lamp", name: "Lava Lamp", price: 150, icon: "💡" },
  { id: "rug", name: "Fluffy Rug", price: 300, icon: "🧶" },
  { id: "plant", name: "Magic Plant", price: 500, icon: "🪴" },
  { id: "chair", name: "Gaming Chair", price: 1200, icon: "💺" },
  { id: "arcade", name: "Mini Arcade", price: 2500, icon: "🕹️" },
  { id: "trophy", name: "Gold Trophy", price: 5000, icon: "🏆" },
  { id: "bed_single", name: "Single Bed", price: 800, icon: "🛏️" },
  { id: "bed_king", name: "King Size Bed", price: 2500, icon: "🏨" },
  { id: "bed_race", name: "Race Car Bed", price: 3200, icon: "🏎️" },
  { id: "bed_cloud", name: "Cloud Bed", price: 4500, icon: "☁️" },
  { id: "bed_bunk", name: "Bunk Bed", price: 1500, icon: "🪜" },
  { id: "bed_coffin", name: "Vampire Bed", price: 666, icon: "⚰️" },
  { id: "table_coffee", name: "Coffee Table", price: 450, icon: "☕" },
  { id: "table_dining", name: "Dining Table", price: 1100, icon: "🍽️" },
  { id: "desk_office", name: "Office Desk", price: 900, icon: "🖥️" },
  { id: "table_night", name: "Nightstand", price: 250, icon: "🌃" },
  { id: "table_pool", name: "Pool Table", price: 3500, icon: "🎱" },
  { id: "lamp_floor", name: "Floor Lamp", price: 350, icon: "🛋️" },
  { id: "lamp_desk", name: "Desk Lamp", price: 120, icon: "🔦" },
  { id: "chandelier", name: "Chandelier", price: 5000, icon: "💎" },
  { id: "candle", name: "Candle", price: 50, icon: "🕯️" },
  { id: "lantern", name: "Paper Lantern", price: 200, icon: "🏮" },
  { id: "disco", name: "Disco Ball", price: 1800, icon: "🕺" },
  { id: "flashlight", name: "Flashlight", price: 80, icon: "🔦" },
  { id: "rug_welcome", name: "Welcome Mat", price: 100, icon: "🚪" },
  { id: "rug_persian", name: "Persian Rug", price: 1500, icon: "📜" },
  { id: "rug_bear", name: "Faux Bear Rug", price: 2200, icon: "🐻" },
  { id: "rug_magic", name: "Magic Carpet", price: 8000, icon: "🧞" },
  { id: "rug_puzzle", name: "Puzzle Mat", price: 400, icon: "🧩" },
  { id: "pet_cat_blk", name: "Black Cat", price: 2000, icon: "🐈‍⬛" },
  { id: "pet_cat_org", name: "Tabby Cat", price: 2000, icon: "🐈" },
  { id: "pet_dog_dog", name: "Good Boy", price: 2200, icon: "🐕" },
  { id: "pet_dog_pud", name: "Poodle", price: 2500, icon: "🐩" },
  { id: "pet_dog_ser", name: "Service Dog", price: 2500, icon: "🦮" },
  { id: "pet_paw", name: "Paw Prints", price: 300, icon: "🐾" },
  { id: "pet_fish", name: "Goldfish", price: 500, icon: "🐠" },
  { id: "pet_hamster", name: "Hamster", price: 600, icon: "🐹" },
  { id: "pet_mouse", name: "Mouse", price: 400, icon: "🐁" },
  { id: "pet_chick", name: "Baby Chick", price: 350, icon: "🐤" },
  { id: "pet_frog", name: "Tree Frog", price: 700, icon: "🐸" },
  { id: "pet_turtle", name: "Turtle", price: 800, icon: "🐢" },
  { id: "pet_dragon", name: "Tiny Dragon", price: 9999, icon: "🐉" },
  { id: "toy_bear", name: "Teddy Bear", price: 250, icon: "🧸" },
  { id: "toy_robot", name: "Robot", price: 550, icon: "🤖" },
  { id: "toy_doll", name: "Doll", price: 300, icon: "🎎" },
  { id: "toy_kite", name: "Kite", price: 150, icon: "🪁" },
  { id: "toy_yoyo", name: "Yo-Yo", price: 80, icon: "🪀" },
  { id: "toy_train", name: "Train Set", price: 900, icon: "🚂" },
  { id: "toy_blocks", name: "Building Blocks", price: 200, icon: "🧱" },
  { id: "toy_ball", name: "Soccer Ball", price: 180, icon: "⚽" },
  { id: "tv_retro", name: "Retro TV", price: 800, icon: "📺" },
  { id: "tv_flat", name: "Wall TV", price: 2200, icon: "🖥️" },
  { id: "pc_gamer", name: "Gamer PC", price: 3500, icon: "⌨️" },
  { id: "console", name: "Game Console", price: 1200, icon: "🎮" },
  { id: "radio", name: "Radio", price: 400, icon: "📻" },
  { id: "phone_retro", name: "Rotary Phone", price: 600, icon: "☎️" },
  { id: "camera", name: "Camera", price: 900, icon: "📸" },
  { id: "xmas_tree", name: "Xmas Tree", price: 1500, icon: "🎄" },
  { id: "xmas_santa", name: "Santa Claus", price: 800, icon: "🎅" },
  { id: "xmas_sock", name: "Stocking", price: 150, icon: "🧦" },
  { id: "xmas_gift", name: "Gift Box", price: 250, icon: "🎁" },
  { id: "xmas_bell", name: "Jingle Bell", price: 100, icon: "🔔" },
  { id: "xmas_deer", name: "Reindeer", price: 1200, icon: "🦌" },
  { id: "xmas_snow", name: "Snowman", price: 600, icon: "☃️" },
  { id: "xmas_flake", name: "Snowflake", price: 200, icon: "❄️" },
  { id: "hall_pump", name: "Pumpkin", price: 300, icon: "🎃" },
  { id: "hall_ghost", name: "Ghost", price: 400, icon: "👻" },
  { id: "hall_skull", name: "Skull", price: 250, icon: "💀" },
  { id: "hall_web", name: "Spider Web", price: 150, icon: "🕸️" },
  { id: "hall_spider", name: "Giant Spider", price: 450, icon: "🕷️" },
  { id: "hall_bat", name: "Bat", price: 200, icon: "🦇" },
  { id: "hall_alien", name: "Alien", price: 1000, icon: "👽" },
  { id: "hall_mask", name: "Goblin Mask", price: 350, icon: "👺" },
];

export const getDB = () => {
  const stored = localStorage.getItem(DB_KEY);
  if (!stored) return { users: {}, lastUser: "" };
  return JSON.parse(stored);
};

export const saveDB = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// export const getBestTimes = (timesArray) => {
//   const bests = {};
//   if (!timesArray) return bests;
//   timesArray.forEach((entry) => {
//     if (!bests[entry.level] || entry.time < bests[entry.level]) {
//       bests[entry.level] = entry.time;
//     }
//   });
//   return bests;
// };
