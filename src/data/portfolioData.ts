import developerAvatarPortrait from '../assets/images/developer_male_avatar_1794633866852.jpg';
import projectDreamJobImg from '../assets/images/project_dream_job_1794633494485.jpg';
import projectMyYoutubeImg from '../assets/images/project_my_youtube_1794633495004.jpg';
import hobbyCodingSetupImg from '../assets/images/hobby_coding_setup_1794633495483.jpg';

export interface ProjectItem {
  id: string;
  title: string;
  originalSlug: string;
  category: string;
  description: string;
  highlights: string[];
  icon: 'briefcase' | 'youtube';
  previewImage: string;
  accentColor: string;
}

export interface GoalItem {
  number: string;
  title: string;
  description: string;
  details: string[];
  icon: 'globe' | 'sparkles' | 'target';
}

export const PROFILE_DATA = {
  name: 'Өлзийтогтох',
  latinName: 'Ulziitogtokh',
  age: 16,
  role: 'Вэб хөгжүүлэгч сурагч',
  summary:
    '16 настай, орчин үеийн вэб технологиуд, интерфэйс дизайн болон алгоритм сонирхон суралцаж буй залуу хөгжүүлэгч.',
  avatarImage: developerAvatarPortrait,
  heroPreviewImage: hobbyCodingSetupImg,
};

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 'dream-job',
    title: 'Мөрөөдлийн ажил',
    originalSlug: 'dream-job.html',
    category: 'Мэргэжил ба ирээдүй',
    description:
      'Өөрийн ирээдүйд эзэмшихийг хүсэж буй технологийн мэргэжил, давуу талууд болон зорилгын тухай интерактив танилцуулга вэб хуудас.',
    highlights: ['Мэргэжлийн танилцуулга', 'Ирээдүйн алсын хараа', 'Вэб бүтэц'],
    icon: 'briefcase',
    previewImage: projectDreamJobImg,
    accentColor: '#38bdf8',
  },
  {
    id: 'my-youtube',
    title: 'Миний YouTube',
    originalSlug: 'my-youtube.html',
    category: 'Медиа & Сувгийн хуудас',
    description:
      'Өөрийн дуртай бичлэгүүд, технологийн хичээлүүд болон YouTube видеонуудыг эмхэтгэн байрлуулсан хувийн медиа төсөл.',
    highlights: ['Видео жагсаалт', 'Медиа холбоосууд', 'Цэвэр зохион байгуулалт'],
    icon: 'youtube',
    previewImage: projectMyYoutubeImg,
    accentColor: '#f43f5e',
  },
];

export const GOALS_DATA: GoalItem[] = [
  {
    number: '01',
    title: 'Вэб сайт хийж сурах',
    description:
      'Вэб хөгжүүлэлтийн үндэс болох бүтэц, орчин үеийн загварчлал, дасан зохицох UI болон динамик харилцан үйлчлэлийг бие даан төгс эзэмших.',
    details: [
      'HTML5 ба Семантик бүтэц',
      'Орчин үеийн CSS ба хариу үйлдэлтэй зохион байгуулалт',
      'JavaScript интерактив логик',
    ],
    icon: 'globe',
  },
  {
    number: '02',
    title: 'AI-д зөв даалгавар өгөх',
    description:
      'Хиймэл оюун ухааны загваруудад үнэн зөв, тодорхой хүрээтэй prompt боловсруулж, код болон санаагаа илүү хурдан чанартай бодит болгох аргад суралцах.',
    details: [
      'Оновчтой үүрэг, контекст өгөх',
      'Кодын алдаа засах, код сайжруулах удирдамж',
      'Хиймэл оюуныг бүтээлч туслах болгон ашиглах',
    ],
    icon: 'sparkles',
  },
  {
    number: '03',
    title: 'Бие даасан төслүүд бүтээх',
    description:
      '16 насандаа олон төрлийн бүтээл хийж, өөрийн портфолиог баяжуулан ирээдүйн программ хангамжийн мэргэжилдээ бат бөх суурь бэлтгэх.',
    details: [
      'Хэрэглэгчдэд ээлтэй хөнгөн сайтууд',
      'Тоглоом ба бүтээлч медиа хуудсууд',
      'Байнгын суралцах тасралтгүй өсөлт',
    ],
    icon: 'target',
  },
];
