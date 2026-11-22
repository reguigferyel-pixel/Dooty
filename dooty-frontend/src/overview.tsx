import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Bell,
  BellRing,
  Bot,
  Camera,
  CalendarDays,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleAlert,
  CircleDot,
  CircleX,
  Clock3,
  FolderKanban,
  FolderPlus,
  Image,
  Languages,
  LayoutDashboard,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Menu,
  MessageSquarePlus,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  TrendingUp,
  Upload,
  UserRound,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from './context/AuthContext';


type Page =
  | "Overview"
  | "Mes tâches"
  | "Calendrier"
  | "Mes projets"
  | "Chatbot"
  | "Notifications"
  | "Statistiques"
  | "Mon profil"
  | "Paramètres";
type TaskStatus = "À faire" | "En cours" | "Terminée";
type Priority = "Basse" | "Moyenne" | "Haute";

type Task = {
  id: number;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  dueDate: string;
  priority: Priority;
  status: TaskStatus;
  emoji: string;
  color: string;
  projectId?: number;
};

type Project = {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  color: string;
  emoji: string;
};

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type Conversation = {
  id: number;
  title: string;
  messages: ChatMessage[];
};

type AppNotification = {
  id: number;
  type: "deadline" | "overdue" | "completed" | "project";
  title: string;
  description: string;
  date: string;
  read: boolean;
};

type Preferences = {
  language: "fr" | "en";
  theme: "light" | "dark";
  background: string;
  customBackground?: string;
  notifications: boolean;
  reminders: boolean;
};

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  createdAt: string;
};

const navItems: { label: Page; icon: LucideIcon }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Mes tâches", icon: CheckCircle2 },
  { label: "Calendrier", icon: CalendarDays },
  { label: "Mes projets", icon: FolderKanban },
  { label: "Chatbot", icon: Bot },
  { label: "Notifications", icon: Bell },
  { label: "Statistiques", icon: TrendingUp },
  { label: "Mon profil", icon: UserRound },
  { label: "Paramètres", icon: Settings },
];

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Finaliser la présentation client",
    description: "Réviser les dernières slides et préparer les notes de présentation.",
    category: "Travail",
    createdAt: "2025-05-19",
    dueDate: "2025-05-27",
    priority: "Haute",
    status: "En cours",
    emoji: "✦",
    color: "#8b5cf6",
    projectId: 1,
  },
  {
    id: 2,
    title: "Appeler le dentiste",
    description: "Prendre rendez-vous pour le contrôle annuel.",
    category: "Personnel",
    createdAt: "2025-05-20",
    dueDate: "2025-05-27",
    priority: "Moyenne",
    status: "À faire",
    emoji: "✿",
    color: "#f472b6",
  },
  {
    id: 3,
    title: "Planifier le sprint de juin",
    description: "Définir les priorités de l'équipe et préparer le backlog.",
    category: "Travail",
    createdAt: "2025-05-18",
    dueDate: "2025-05-29",
    priority: "Haute",
    status: "À faire",
    emoji: "◆",
    color: "#3b82f6",
    projectId: 1,
  },
  {
    id: 4,
    title: "Réserver les billets de train",
    description: "Comparer les horaires pour le week-end à Lyon.",
    category: "Voyage",
    createdAt: "2025-05-16",
    dueDate: "2025-05-30",
    priority: "Moyenne",
    status: "En cours",
    emoji: "→",
    color: "#14b8a6",
  },
  {
    id: 5,
    title: "Mettre à jour le portfolio",
    description: "Ajouter les deux derniers projets et les résultats obtenus.",
    category: "Créatif",
    createdAt: "2025-05-12",
    dueDate: "2025-06-02",
    priority: "Basse",
    status: "À faire",
    emoji: "✎",
    color: "#f59e0b",
    projectId: 2,
  },
  {
    id: 6,
    title: "Envoyer le compte-rendu",
    description: "Synthèse de la réunion produit et prochaines étapes.",
    category: "Travail",
    createdAt: "2025-05-17",
    dueDate: "2025-05-22",
    priority: "Haute",
    status: "Terminée",
    emoji: "✓",
    color: "#22c55e",
    projectId: 1,
  },
];

const initialProjects: Project[] = [
  {
    id: 1,
    name: "Lancement produit",
    description: "Préparer le lancement de la nouvelle expérience Dooty avec l'équipe produit.",
    startDate: "2025-05-12",
    endDate: "2025-06-14",
    color: "#8b5cf6",
    emoji: "✦",
  },
  {
    id: 2,
    name: "Portfolio 2025",
    description: "Mettre à jour les études de cas et rafraîchir mon identité visuelle.",
    startDate: "2025-05-05",
    endDate: "2025-06-28",
    color: "#f59e0b",
    emoji: "✎",
  },
  {
    id: 3,
    name: "Routine bien-être",
    description: "Construire une routine durable pour mieux équilibrer énergie et concentration.",
    startDate: "2025-05-20",
    endDate: "2025-07-01",
    color: "#14b8a6",
    emoji: "●",
  },
];

const initialConversations: Conversation[] = [
  {
    id: 1,
    title: "Bienvenue dans Dooty AI",
    messages: [
      {
        id: 1,
        role: "assistant",
        content:
          "Bonjour Alex. Je suis votre coach de productivité Dooty. Connectez un fournisseur d’IA pour obtenir des recommandations personnalisées à partir de vos tâches et échéances.",
      },
    ],
  },
];

const blankTask: Omit<Task, "id" | "createdAt"> = {
  title: "",
  description: "",
  category: "Travail",
  dueDate: "",
  priority: "Moyenne",
  status: "À faire",
  emoji: "✦",
  color: "#8b5cf6",
  projectId: undefined,
};

const formatDate = (date: string, short = false) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: short ? "short" : "long",
    ...(short ? {} : { year: "numeric" }),
  }).format(new Date(`${date}T12:00:00`));

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, amount: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

const englishUi: Record<string, string> = {
  "Bonjour Alex, prêt à avancer ?": "Hello Alex, ready to move forward?",
  "Voici un aperçu de votre journée. Vous êtes sur la bonne voie.":
    "Here is an overview of your day. You are on the right track.",
  "Nouvelle tâche": "New task",
  "Total des tâches": "Total tasks",
  Terminées: "Completed",
  "Bravo, continuez !": "Great, keep going!",
  "En cours": "In progress",
  "À poursuivre": "Keep going",
  "En attente": "Pending",
  "2 prioritaires": "2 high priority",
  "En retard": "Overdue",
  "À traiter aujourd'hui": "Handle today",
  "VOTRE PROGRESSION": "YOUR PROGRESS",
  "Objectif du jour": "Daily goal",
  "Excellent rythme !": "Excellent pace!",
  "Vous avez terminé 5 tâches sur 7 aujourd'hui.": "You completed 5 out of 7 tasks today.",
  "Plus que 2 tâches pour atteindre votre objectif": "Only 2 tasks left to reach your goal",
  accompli: "completed",
  "PENSÉE DU JOUR": "THOUGHT OF THE DAY",
  "Mes tâches du jour": "Today's tasks",
  "Tout voir": "View all",
  "À VENIR": "UPCOMING",
  "Prochaines échéances": "Upcoming deadlines",
  "MON ESPACE DE TRAVAIL": "MY WORKSPACE",
  "Mes tâches": "My tasks",
  "Organisez vos priorités et gardez le cap sur vos objectifs.":
    "Organize your priorities and stay focused on your goals.",
  "Créer une tâche": "Create task",
  Total: "Total",
  "À faire": "To do",
  TÂCHE: "TASK",
  ÉCHÉANCE: "DUE DATE",
  PRIORITÉ: "PRIORITY",
  STATUT: "STATUS",
  "Mis à jour à l'instant": "Updated just now",
  "Aucune tâche trouvée": "No tasks found",
  "Essayez de modifier votre recherche ou vos filtres.": "Try changing your search or filters.",
  "Réinitialiser les filtres": "Reset filters",
  Tous: "All",
  Toutes: "All",
  Basse: "Low",
  Moyenne: "Medium",
  Haute: "High",
  Échéance: "Due date",
  Création: "Created",
  PLANIFICATION: "PLANNING",
  Calendrier: "Calendar",
  "Vos échéances et votre énergie, réunies au même endroit.":
    "Your deadlines and energy, all in one place.",
  Mois: "Month",
  Semaine: "Week",
  "VUE MENSUELLE": "MONTH VIEW",
  "VUE HEBDOMADAIRE": "WEEK VIEW",
  "JOUR SÉLECTIONNÉ": "SELECTED DAY",
  "Comment vous sentez-vous ?": "How are you feeling?",
  "Une humeur par jour · modifiable à tout moment": "One mood per day · editable anytime",
  "Journée libre": "Free day",
  "Aucune tâche prévue pour cette date.": "No tasks planned for this date.",
  Humeur: "Mood",
  "VUE D'ENSEMBLE": "OVERVIEW",
  "Mes projets": "My projects",
  "Transformez vos ambitions en étapes claires et mesurables.":
    "Turn your ambitions into clear, measurable steps.",
  "Nouveau projet": "New project",
  "Créer un projet": "Create project",
  "Ajoutez un nouvel espace de travail": "Add a new workspace",
  "Voir le projet": "View project",
  "Tous les projets": "All projects",
  "PROJET ACTIF": "ACTIVE PROJECT",
  "Ajouter une tâche": "Add task",
  PROGRESSION: "PROGRESS",
  DÉBUT: "START",
  "TÂCHES ASSOCIÉES": "RELATED TASKS",
  "Avancement du projet": "Project progress",
  "Commencez ce projet": "Start this project",
  "Ajoutez une première tâche pour lancer la progression.":
    "Add a first task to start tracking progress.",
  "Nouvelle conversation": "New conversation",
  CONVERSATIONS: "CONVERSATIONS",
  "Contexte prêt": "Context ready",
  "Prêt pour la connexion API": "Ready for API connection",
  "Coach productivité": "Productivity coach",
  Vous: "You",
  "Comment puis-je vous aider ?": "How can I help you?",
  "Prioriser mes tâches": "Prioritize my tasks",
  "Organiser ma journée": "Organize my day",
  "Créer un plan d'étude": "Create a study plan",
  "Anticiper mes échéances": "Plan for my deadlines",
  "NOUVELLE TÂCHE": "NEW TASK",
  MODIFIER: "EDIT",
  "Mettre à jour la tâche": "Update task",
  "Titre *": "Title *",
  "Description *": "Description *",
  Catégorie: "Category",
  "Échéance *": "Due date *",
  Priorité: "Priority",
  Statut: "Status",
  "Projet associé": "Related project",
  "Aucun projet": "No project",
  Couleur: "Color",
  Annuler: "Cancel",
  Enregistrer: "Save",
  Fermer: "Close",
  Modifier: "Edit",
  "Supprimer cette tâche ?": "Delete this task?",
  Supprimer: "Delete",
  "NOUVEAU PROJET": "NEW PROJECT",
  "Mettre à jour le projet": "Update project",
  "Nom du projet *": "Project name *",
  "Date de début *": "Start date *",
  "Date de fin *": "End date *",
  "Identité du projet": "Project identity",
  "Créer le projet": "Create project",
};

function translateInterface(root: HTMLElement) {
  const translateText = (value: string) => {
    const trimmed = value.trim();
    if (englishUi[trimmed]) return value.replace(trimmed, englishUi[trimmed]);
    return value
      .replace(/(\d+) tâches? affichées?/g, "$1 tasks shown")
      .replace(/(\d+) tâches?/g, "$1 tasks")
      .replace(/Tâche le /g, "Task on ")
      .replace(/Aujourd'hui/g, "Today");
  };
  const translateNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE && node.nodeValue) {
      const translated = translateText(node.nodeValue);
      if (translated !== node.nodeValue) node.nodeValue = translated;
      return;
    }
    if (!(node instanceof HTMLElement)) return;
    ["placeholder", "title", "aria-label"].forEach((attribute) => {
      const value = node.getAttribute(attribute);
      if (value) node.setAttribute(attribute, translateText(value));
    });
    node.childNodes.forEach(translateNode);
  };
  translateNode(root);
}

function Sidebar({
  active,
  onNavigate,
  open,
  onClose,
  language,
  profile,
  unreadNotifications,
}:
 {
  active: Page;
  onNavigate: (page: Page) => void;
  open: boolean;
  onClose: () => void;
  language: "fr" | "en";
  profile: Profile;
  unreadNotifications: number;
}) {
  const { user } = useAuth();
  const englishLabels: Record<Page, string> = {
    Overview: "Overview",
    "Mes tâches": "My tasks",
    Calendrier: "Calendar",
    "Mes projets": "My projects",
    Chatbot: "AI Coach",
    Notifications: "Notifications",
    Statistiques: "Statistics",
    "Mon profil": "My profile",
    Paramètres: "Settings",
  };
  return (
    <>
      <button
        className={`sidebar-backdrop ${open ? "show" : ""}`}
        onClick={onClose}
        aria-label="Fermer le menu"
      />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">
            <Check size={18} strokeWidth={3} />
          </div>
          <span>Dooty</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>
        <nav className="nav-list" aria-label="Navigation principale">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${active === label ? "active" : ""}`}
              onClick={() => {
                onNavigate(label);
                onClose();
              }}
            >
              <Icon size={19} strokeWidth={active === label ? 2.4 : 1.8} />
              <span>{language === "en" ? englishLabels[label] : label}</span>
              {label === "Notifications" && unreadNotifications > 0 && (
                <span className="notification-dot">{unreadNotifications}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-card">
          <div className="sparkle">
            <Sparkles size={17} />
          </div>
          <strong>Restez concentré</strong>
          <p>Vous avez accompli 72% de votre objectif quotidien.</p>
          <div className="mini-progress">
            <span style={{ width: "72%" }} />
          </div>
        </div>
        <div className="sidebar-profile">
          <div className="avatar">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" />
            ) : (
              `${profile.firstName[0]}${profile.lastName[0]}`
            )}
          </div>
          <div>
          <strong>{user?.nom || 'Utilisateur'}</strong>
            <span>{profile.email}</span>
          </div>
          <MoreHorizontal size={18} />
        </div>
      </aside>
    </>
  );
}

function Header({
  title,
  onMenu,
  language,
  profile,
}: {
  title: Page;
  onMenu: () => void;
  language: "fr" | "en";
  profile: Profile;
}) {
  const englishTitles: Partial<Record<Page, string>> = {
    "Mes tâches": "My tasks",
    Calendrier: "Calendar",
    "Mes projets": "My projects",
    Chatbot: "AI Coach",
    Statistiques: "Statistics",
    "Mon profil": "My profile",
    Paramètres: "Settings",
  };
  return (
    <header className="topbar">
      <button className="icon-btn mobile-menu" onClick={onMenu} aria-label="Ouvrir le menu">
        <Menu size={21} />
      </button>
      <div className="mobile-brand">
        <span className="brand-mark">
          <Check size={14} strokeWidth={3} />
        </span>
        Dooty
      </div>
      <div className="topbar-title">
        {language === "en" ? englishTitles[title] || title : title}
      </div>
      <div className="top-actions">
        <button className="icon-btn notification-button" aria-label="Notifications">
          <Bell size={19} />
          <i />
        </button>
        <div className="top-avatar">
          {profile.avatar ? (
            <img src={profile.avatar} alt="" />
          ) : (
            `${profile.firstName[0]}${profile.lastName[0]}`
          )}
        </div>
      </div>
    </header>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span className={`badge status-${status.replace(" ", "-").toLowerCase()}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`priority priority-${priority.toLowerCase()}`}>{priority}</span>;
}

function Overview({
  tasks,
  onCreate,
  onTasks,
}: {
  tasks: Task[];
  onCreate: () => void;
  onTasks: () => void;
}) {
  const { user } = useAuth();
  const completed = tasks.filter((task) => task.status === "Terminée").length;
  const inProgress = tasks.filter((task) => task.status === "En cours").length;
  const completion = Math.round((completed / Math.max(tasks.length, 1)) * 100);
  const todayTasks = tasks.slice(0, 3);
  const deadlines = tasks.filter((task) => task.status !== "Terminée").slice(2, 5);

  return (
    <div className="page overview-page">
      <section className="welcome-row">
        <div>
          <p className="eyebrow">MARDI 27 MAI</p>
          <h1>Bonjour {user?.nom || 'Utilisateur'}, prêt à avancer ?</h1>
          <p className="subtitle">Voici un aperçu de votre journée. Vous êtes sur la bonne voie.</p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <Plus size={18} /> Nouvelle tâche
        </button>
      </section>

      <section className="stats-grid">
        <StatCard
          icon={CircleDot}
          tone="purple"
          value={tasks.length}
          label="Total des tâches"
          detail="+3 cette semaine"
        />
        <StatCard
          icon={CheckCircle2}
          tone="green"
          value={completed}
          label="Terminées"
          detail="Bravo, continuez !"
        />
        <StatCard
          icon={Clock3}
          tone="blue"
          value={inProgress}
          label="En cours"
          detail="À poursuivre"
        />
        <StatCard
          icon={Circle}
          tone="orange"
          value={tasks.filter((t) => t.status === "À faire").length}
          label="En attente"
          detail="2 prioritaires"
        />
        <StatCard
          icon={CircleAlert}
          tone="red"
          value={1}
          label="En retard"
          detail="À traiter aujourd'hui"
        />
      </section>

      <section className="dashboard-grid">
        <div className="card focus-card">
          <div className="card-heading">
            <div>
              <span className="overline">VOTRE PROGRESSION</span>
              <h2>Objectif du jour</h2>
            </div>
            <span className="trend">
              <TrendingUp size={14} /> +12%
            </span>
          </div>
          <div className="progress-content">
            <div
              className="progress-ring"
              style={{ "--progress": `${Math.max(completion, 72)}%` } as React.CSSProperties}
            >
              <div>
                <strong>{Math.max(completion, 72)}%</strong>
                <span>accompli</span>
              </div>
            </div>
            <div className="progress-copy">
              <strong>Excellent rythme !</strong>
              <p>Vous avez terminé 5 tâches sur 7 aujourd'hui.</p>
              <div className="wide-progress">
                <span style={{ width: "72%" }} />
              </div>
              <small>Plus que 2 tâches pour atteindre votre objectif</small>
            </div>
          </div>
        </div>
        <div className="quote-card">
          <div className="quote-icon">
            <Sparkles size={20} />
          </div>
          <span>PENSÉE DU JOUR</span>
          <blockquote>« Le secret pour avancer, c'est de commencer. »</blockquote>
          <p>— Mark Twain</p>
          <div className="quote-orb orb-one" />
          <div className="quote-orb orb-two" />
        </div>
      </section>

      <section className="dashboard-grid lower-grid">
        <div className="card task-panel">
          <div className="card-heading">
            <div>
              <span className="overline">MARDI 27 MAI</span>
              <h2>Mes tâches du jour</h2>
            </div>
            <button className="text-button" onClick={onTasks}>
              Tout voir <ChevronRight size={16} />
            </button>
          </div>
          <div className="today-list">
            {todayTasks.map((task) => (
              <CompactTask key={task.id} task={task} />
            ))}
          </div>
        </div>
        <div className="card deadline-panel">
          <div className="card-heading">
            <div>
              <span className="overline">À VENIR</span>
              <h2>Prochaines échéances</h2>
            </div>
            <CalendarDays size={19} className="muted-icon" />
          </div>
          <div className="deadline-list">
            {deadlines.map((task, index) => (
              <div className="deadline-item" key={task.id}>
                <div className={`date-tile tile-${index}`}>
                  <strong>{task.dueDate.split("-")[2]}</strong>
                  <span>MAI</span>
                </div>
                <div>
                  <strong>{task.title}</strong>
                  <span>
                    {task.category} · {formatDate(task.dueDate, true)}
                  </span>
                </div>
                <PriorityBadge priority={task.priority} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  tone,
  value,
  label,
  detail,
}: {
  icon: LucideIcon;
  tone: string;
  value: number;
  label: string;
  detail: string;
}) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>
        <Icon size={19} />
      </div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
        <small>{detail}</small>
      </div>
    </div>
  );
}

function CompactTask({ task }: { task: Task }) {
  return (
    <div className="compact-task">
      <button
        className={`task-check ${task.status === "Terminée" ? "checked" : ""}`}
        aria-label="Marquer comme terminée"
      >
        {task.status === "Terminée" && <Check size={13} />}
      </button>
      <div className="task-color" style={{ background: task.color }}>
        {task.emoji}
      </div>
      <div className="compact-main">
        <strong className={task.status === "Terminée" ? "done" : ""}>{task.title}</strong>
        <span>{task.category} · Aujourd'hui</span>
      </div>
      <PriorityBadge priority={task.priority} />
      <StatusBadge status={task.status} />
    </div>
  );
}

function TasksPage({
  tasks,
  onCreate,
  onEdit,
  onView,
  onDelete,
}: {
  tasks: Task[];
  onCreate: () => void;
  onEdit: (task: Task) => void;
  onView: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Tous");
  const [priority, setPriority] = useState("Toutes");
  const [category, setCategory] = useState("Toutes");
  const [sort, setSort] = useState("deadline");
  const categories = [...new Set(tasks.map((task) => task.category))];
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => task.title.toLowerCase().includes(search.toLowerCase()))
      .filter((task) => status === "Tous" || task.status === status)
      .filter((task) => priority === "Toutes" || task.priority === priority)
      .filter((task) => category === "Toutes" || task.category === category)
      .sort((a, b) =>
        sort === "deadline"
          ? a.dueDate.localeCompare(b.dueDate)
          : b.createdAt.localeCompare(a.createdAt),
      );
  }, [tasks, search, status, priority, category, sort]);

  const resetFilters = () => {
    setSearch("");
    setStatus("Tous");
    setPriority("Toutes");
    setCategory("Toutes");
  };

  return (
    <div className="page tasks-page">
      <section className="page-title-row">
        <div>
          <p className="eyebrow">MON ESPACE DE TRAVAIL</p>
          <h1>Mes tâches</h1>
          <p className="subtitle">Organisez vos priorités et gardez le cap sur vos objectifs.</p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <Plus size={18} /> Créer une tâche
        </button>
      </section>
      <section className="task-summary">
        <div>
          <span className="summary-dot purple" />
          <strong>{tasks.length}</strong>
          <span>Total</span>
        </div>
        <div>
          <span className="summary-dot orange" />
          <strong>{tasks.filter((t) => t.status === "À faire").length}</strong>
          <span>À faire</span>
        </div>
        <div>
          <span className="summary-dot blue" />
          <strong>{tasks.filter((t) => t.status === "En cours").length}</strong>
          <span>En cours</span>
        </div>
        <div>
          <span className="summary-dot green" />
          <strong>{tasks.filter((t) => t.status === "Terminée").length}</strong>
          <span>Terminées</span>
        </div>
      </section>
      <section className="card tasks-container">
        <div className="filter-bar">
          <label className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une tâche..."
            />
          </label>
          <div className="filter-controls">
            <SelectFilter
              icon={SlidersHorizontal}
              value={status}
              onChange={setStatus}
              options={["Tous", "À faire", "En cours", "Terminée"]}
            />
            <SelectFilter
              value={priority}
              onChange={setPriority}
              options={["Toutes", "Basse", "Moyenne", "Haute"]}
            />
            <SelectFilter
              value={category}
              onChange={setCategory}
              options={["Toutes", ...categories]}
            />
            <SelectFilter
              icon={ArrowDownUp}
              value={sort}
              onChange={setSort}
              options={[
                ["deadline", "Échéance"],
                ["creation", "Création"],
              ]}
            />
          </div>
        </div>
        <div className="table-head">
          <span>TÂCHE</span>
          <span>ÉCHÉANCE</span>
          <span>PRIORITÉ</span>
          <span>STATUT</span>
          <span />
        </div>
        <div className="task-list">
          {filteredTasks.length ? (
            filteredTasks.map((task) => (
              <div className="task-row" key={task.id} onClick={() => onView(task)}>
                <div className="task-identity">
                  <div className="task-color large" style={{ background: task.color }}>
                    {task.emoji}
                  </div>
                  <div>
                    <strong>{task.title}</strong>
                    <span>{task.description}</span>
                    <small>{task.category}</small>
                  </div>
                </div>
                <div className="date-cell">
                  <CalendarDays size={15} />
                  <span>{formatDate(task.dueDate, true)}</span>
                </div>
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
                <div className="row-actions" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => onEdit(task)} aria-label={`Modifier ${task.title}`}>
                    <Pencil size={16} />
                  </button>
                  <button
                    className="delete-action"
                    onClick={() => onDelete(task)}
                    aria-label={`Supprimer ${task.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <Search size={30} />
              <h3>Aucune tâche trouvée</h3>
              <p>Essayez de modifier votre recherche ou vos filtres.</p>
              <button className="text-button" onClick={resetFilters}>
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>
        <div className="table-footer">
          <span>
            {filteredTasks.length} tâche{filteredTasks.length > 1 ? "s" : ""} affichée
            {filteredTasks.length > 1 ? "s" : ""}
          </span>
          <span>Mis à jour à l'instant</span>
        </div>
      </section>
    </div>
  );
}

function SelectFilter({
  icon: Icon,
  value,
  onChange,
  options,
}: {
  icon?: LucideIcon;
  value: string;
  onChange: (value: string) => void;
  options: (string | [string, string])[];
}) {
  return (
    <label className="select-wrap">
      {Icon && <Icon size={15} />}
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => {
          const [val, label] = Array.isArray(option) ? option : [option, option];
          return (
            <option value={val} key={val}>
              {label}
            </option>
          );
        })}
      </select>
      <ChevronDown size={14} />
    </label>
  );
}

function TaskModal({
  task,
  initialDueDate,
  initialProjectId,
  projects,
  onClose,
  onSave,
}: {
  task: Task | null;
  initialDueDate?: string;
  initialProjectId?: number;
  projects: Project[];
  onClose: () => void;
  onSave: (task: Omit<Task, "id" | "createdAt">) => void;
}) {
  const [form, setForm] = useState(
    task
      ? {
          title: task.title,
          description: task.description,
          category: task.category,
          dueDate: task.dueDate,
          priority: task.priority,
          status: task.status,
          emoji: task.emoji,
          color: task.color,
          projectId: task.projectId,
        }
      : { ...blankTask, dueDate: initialDueDate ?? "", projectId: initialProjectId },
  );
  const [error, setError] = useState("");
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (form.title.trim().length < 3)
      return setError("Le titre doit contenir au moins 3 caractères.");
    if (!form.description.trim()) return setError("Ajoutez une courte description.");
    if (!form.dueDate) return setError("Choisissez une date d'échéance.");
    setError("");
    onSave({ ...form, title: form.title.trim(), description: form.description.trim() });
  };

  return (
    <div
      className="modal-layer"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <span className="overline">{task ? "MODIFIER" : "NOUVELLE TÂCHE"}</span>
            <h2>{task ? "Mettre à jour la tâche" : "Créer une tâche"}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="form-grid">
          <label className="field full">
            <span>Titre *</span>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="Ex. Préparer la réunion"
            />
          </label>
          <label className="field full">
            <span>Description *</span>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Ajoutez quelques détails..."
              rows={3}
            />
          </label>
          <label className="field">
            <span>Catégorie</span>
            <input
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              placeholder="Travail"
            />
          </label>
          <label className="field">
            <span>Échéance *</span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => update("dueDate", e.target.value)}
            />
          </label>
          <label className="field">
            <span>Priorité</span>
            <select value={form.priority} onChange={(e) => update("priority", e.target.value)}>
              <option>Basse</option>
              <option>Moyenne</option>
              <option>Haute</option>
            </select>
          </label>
          <label className="field">
            <span>Statut</span>
            <select value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option>À faire</option>
              <option>En cours</option>
              <option>Terminée</option>
            </select>
          </label>
          <label className="field full">
            <span>Projet associé</span>
            <select
              value={form.projectId ?? ""}
              onChange={(e) =>
                setForm((current) => ({
                  ...current,
                  projectId: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
            >
              <option value="">Aucun projet</option>
              {projects.map((project) => (
                <option value={project.id} key={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field full">
            <span>Couleur</span>
            <div className="color-options">
              {["#8b5cf6", "#3b82f6", "#14b8a6", "#f59e0b", "#f472b6"].map((color) => (
                <button
                  type="button"
                  aria-label={`Couleur ${color}`}
                  key={color}
                  className={form.color === color ? "selected" : ""}
                  style={{ background: color }}
                  onClick={() => update("color", color)}
                >
                  {form.color === color && <Check size={13} />}
                </button>
              ))}
            </div>
          </label>
        </div>
        {error && (
          <div className="form-error">
            <CircleAlert size={15} />
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Annuler
          </button>
          <button className="primary-button" type="submit">
            {task ? "Enregistrer" : "Créer la tâche"}
          </button>
        </div>
      </form>
    </div>
  );
}

function TaskDetails({
  task,
  onClose,
  onEdit,
}: {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="modal-layer" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal detail-modal">
        <div className="modal-header">
          <span className="task-color detail-icon" style={{ background: task.color }}>
            {task.emoji}
          </span>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <StatusBadge status={task.status} />
        <h2>{task.title}</h2>
        <p className="detail-description">{task.description}</p>
        <div className="detail-grid">
          <div>
            <span>CATÉGORIE</span>
            <strong>{task.category}</strong>
          </div>
          <div>
            <span>PRIORITÉ</span>
            <PriorityBadge priority={task.priority} />
          </div>
          <div>
            <span>CRÉÉE LE</span>
            <strong>{formatDate(task.createdAt)}</strong>
          </div>
          <div>
            <span>ÉCHÉANCE</span>
            <strong>{formatDate(task.dueDate)}</strong>
          </div>
        </div>
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>
            Fermer
          </button>
          <button className="primary-button" onClick={onEdit}>
            <Pencil size={16} /> Modifier
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDelete({
  task,
  onClose,
  onConfirm,
}: {
  task: Task;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="modal-layer">
      <div className="modal confirm-modal">
        <div className="danger-icon">
          <Trash2 size={22} />
        </div>
        <h2>Supprimer cette tâche ?</h2>
        <p>« {task.title} » sera définitivement supprimée. Cette action est irréversible.</p>
        <div className="modal-actions">
          <button className="secondary-button" onClick={onClose}>
            Annuler
          </button>
          <button className="danger-button" onClick={onConfirm}>
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

const moods = ["❤️", "😊", "😴", "😔", "🔥", "🌸", "💪"];
const weekLabels = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];

function CalendarPage({
  tasks,
  moodsByDate,
  onMoodChange,
  onCreate,
  onView,
}: {
  tasks: Task[];
  moodsByDate: Record<string, string>;
  onMoodChange: (date: string, mood: string) => void;
  onCreate: (date: string) => void;
  onView: (task: Task) => void;
}) {
  const [view, setView] = useState<"month" | "week">("month");
  const [cursor, setCursor] = useState(new Date(2025, 4, 1));
  const [selectedDate, setSelectedDate] = useState("2025-05-27");
  const visibleDays = useMemo(() => {
    if (view === "week") {
      const selected = new Date(`${selectedDate}T12:00:00`);
      const mondayOffset = (selected.getDay() + 6) % 7;
      const monday = addDays(selected, -mondayOffset);
      return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
    }
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = addDays(first, -mondayOffset);
    return Array.from({ length: 42 }, (_, index) => addDays(start, index));
  }, [cursor, selectedDate, view]);
  const selectedTasks = tasks.filter((task) => task.dueDate === selectedDate);
  const monthLabel = new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
  }).format(cursor);

  const navigate = (direction: number) => {
    if (view === "month") {
      setCursor((current) => new Date(current.getFullYear(), current.getMonth() + direction, 1));
    } else {
      const next = addDays(new Date(`${selectedDate}T12:00:00`), direction * 7);
      setSelectedDate(toDateKey(next));
      setCursor(new Date(next.getFullYear(), next.getMonth(), 1));
    }
  };

  return (
    <div className="page calendar-page">
      <section className="page-title-row calendar-title-row">
        <div>
          <p className="eyebrow">PLANIFICATION</p>
          <h1>Calendrier</h1>
          <p className="subtitle">Vos échéances et votre énergie, réunies au même endroit.</p>
        </div>
        <button className="primary-button" onClick={() => onCreate(selectedDate)}>
          <Plus size={18} /> Tâche le {formatDate(selectedDate, true)}
        </button>
      </section>
      <div className="calendar-layout">
        <section className="card calendar-card">
          <div className="calendar-toolbar">
            <div className="calendar-navigation">
              <button
                className="icon-btn"
                onClick={() => navigate(-1)}
                aria-label="Période précédente"
              >
                <ArrowLeft size={17} />
              </button>
              <div>
                <span>{view === "month" ? "VUE MENSUELLE" : "VUE HEBDOMADAIRE"}</span>
                <h2>{monthLabel}</h2>
              </div>
              <button
                className="icon-btn"
                onClick={() => navigate(1)}
                aria-label="Période suivante"
              >
                <ArrowRight size={17} />
              </button>
            </div>
            <div className="view-toggle">
              <button className={view === "month" ? "active" : ""} onClick={() => setView("month")}>
                Mois
              </button>
              <button className={view === "week" ? "active" : ""} onClick={() => setView("week")}>
                Semaine
              </button>
            </div>
          </div>
          <div className={`calendar-grid ${view === "week" ? "week-view" : ""}`}>
            {weekLabels.map((label) => (
              <div className="calendar-week-label" key={label}>
                {label}
              </div>
            ))}
            {visibleDays.map((date) => {
              const key = toDateKey(date);
              const dayTasks = tasks.filter((task) => task.dueDate === key);
              const isOtherMonth = date.getMonth() !== cursor.getMonth();
              return (
                <button
                  key={key}
                  className={`calendar-day ${selectedDate === key ? "selected" : ""} ${isOtherMonth && view === "month" ? "outside" : ""} ${dayTasks.length ? "has-tasks" : ""}`}
                  onClick={() => {
                    setSelectedDate(key);
                    if (date.getMonth() !== cursor.getMonth())
                      setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
                  }}
                >
                  <span className="day-number">{date.getDate()}</span>
                  {moodsByDate[key] && <span className="calendar-mood">{moodsByDate[key]}</span>}
                  <div className="calendar-tasks">
                    {dayTasks.slice(0, view === "week" ? 4 : 2).map((task) => (
                      <span
                        key={task.id}
                        style={{ "--task-color": task.color } as React.CSSProperties}
                      >
                        {task.title}
                      </span>
                    ))}
                    {dayTasks.length > (view === "week" ? 4 : 2) && (
                      <small>+{dayTasks.length - (view === "week" ? 4 : 2)}</small>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
        <aside className="calendar-side">
          <section className="card day-card">
            <div className="day-card-heading">
              <div>
                <span className="overline">JOUR SÉLECTIONNÉ</span>
                <h2>{formatDate(selectedDate)}</h2>
              </div>
              <button
                className="icon-btn"
                onClick={() => onCreate(selectedDate)}
                aria-label="Ajouter une tâche"
              >
                <Plus size={17} />
              </button>
            </div>
            <div className="mood-journal">
              <span>Comment vous sentez-vous ?</span>
              <div>
                {moods.map((mood) => (
                  <button
                    key={mood}
                    className={moodsByDate[selectedDate] === mood ? "selected" : ""}
                    onClick={() => onMoodChange(selectedDate, mood)}
                    aria-label={`Humeur ${mood}`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
              <small>Une humeur par jour · modifiable à tout moment</small>
            </div>
            <div className="selected-task-list">
              <div className="section-mini-title">
                <span>TÂCHES</span>
                <strong>{selectedTasks.length}</strong>
              </div>
              {selectedTasks.length ? (
                selectedTasks.map((task) => (
                  <button key={task.id} className="calendar-task-item" onClick={() => onView(task)}>
                    <i style={{ background: task.color }} />
                    <div>
                      <strong>{task.title}</strong>
                      <span>{task.category}</span>
                    </div>
                    <StatusBadge status={task.status} />
                  </button>
                ))
              ) : (
                <div className="calendar-empty">
                  <CalendarRange size={25} />
                  <strong>Journée libre</strong>
                  <span>Aucune tâche prévue pour cette date.</span>
                </div>
              )}
            </div>
          </section>
          <section className="calendar-legend">
            <span>
              <i className="legend-task" /> Échéance
            </span>
            <span>
              <i className="legend-mood">😊</i> Humeur du jour
            </span>
          </section>
        </aside>
      </div>
    </div>
  );
}

function ProjectModal({
  project,
  onClose,
  onSave,
}: {
  project: Project | null;
  onClose: () => void;
  onSave: (project: Omit<Project, "id">) => void;
}) {
  const [form, setForm] = useState<Omit<Project, "id">>(
    project
      ? {
          name: project.name,
          description: project.description,
          startDate: project.startDate,
          endDate: project.endDate,
          color: project.color,
          emoji: project.emoji,
        }
      : {
          name: "",
          description: "",
          startDate: "",
          endDate: "",
          color: "#8b5cf6",
          emoji: "✦",
        },
  );
  const [error, setError] = useState("");
  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (form.name.trim().length < 3)
      return setError("Le nom du projet doit contenir au moins 3 caractères.");
    if (!form.description.trim()) return setError("Ajoutez une description au projet.");
    if (!form.startDate || !form.endDate) return setError("Renseignez les dates du projet.");
    if (form.endDate < form.startDate)
      return setError("La date de fin doit être postérieure à la date de début.");
    onSave({ ...form, name: form.name.trim(), description: form.description.trim() });
  };

  return (
    <div
      className="modal-layer"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form className="modal" onSubmit={submit}>
        <div className="modal-header">
          <div>
            <span className="overline">{project ? "MODIFIER" : "NOUVEAU PROJET"}</span>
            <h2>{project ? "Mettre à jour le projet" : "Créer un projet"}</h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="form-grid">
          <label className="field full">
            <span>Nom du projet *</span>
            <input
              autoFocus
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              placeholder="Ex. Refonte du site"
            />
          </label>
          <label className="field full">
            <span>Description *</span>
            <textarea
              rows={3}
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              placeholder="Décrivez l'objectif du projet..."
            />
          </label>
          <label className="field">
            <span>Date de début *</span>
            <input
              type="date"
              value={form.startDate}
              onChange={(event) => update("startDate", event.target.value)}
            />
          </label>
          <label className="field">
            <span>Date de fin *</span>
            <input
              type="date"
              value={form.endDate}
              onChange={(event) => update("endDate", event.target.value)}
            />
          </label>
          <label className="field full">
            <span>Identité du projet</span>
            <div className="project-identity-picker">
              <div className="color-options">
                {["#8b5cf6", "#3b82f6", "#14b8a6", "#f59e0b", "#f472b6"].map((color) => (
                  <button
                    type="button"
                    key={color}
                    className={form.color === color ? "selected" : ""}
                    style={{ background: color }}
                    onClick={() => update("color", color)}
                  >
                    {form.color === color && <Check size={13} />}
                  </button>
                ))}
              </div>
              <select value={form.emoji} onChange={(event) => update("emoji", event.target.value)}>
                {["✦", "✎", "●", "◆", "→", "✿"].map((emoji) => (
                  <option key={emoji}>{emoji}</option>
                ))}
              </select>
            </div>
          </label>
        </div>
        {error && (
          <div className="form-error">
            <CircleAlert size={15} />
            {error}
          </div>
        )}
        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose}>
            Annuler
          </button>
          <button className="primary-button">{project ? "Enregistrer" : "Créer le projet"}</button>
        </div>
      </form>
    </div>
  );
}

function ProjectsPage({
  projects,
  tasks,
  onCreate,
  onEdit,
  onDelete,
  onCreateTask,
  onViewTask,
}: {
  projects: Project[];
  tasks: Task[];
  onCreate: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onCreateTask: (projectId: number) => void;
  onViewTask: (task: Task) => void;
}) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const selected = projects.find((project) => project.id === selectedId) ?? null;
  const completion = (project: Project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    return projectTasks.length
      ? Math.round(
          (projectTasks.filter((task) => task.status === "Terminée").length / projectTasks.length) *
            100,
        )
      : 0;
  };

  if (selected) {
    const projectTasks = tasks.filter((task) => task.projectId === selected.id);
    const progress = completion(selected);
    return (
      <div className="page project-detail-page">
        <button className="back-button" onClick={() => setSelectedId(null)}>
          <ArrowLeft size={16} /> Tous les projets
        </button>
        <section
          className="project-detail-hero card"
          style={{ "--project-color": selected.color } as React.CSSProperties}
        >
          <div className="project-detail-main">
            <div className="project-large-icon" style={{ background: selected.color }}>
              {selected.emoji}
            </div>
            <div>
              <span className="overline">PROJET ACTIF</span>
              <h1>{selected.name}</h1>
              <p>{selected.description}</p>
            </div>
          </div>
          <div className="project-detail-actions">
            <button className="secondary-button" onClick={() => onEdit(selected)}>
              <Pencil size={15} /> Modifier
            </button>
            <button className="primary-button" onClick={() => onCreateTask(selected.id)}>
              <Plus size={16} /> Ajouter une tâche
            </button>
          </div>
          <div className="project-detail-stats">
            <div>
              <span>PROGRESSION</span>
              <strong>{progress}%</strong>
            </div>
            <div>
              <span>TÂCHES</span>
              <strong>{projectTasks.length}</strong>
            </div>
            <div>
              <span>DÉBUT</span>
              <strong>{formatDate(selected.startDate, true)}</strong>
            </div>
            <div>
              <span>ÉCHÉANCE</span>
              <strong>{formatDate(selected.endDate, true)}</strong>
            </div>
          </div>
          <div className="project-progress">
            <span style={{ width: `${progress}%`, background: selected.color }} />
          </div>
        </section>
        <section className="card project-task-panel">
          <div className="card-heading">
            <div>
              <span className="overline">TÂCHES ASSOCIÉES</span>
              <h2>Avancement du projet</h2>
            </div>
            <span className="project-task-count">
              {projectTasks.length} tâche{projectTasks.length > 1 ? "s" : ""}
            </span>
          </div>
          {projectTasks.length ? (
            <div className="project-task-list">
              {projectTasks.map((task) => (
                <button key={task.id} onClick={() => onViewTask(task)}>
                  <span className="task-color" style={{ background: task.color }}>
                    {task.emoji}
                  </span>
                  <div>
                    <strong>{task.title}</strong>
                    <span>Échéance · {formatDate(task.dueDate, true)}</span>
                  </div>
                  <PriorityBadge priority={task.priority} />
                  <StatusBadge status={task.status} />
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>
          ) : (
            <div className="project-empty">
              <FolderPlus size={29} />
              <h3>Commencez ce projet</h3>
              <p>Ajoutez une première tâche pour lancer la progression.</p>
              <button className="primary-button" onClick={() => onCreateTask(selected.id)}>
                <Plus size={16} /> Ajouter une tâche
              </button>
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="page projects-page">
      <section className="page-title-row">
        <div>
          <p className="eyebrow">VUE D'ENSEMBLE</p>
          <h1>Mes projets</h1>
          <p className="subtitle">Transformez vos ambitions en étapes claires et mesurables.</p>
        </div>
        <button className="primary-button" onClick={onCreate}>
          <Plus size={18} /> Nouveau projet
        </button>
      </section>
      {projects.length ? (
        <section className="projects-grid">
          {projects.map((project) => {
            const projectTasks = tasks.filter((task) => task.projectId === project.id);
            const progress = completion(project);
            return (
              <article className="project-card card" key={project.id}>
                <div className="project-card-top">
                  <div
                    className="project-icon"
                    style={{ background: `${project.color}18`, color: project.color }}
                  >
                    {project.emoji}
                  </div>
                  <div className="project-card-actions">
                    <button onClick={() => onEdit(project)} aria-label="Modifier">
                      <Pencil size={15} />
                    </button>
                    <button onClick={() => onDelete(project)} aria-label="Supprimer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                <h2>{project.name}</h2>
                <p>{project.description}</p>
                <div className="project-dates">
                  <CalendarDays size={14} />
                  <span>
                    {formatDate(project.startDate, true)} — {formatDate(project.endDate, true)}
                  </span>
                </div>
                <div className="project-progress-heading">
                  <span>
                    {projectTasks.length} tâche{projectTasks.length > 1 ? "s" : ""}
                  </span>
                  <strong>{progress}%</strong>
                </div>
                <div className="project-progress">
                  <span style={{ width: `${progress}%`, background: project.color }} />
                </div>
                <button className="project-open" onClick={() => setSelectedId(project.id)}>
                  Voir le projet <ChevronRight size={16} />
                </button>
              </article>
            );
          })}
          <button className="project-add-card" onClick={onCreate}>
            <span>
              <Plus size={22} />
            </span>
            <strong>Créer un projet</strong>
            <small>Ajoutez un nouvel espace de travail</small>
          </button>
        </section>
      ) : (
        <section className="card projects-empty">
          <FolderKanban size={37} />
          <h2>Aucun projet pour le moment</h2>
          <p>Créez votre premier projet et regroupez les tâches qui comptent.</p>
          <button className="primary-button" onClick={onCreate}>
            <Plus size={17} /> Créer un projet
          </button>
        </section>
      )}
    </div>
  );
}

async function requestCoachResponse(_payload: {
  message: string;
  tasks: Task[];
  conversation: ChatMessage[];
}): Promise<string> {
  await new Promise((resolve) => window.setTimeout(resolve, 700));
  throw new Error(
    "Le service d’IA n’est pas encore connecté. Configurez votre API pour recevoir une réponse.",
  );
}

function ChatbotPage({ tasks }: { tasks: Task[] }) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(1);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const active = conversations.find((conversation) => conversation.id === activeId);

  const newConversation = () => {
    const id = Date.now();
    setConversations((current) => [
      { id, title: "Nouvelle conversation", messages: [] },
      ...current,
    ]);
    setActiveId(id);
    setError("");
  };
  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading || !active) return;
    const userMessage: ChatMessage = { id: Date.now(), role: "user", content };
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === active.id
          ? {
              ...conversation,
              title: conversation.messages.length ? conversation.title : content.slice(0, 32),
              messages: [...conversation.messages, userMessage],
            }
          : conversation,
      ),
    );
    setInput("");
    setError("");
    setLoading(true);
    try {
      const response = await requestCoachResponse({
        message: content,
        tasks,
        conversation: active.messages,
      });
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === active.id
            ? {
                ...conversation,
                messages: [
                  ...conversation.messages,
                  { id: Date.now(), role: "assistant", content: response },
                ],
              }
            : conversation,
        ),
      );
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <aside className="chat-history">
        <div className="chat-history-heading">
          <div>
            <span className="ai-mark">
              <Sparkles size={16} />
            </span>
            <strong>Dooty AI</strong>
          </div>
          <button onClick={newConversation} aria-label="Nouvelle conversation">
            <MessageSquarePlus size={18} />
          </button>
        </div>
        <button className="new-chat-button" onClick={newConversation}>
          <Plus size={16} /> Nouvelle conversation
        </button>
        <span className="history-label">CONVERSATIONS</span>
        <div className="conversation-list">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              className={activeId === conversation.id ? "active" : ""}
              onClick={() => {
                setActiveId(conversation.id);
                setError("");
              }}
            >
              <Bot size={15} />
              <span>{conversation.title}</span>
            </button>
          ))}
        </div>
        <div className="ai-context">
          <CheckCircle2 size={17} />
          <div>
            <strong>Contexte prêt</strong>
            <span>{tasks.length} tâches seront partagées avec l'API</span>
          </div>
        </div>
      </aside>
      <section className="chat-main">
        <header className="chat-header">
          <div className="ai-avatar">
            <Bot size={20} />
          </div>
          <div>
            <strong>Dooty AI Coach</strong>
            <span>
              <i /> Prêt pour la connexion API
            </span>
          </div>
          <span className="coach-pill">
            <Sparkles size={13} /> Coach productivité
          </span>
        </header>
        <div className="message-area">
          {active?.messages.length ? (
            active.messages.map((message) => (
              <div className={`message-row ${message.role}`} key={message.id}>
                <div className="message-avatar">
                  {message.role === "assistant" ? <Bot size={17} /> : "AM"}
                </div>
                <div className="message-content">
                  <span>{message.role === "assistant" ? "Dooty AI" : "Vous"}</span>
                  <p>{message.content}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="chat-welcome">
              <div className="ai-welcome-icon">
                <Sparkles size={27} />
              </div>
              <h1>Comment puis-je vous aider ?</h1>
              <p>
                Demandez à votre coach de prioriser vos tâches, organiser une journée ou créer un
                plan d'étude.
              </p>
              <div className="prompt-grid">
                {[
                  "Prioriser mes tâches",
                  "Organiser ma journée",
                  "Créer un plan d'étude",
                  "Anticiper mes échéances",
                ].map((prompt) => (
                  <button key={prompt} onClick={() => setInput(prompt)}>
                    {prompt}
                    <ArrowRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {loading && (
            <div className="message-row assistant">
              <div className="message-avatar">
                <Bot size={17} />
              </div>
              <div className="message-content">
                <span>Dooty AI</span>
                <div className="typing-indicator">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="chat-composer-wrap">
          {error && (
            <div className="chat-error">
              <CircleAlert size={15} />
              <span>{error}</span>
              <button onClick={() => setError("")}>
                <X size={14} />
              </button>
            </div>
          )}
          <form className="chat-composer" onSubmit={sendMessage}>
            <textarea
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Demandez conseil à Dooty AI..."
            />
            <button disabled={!input.trim() || loading} aria-label="Envoyer">
              {loading ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}
            </button>
          </form>
          <small>Dooty AI nécessite une API configurée pour générer des réponses.</small>
        </div>
      </section>
    </div>
  );
}

function NotificationsPage({
  notifications,
  language,
  onRead,
  onReadAll,
  onDelete,
}: {
  notifications: AppNotification[];
  language: "fr" | "en";
  onRead: (id: number) => void;
  onReadAll: () => void;
  onDelete: (id: number) => void;
}) {
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const shown = notifications.filter((notification) => filter === "all" || !notification.read);
  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const copy =
    language === "fr"
      ? {
          eyebrow: "CENTRE D'ACTIVITÉ",
          title: "Notifications",
          subtitle: "Gardez un œil sur vos tâches, projets et échéances importantes.",
          all: "Toutes",
          unread: "Non lues",
          readAll: "Tout marquer comme lu",
          empty: "Rien à signaler",
          emptyText: "Vous êtes à jour. Les nouvelles notifications apparaîtront ici.",
          mark: "Marquer comme lu",
          delete: "Supprimer",
        }
      : {
          eyebrow: "ACTIVITY CENTER",
          title: "Notifications",
          subtitle: "Keep an eye on your tasks, projects and important deadlines.",
          all: "All",
          unread: "Unread",
          readAll: "Mark all as read",
          empty: "You're all caught up",
          emptyText: "New notifications will appear here.",
          mark: "Mark as read",
          delete: "Delete",
        };
  const icons = {
    deadline: CalendarDays,
    overdue: CircleAlert,
    completed: CheckCircle2,
    project: FolderKanban,
  };

  return (
    <div className="page notifications-page">
      <section className="page-title-row">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="subtitle">{copy.subtitle}</p>
        </div>
        {unreadCount > 0 && (
          <button className="secondary-button" onClick={onReadAll}>
            <Check size={16} /> {copy.readAll}
          </button>
        )}
      </section>
      <section className="notification-summary">
        <div className="card">
          <span className="notification-summary-icon purple">
            <BellRing size={19} />
          </span>
          <div>
            <strong>{unreadCount}</strong>
            <span>{copy.unread}</span>
          </div>
        </div>
        <div className="card">
          <span className="notification-summary-icon orange">
            <Clock3 size={19} />
          </span>
          <div>
            <strong>{notifications.filter((item) => item.type === "deadline").length}</strong>
            <span>{language === "fr" ? "Échéances" : "Deadlines"}</span>
          </div>
        </div>
        <div className="card">
          <span className="notification-summary-icon red">
            <CircleAlert size={19} />
          </span>
          <div>
            <strong>{notifications.filter((item) => item.type === "overdue").length}</strong>
            <span>{language === "fr" ? "En retard" : "Overdue"}</span>
          </div>
        </div>
      </section>
      <section className="card notification-center">
        <div className="notification-tabs">
          <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
            {copy.all}
            <span>{notifications.length}</span>
          </button>
          <button
            className={filter === "unread" ? "active" : ""}
            onClick={() => setFilter("unread")}
          >
            {copy.unread}
            <span>{unreadCount}</span>
          </button>
        </div>
        {shown.length ? (
          <div className="notification-list">
            {shown.map((notification) => {
              const Icon = icons[notification.type];
              return (
                <article
                  className={`notification-item type-${notification.type} ${notification.read ? "read" : ""}`}
                  key={notification.id}
                >
                  <span className="notification-type-icon">
                    <Icon size={18} />
                  </span>
                  <div className="notification-copy">
                    <div>
                      <strong>{notification.title}</strong>
                      {!notification.read && <i />}
                    </div>
                    <p>{notification.description}</p>
                    <span>{notification.date}</span>
                  </div>
                  <div className="notification-actions">
                    {!notification.read && (
                      <button onClick={() => onRead(notification.id)} title={copy.mark}>
                        <Check size={16} />
                      </button>
                    )}
                    <button onClick={() => onDelete(notification.id)} title={copy.delete}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="notification-empty">
            <span>
              <Bell size={27} />
            </span>
            <h2>{copy.empty}</h2>
            <p>{copy.emptyText}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function StatisticsPage({
  tasks,
  projects,
  language,
}: {
  tasks: Task[];
  projects: Project[];
  language: "fr" | "en";
}) {
  const [period, setPeriod] = useState<"week" | "month">("week");
  const completed = tasks.filter((task) => task.status === "Terminée").length;
  const inProgress = tasks.filter((task) => task.status === "En cours").length;
  const overdue = tasks.filter(
    (task) => task.status !== "Terminée" && task.dueDate < "2025-05-27",
  ).length;
  const onTime = tasks.filter(
    (task) => task.status === "Terminée" && task.dueDate >= task.createdAt,
  ).length;
  const rate = Math.round((completed / Math.max(tasks.length, 1)) * 100);
  const score = Math.min(100, Math.round(rate * 0.7 + (onTime / Math.max(completed, 1)) * 25 + 5));
  const categoryCounts = [...new Set(tasks.map((task) => task.category))].map((category) => ({
    category,
    count: tasks.filter((task) => task.category === category).length,
  }));
  const chartData =
    period === "week" ? [2, 4, 3, 6, 5, 3, 4] : [14, 18, 13, 22, 19, 25, 21, 28, 24, 31, 27, 34];
  const chartLabels =
    period === "week"
      ? language === "fr"
        ? ["L", "M", "M", "J", "V", "S", "D"]
        : ["M", "T", "W", "T", "F", "S", "S"]
      : chartData.map((_, index) => String(index + 1));
  const projectProgress = (project: Project) => {
    const projectTasks = tasks.filter((task) => task.projectId === project.id);
    return projectTasks.length
      ? Math.round(
          (projectTasks.filter((task) => task.status === "Terminée").length / projectTasks.length) *
            100,
        )
      : 0;
  };
  const copy =
    language === "fr"
      ? {
          eyebrow: "ANALYSE PERSONNELLE",
          title: "Statistiques",
          subtitle: "Comprenez votre rythme et célébrez chaque progrès.",
          week: "Semaine",
          month: "Mois",
          trend: "Tendance de productivité",
          categories: "Tâches par catégorie",
          projects: "Progression des projets",
          score: "Score de productivité",
          scoreText: "Un excellent équilibre entre régularité et respect des échéances.",
          rate: "Taux de complétion",
          completed: "Terminées",
          onTime: "À temps",
          overdue: "En retard",
          progress: "En cours",
          cancelled: "Annulées",
        }
      : {
          eyebrow: "PERSONAL ANALYTICS",
          title: "Statistics",
          subtitle: "Understand your rhythm and celebrate every achievement.",
          week: "Week",
          month: "Month",
          trend: "Productivity trend",
          categories: "Tasks by category",
          projects: "Project progress",
          score: "Productivity Score",
          scoreText: "A great balance between consistency and meeting deadlines.",
          rate: "Completion rate",
          completed: "Completed",
          onTime: "On time",
          overdue: "Overdue",
          progress: "In progress",
          cancelled: "Cancelled",
        };

  return (
    <div className="page statistics-page">
      <section className="page-title-row">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="subtitle">{copy.subtitle}</p>
        </div>
        <div className="view-toggle stats-period">
          <button className={period === "week" ? "active" : ""} onClick={() => setPeriod("week")}>
            {copy.week}
          </button>
          <button className={period === "month" ? "active" : ""} onClick={() => setPeriod("month")}>
            {copy.month}
          </button>
        </div>
      </section>
      <section className="analytics-stats">
        {[
          { label: copy.completed, value: completed, icon: CheckCircle2, tone: "green" },
          { label: copy.onTime, value: onTime, icon: Clock3, tone: "purple" },
          { label: copy.overdue, value: overdue, icon: CircleAlert, tone: "red" },
          { label: copy.progress, value: inProgress, icon: TrendingUp, tone: "blue" },
          { label: copy.cancelled, value: 0, icon: CircleX, tone: "gray" },
        ].map(({ label, value, icon: Icon, tone }) => (
          <div className="card analytics-stat" key={label}>
            <span className={tone}>
              <Icon size={18} />
            </span>
            <div>
              <strong>{value}</strong>
              <small>{label}</small>
            </div>
          </div>
        ))}
      </section>
      <section className="analytics-main-grid">
        <div className="card productivity-chart">
          <div className="card-heading">
            <div>
              <span className="overline">
                {period === "week" ? copy.week.toUpperCase() : copy.month.toUpperCase()}
              </span>
              <h2>{copy.trend}</h2>
            </div>
            <span className="trend">
              <TrendingUp size={14} /> +18%
            </span>
          </div>
          <div className="bar-chart">
            {chartData.map((value, index) => (
              <div className="bar-column" key={index}>
                <div>
                  <span style={{ height: `${(value / Math.max(...chartData)) * 100}%` }}>
                    <i>{value}</i>
                  </span>
                </div>
                <small>{chartLabels[index]}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="score-card">
          <div className="score-heading">
            <span>
              <Sparkles size={18} />
            </span>
            <div>
              <small>DOOTY</small>
              <h2>{copy.score}</h2>
            </div>
          </div>
          <div className="score-ring" style={{ "--score": `${score}%` } as React.CSSProperties}>
            <div>
              <strong>{score}</strong>
              <span>/ 100</span>
            </div>
          </div>
          <p>{copy.scoreText}</p>
          <div className="score-rate">
            <span>{copy.rate}</span>
            <strong>{rate}%</strong>
          </div>
        </div>
      </section>
      <section className="analytics-lower-grid">
        <div className="card category-chart">
          <div className="card-heading">
            <div>
              <span className="overline">{language === "fr" ? "RÉPARTITION" : "BREAKDOWN"}</span>
              <h2>{copy.categories}</h2>
            </div>
          </div>
          <div className="category-bars">
            {categoryCounts.map((item, index) => (
              <div key={item.category}>
                <div>
                  <span>{item.category}</span>
                  <strong>{item.count}</strong>
                </div>
                <div className={`category-track category-${index}`}>
                  <span
                    style={{
                      width: `${(item.count / Math.max(...categoryCounts.map((entry) => entry.count))) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card project-analytics">
          <div className="card-heading">
            <div>
              <span className="overline">{language === "fr" ? "PORTEFEUILLE" : "PORTFOLIO"}</span>
              <h2>{copy.projects}</h2>
            </div>
          </div>
          <div>
            {projects.map((project) => {
              const progress = projectProgress(project);
              return (
                <div className="analytics-project" key={project.id}>
                  <span
                    className="project-icon"
                    style={{ color: project.color, background: `${project.color}18` }}
                  >
                    {project.emoji}
                  </span>
                  <div>
                    <div>
                      <strong>{project.name}</strong>
                      <span>{progress}%</span>
                    </div>
                    <div className="project-progress">
                      <span style={{ width: `${progress}%`, background: project.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfilePage({
  profile,
  language,
  onSave,
}: {
  profile: Profile;
  language: "fr" | "en";
  onSave: (profile: Profile) => void;
}) {
  const [form, setForm] = useState(profile);
  useEffect(() => {
  setForm(profile);
}, [profile]);
  const [passwords, setPasswords] = useState({ current: "", next: "", confirm: "" });
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState("");
  const copy =
    language === "fr"
      ? {
          eyebrow: "COMPTE PERSONNEL",
          title: "Mon profil",
          subtitle: "Gérez vos informations personnelles et la sécurité de votre compte.",
          photo: "Photo de profil",
          photoText: "JPG ou PNG, 1 Mo maximum.",
          change: "Changer la photo",
          info: "Informations personnelles",
          first: "Prénom",
          last: "Nom",
          email: "Adresse email",
          save: "Enregistrer les modifications",
          security: "Sécurité",
          current: "Mot de passe actuel",
          next: "Nouveau mot de passe",
          confirm: "Confirmer le mot de passe",
          update: "Mettre à jour le mot de passe",
          account: "Compte créé le",
        }
      : {
          eyebrow: "PERSONAL ACCOUNT",
          title: "My profile",
          subtitle: "Manage your personal details and account security.",
          photo: "Profile picture",
          photoText: "JPG or PNG, up to 1 MB.",
          change: "Change picture",
          info: "Personal information",
          first: "First name",
          last: "Last name",
          email: "Email address",
          save: "Save changes",
          security: "Security",
          current: "Current password",
          next: "New password",
          confirm: "Confirm password",
          update: "Update password",
          account: "Account created on",
        };
  const uploadAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 1024 * 1024) {
      setProfileError(
        language === "fr"
          ? "Choisissez une image de moins de 1 Mo."
          : "Choose an image under 1 MB.",
      );
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, avatar: String(reader.result) }));
    reader.onerror = () =>
      setProfileError(
        language === "fr" ? "Impossible de lire cette image." : "Unable to read this image.",
      );
    reader.readAsDataURL(file);
  };
  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    if (form.firstName.trim().length < 2 || form.lastName.trim().length < 2)
      return setProfileError(
        language === "fr"
          ? "Le prénom et le nom doivent contenir au moins 2 caractères."
          : "First and last name must contain at least 2 characters.",
      );
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return setProfileError(
        language === "fr" ? "Saisissez une adresse email valide." : "Enter a valid email address.",
      );
    setProfileError("");
    onSave(form);
    setSuccess(language === "fr" ? "Profil mis à jour." : "Profile updated.");
  };
  const changePassword = (event: FormEvent) => {
    event.preventDefault();
    if (!passwords.current)
      return setPasswordError(
        language === "fr" ? "Saisissez votre mot de passe actuel." : "Enter your current password.",
      );
    if (passwords.next.length < 8)
      return setPasswordError(
        language === "fr"
          ? "Le nouveau mot de passe doit contenir au moins 8 caractères."
          : "The new password must be at least 8 characters.",
      );
    if (passwords.next !== passwords.confirm)
      return setPasswordError(
        language === "fr" ? "Les mots de passe ne correspondent pas." : "Passwords do not match.",
      );
    setPasswordError("");
    setPasswords({ current: "", next: "", confirm: "" });
    setSuccess(
      language === "fr" ? "Mot de passe mis à jour localement." : "Password updated locally.",
    );
  };

  return (
    <div className="page profile-page">
      <section className="page-title-row">
        <div>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{copy.title}</h1>
          <p className="subtitle">{copy.subtitle}</p>
        </div>
      </section>
      {success && (
        <div className="success-banner">
          <CheckCircle2 size={16} />
          {success}
          <button onClick={() => setSuccess("")}>
            <X size={14} />
          </button>
        </div>
      )}
      <div className="profile-layout">
        <aside className="card profile-photo-card">
          <div className="profile-avatar-large">
            {form.avatar ? (
              <img src={form.avatar} alt="" />
            ) : (
              <span>
                {form.firstName[0]}
                {form.lastName[0]}
              </span>
            )}
            <label>
              <Camera size={16} />
              <input type="file" accept="image/*" onChange={uploadAvatar} />
            </label>
          </div>
          <h2>
            {form.firstName} {form.lastName}
          </h2>
          <p>{form.email}</p>
          <label className="secondary-button upload-button">
            <Upload size={15} />
            {copy.change}
            <input type="file" accept="image/*" onChange={uploadAvatar} />
          </label>
          <small>{copy.photoText}</small>
          <div className="account-date">
            <CalendarDays size={15} />
            <div>
              <span>{copy.account}</span>
              <strong>{formatDate(profile.createdAt)}</strong>
            </div>
          </div>
        </aside>
        <div className="profile-forms">
          <form className="card profile-form-card" onSubmit={saveProfile}>
            <div className="settings-section-title">
              <span>
                <UserRound size={18} />
              </span>
              <div>
                <h2>{copy.info}</h2>
                <p>
                  {language === "fr"
                    ? "Ces informations sont visibles dans votre espace Dooty."
                    : "This information is visible in your Dooty workspace."}
                </p>
              </div>
            </div>
            <div className="form-grid">
              <label className="field">
                <span>{copy.first}</span>
                <input
                  value={form.firstName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, firstName: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>{copy.last}</span>
                <input
                  value={form.lastName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, lastName: event.target.value }))
                  }
                />
              </label>
              <label className="field full">
                <span>{copy.email}</span>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, email: event.target.value }))
                    }
                  />
                </div>
              </label>
            </div>
            {profileError && (
              <div className="form-error">
                <CircleAlert size={15} />
                {profileError}
              </div>
            )}
            <div className="profile-form-actions">
              <button className="primary-button">
                <Check size={16} />
                {copy.save}
              </button>
            </div>
          </form>
          <form className="card profile-form-card" onSubmit={changePassword}>
            <div className="settings-section-title">
              <span>
                <ShieldCheck size={18} />
              </span>
              <div>
                <h2>{copy.security}</h2>
                <p>
                  {language === "fr"
                    ? "Utilisez un mot de passe unique et difficile à deviner."
                    : "Use a unique password that is hard to guess."}
                </p>
              </div>
            </div>
            <div className="form-grid">
              <label className="field full">
                <span>{copy.current}</span>
                <div className="input-with-icon">
                  <LockKeyhole size={16} />
                  <input
                    type="password"
                    value={passwords.current}
                    onChange={(event) =>
                      setPasswords((current) => ({ ...current, current: event.target.value }))
                    }
                  />
                </div>
              </label>
              <label className="field">
                <span>{copy.next}</span>
                <input
                  type="password"
                  value={passwords.next}
                  onChange={(event) =>
                    setPasswords((current) => ({ ...current, next: event.target.value }))
                  }
                />
              </label>
              <label className="field">
                <span>{copy.confirm}</span>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(event) =>
                    setPasswords((current) => ({ ...current, confirm: event.target.value }))
                  }
                />
              </label>
            </div>
            {passwordError && (
              <div className="form-error">
                <CircleAlert size={15} />
                {passwordError}
              </div>
            )}
            <div className="profile-form-actions">
              <button className="secondary-button">
                <LockKeyhole size={15} />
                {copy.update}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const backgroundOptions = [
  {
    id: "pink",
    label: "Pink aesthetic",
    value: "linear-gradient(135deg, #fff7fa 0%, #f8edf6 55%, #f4efff 100%)",
  },
  {
    id: "beige",
    label: "Beige minimal",
    value: "linear-gradient(135deg, #fbfaf6 0%, #f0ece3 100%)",
  },
  {
    id: "lavender",
    label: "Lavender",
    value: "linear-gradient(135deg, #f9f7ff 0%, #ede8fb 55%, #f8f5ff 100%)",
  },
  {
    id: "nature",
    label: "Nature",
    value: "linear-gradient(135deg, #f5faf6 0%, #e1eee5 50%, #edf5ef 100%)",
  },
  {
    id: "sky",
    label: "Sky",
    value: "linear-gradient(135deg, #f5fbff 0%, #dfeffc 55%, #f4f8ff 100%)",
  },
  {
    id: "dark",
    label: "Dark aesthetic",
    value: "linear-gradient(135deg, #24202d 0%, #17151d 100%)",
  },
];

function SettingsPage({
  preferences,
  onChange,
}: {
  preferences: Preferences;
  onChange: (preferences: Preferences) => void;
}) {
  const fr = preferences.language === "fr";
  const update = <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
    onChange({ ...preferences, [key]: value });
  const uploadBackground = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 1.5 * 1024 * 1024) return;
    const reader = new FileReader();
    reader.onload = () =>
      onChange({ ...preferences, background: "custom", customBackground: String(reader.result) });
    reader.readAsDataURL(file);
  };
  return (
    <div className="page settings-page">
      <section className="page-title-row">
        <div>
          <p className="eyebrow">{fr ? "PRÉFÉRENCES" : "PREFERENCES"}</p>
          <h1>{fr ? "Paramètres" : "Settings"}</h1>
          <p className="subtitle">
            {fr
              ? "Personnalisez Dooty selon votre façon de travailler."
              : "Customize Dooty to match the way you work."}
          </p>
        </div>
      </section>
      <div className="settings-stack">
        <section className="card settings-card">
          <div className="settings-section-title">
            <span>
              <Languages size={18} />
            </span>
            <div>
              <h2>{fr ? "Langue" : "Language"}</h2>
              <p>
                {fr
                  ? "Choisissez la langue utilisée dans votre espace."
                  : "Choose the language used in your workspace."}
              </p>
            </div>
          </div>
          <div className="segmented-options">
            <button
              className={preferences.language === "fr" ? "active" : ""}
              onClick={() => update("language", "fr")}
            >
              <span>FR</span>
              <div>
                <strong>Français</strong>
                <small>France</small>
              </div>
              {preferences.language === "fr" && <Check size={16} />}
            </button>
            <button
              className={preferences.language === "en" ? "active" : ""}
              onClick={() => update("language", "en")}
            >
              <span>EN</span>
              <div>
                <strong>English</strong>
                <small>International</small>
              </div>
              {preferences.language === "en" && <Check size={16} />}
            </button>
          </div>
        </section>
        <section className="card settings-card">
          <div className="settings-section-title">
            <span>
              <Sparkles size={18} />
            </span>
            <div>
              <h2>{fr ? "Apparence" : "Appearance"}</h2>
              <p>
                {fr
                  ? "Adaptez les couleurs et l'ambiance de l'application."
                  : "Adjust the colors and mood of the application."}
              </p>
            </div>
          </div>
          <span className="settings-label">{fr ? "THÈME" : "THEME"}</span>
          <div className="theme-options">
            <button
              className={preferences.theme === "light" ? "active" : ""}
              onClick={() => update("theme", "light")}
            >
              <span className="theme-preview light-preview">
                <i />
                <i />
                <i />
              </span>
              <strong>{fr ? "Clair" : "Light"}</strong>
              {preferences.theme === "light" && <CheckCircle2 size={17} />}
            </button>
            <button
              className={preferences.theme === "dark" ? "active" : ""}
              onClick={() => update("theme", "dark")}
            >
              <span className="theme-preview dark-preview">
                <i />
                <i />
                <i />
              </span>
              <strong>{fr ? "Sombre" : "Dark"}</strong>
              {preferences.theme === "dark" && <CheckCircle2 size={17} />}
            </button>
          </div>
          <span className="settings-label">{fr ? "ARRIÈRE-PLAN" : "BACKGROUND"}</span>
          <div className="background-gallery">
            {backgroundOptions.map((option) => (
              <button
                key={option.id}
                className={preferences.background === option.id ? "active" : ""}
                onClick={() => update("background", option.id)}
              >
                <span style={{ background: option.value }}>
                  {preferences.background === option.id && <Check size={17} />}
                </span>
                <strong>{option.label}</strong>
              </button>
            ))}
            <label
              className={`custom-background ${preferences.background === "custom" ? "active" : ""}`}
            >
              <span
                style={
                  preferences.customBackground
                    ? { backgroundImage: `url(${preferences.customBackground})` }
                    : undefined
                }
              >
                {preferences.customBackground ? (
                  preferences.background === "custom" && <Check size={17} />
                ) : (
                  <Image size={20} />
                )}
              </span>
              <strong>{fr ? "Image personnalisée" : "Custom image"}</strong>
              <input type="file" accept="image/*" onChange={uploadBackground} />
            </label>
          </div>
        </section>
        <section className="card settings-card">
          <div className="settings-section-title">
            <span>
              <BellRing size={18} />
            </span>
            <div>
              <h2>{fr ? "Notifications" : "Notifications"}</h2>
              <p>
                {fr
                  ? "Contrôlez les alertes que vous souhaitez recevoir."
                  : "Control the alerts you want to receive."}
              </p>
            </div>
          </div>
          <div className="preference-row">
            <div>
              <strong>{fr ? "Notifications générales" : "General notifications"}</strong>
              <span>{fr ? "Activité des tâches et projets." : "Task and project activity."}</span>
            </div>
            <button
              className={`toggle ${preferences.notifications ? "on" : ""}`}
              onClick={() => update("notifications", !preferences.notifications)}
              aria-label="Toggle notifications"
            >
              <i />
            </button>
          </div>
          <div className="preference-row">
            <div>
              <strong>{fr ? "Rappels d'échéance" : "Deadline reminders"}</strong>
              <span>
                {fr
                  ? "Alertes avant la date limite d'une tâche."
                  : "Alerts before a task deadline."}
              </span>
            </div>
            <button
              className={`toggle ${preferences.reminders ? "on" : ""}`}
              onClick={() => update("reminders", !preferences.reminders)}
              aria-label="Toggle reminders"
            >
              <i />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function DootyApp() {
  const { user } = useAuth();
  const [page, setPage] = useState<Page>("Overview");
  const [tasks, setTasks] = useState(initialTasks);
  const [projects, setProjects] = useState(initialProjects);
  //const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile>(() => {
    const fallback = {
  firstName: user?.nom ? user.nom.split(' ')[0] : "Utilisateur",
  lastName: user?.nom ? user.nom.split(' ').slice(1).join(' ') : "",
  email: user?.email || "email@inconnu.com",
  createdAt: new Date().toISOString(),
};
    try {
      return JSON.parse(localStorage.getItem("dooty-profile") || "null") || fallback;
    } catch {
      return fallback;
    }
  });
  const [preferences, setPreferences] = useState<Preferences>(() => {
    const fallback: Preferences = {
      language: "fr",
      theme: "light",
      background: "lavender",
      notifications: true,
      reminders: true,
    };
    try {
      return JSON.parse(localStorage.getItem("dooty-preferences") || "null") || fallback;
    } catch {
      return fallback;
    }
  });
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 1,
      type: "deadline",
      title: "Échéance aujourd'hui",
      description: "Finaliser la présentation client doit être terminé aujourd'hui.",
      date: "Il y a 12 min",
      read: false,
    },
    {
      id: 2,
      type: "overdue",
      title: "Tâche en retard",
      description: "Une tâche prioritaire nécessite votre attention.",
      date: "Il y a 1 h",
      read: false,
    },
    {
      id: 3,
      type: "completed",
      title: "Tâche terminée",
      description: "Envoyer le compte-rendu a été marqué comme terminé.",
      date: "Hier, 17:42",
      read: true,
    },
    {
      id: 4,
      type: "project",
      title: "Rappel de projet",
      description: "Le projet Portfolio 2025 arrive à échéance dans quelques semaines.",
      date: "Hier, 09:15",
      read: false,
    },
    {
      id: 5,
      type: "deadline",
      title: "Échéance à venir",
      description: "Planifier le sprint de juin est prévu pour le 29 mai.",
      date: "25 mai",
      read: true,
    },
  ]);
  const [moodsByDate, setMoodsByDate] = useState<Record<string, string>>({
    "2025-05-24": "🔥",
    "2025-05-25": "🌸",
    "2025-05-27": "😊",
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null | undefined>(undefined);
  const [taskDefaults, setTaskDefaults] = useState<{ dueDate?: string; projectId?: number }>({});
  const [viewing, setViewing] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState<Task | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null | undefined>(undefined);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("dooty-preferences", JSON.stringify(preferences));
    } catch {
      // Keep the active preference in memory if browser storage is full.
    }
    document.documentElement.lang = preferences.language;
  }, [preferences]);
  useEffect(() => {
    try {
      localStorage.setItem("dooty-profile", JSON.stringify(profile));
    } catch {
      // Keep the active profile in memory if browser storage is full.
    }
  }, [profile]);
  useEffect(() => {
    if (preferences.language !== "en") return;
    const root = document.querySelector<HTMLElement>(".app-shell");
    if (!root) return;
    translateInterface(root);
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "characterData" && mutation.target.parentElement) {
          translateInterface(mutation.target.parentElement);
        }
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) translateInterface(node);
          else if (node.nodeType === Node.TEXT_NODE && node.parentElement)
            translateInterface(node.parentElement);
        });
      });
    });
    observer.observe(root, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [preferences.language]);

  const selectedBackground =
    preferences.background === "custom" && preferences.customBackground
      ? `url(${preferences.customBackground}) center / cover fixed`
      : backgroundOptions.find((option) => option.id === preferences.background)?.value;

  const openCreate = (dueDate?: string, projectId?: number) => {
    setTaskDefaults({ dueDate, projectId });
    setEditing(null);
  };
  const openEdit = (task: Task) => {
    setTaskDefaults({});
    setEditing(task);
  };
  const saveTask = (values: Omit<Task, "id" | "createdAt">) => {
    if (editing)
      setTasks((current) =>
        current.map((task) => (task.id === editing.id ? { ...task, ...values } : task)),
      );
    else
      setTasks((current) => [
        { ...values, id: Date.now(), createdAt: new Date().toISOString().slice(0, 10) },
        ...current,
      ]);
    setEditing(undefined);
  };
  const saveProject = (values: Omit<Project, "id">) => {
    if (editingProject)
      setProjects((current) =>
        current.map((project) =>
          project.id === editingProject.id ? { ...project, ...values } : project,
        ),
      );
    else setProjects((current) => [{ ...values, id: Date.now() }, ...current]);
    setEditingProject(undefined);
  };

  return (
    <div
      key={preferences.language}
      className={`app-shell ${preferences.theme === "dark" ? "dark-mode" : ""}`}
      style={{ "--app-background": selectedBackground } as React.CSSProperties}
    >
      <Sidebar
        active={page}
        onNavigate={setPage}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        language={preferences.language}
        profile={profile}
        unreadNotifications={
          preferences.notifications
            ? notifications.filter((notification) => !notification.read).length
            : 0
        }
      />
      <main className="main-content">
        <Header
          title={page}
          onMenu={() => setSidebarOpen(true)}
          language={preferences.language}
          profile={profile}
        />
        {page === "Overview" && (
          <Overview tasks={tasks} onCreate={openCreate} onTasks={() => setPage("Mes tâches")} />
        )}
        {page === "Mes tâches" && (
          <TasksPage
            tasks={tasks}
            onCreate={() => openCreate()}
            onEdit={openEdit}
            onView={setViewing}
            onDelete={setDeleting}
          />
        )}
        {page === "Calendrier" && (
          <CalendarPage
            tasks={tasks}
            moodsByDate={moodsByDate}
            onMoodChange={(date, mood) =>
              setMoodsByDate((current) => ({ ...current, [date]: mood }))
            }
            onCreate={(date) => openCreate(date)}
            onView={setViewing}
          />
        )}
        {page === "Mes projets" && (
          <ProjectsPage
            projects={projects}
            tasks={tasks}
            onCreate={() => setEditingProject(null)}
            onEdit={setEditingProject}
            onDelete={setDeletingProject}
            onCreateTask={(projectId) => openCreate(undefined, projectId)}
            onViewTask={setViewing}
          />
        )}
        {page === "Chatbot" && <ChatbotPage tasks={tasks} />}
        {page === "Notifications" && (
          <NotificationsPage
            notifications={preferences.notifications ? notifications : []}
            language={preferences.language}
            onRead={(id) =>
              setNotifications((current) =>
                current.map((item) => (item.id === id ? { ...item, read: true } : item)),
              )
            }
            onReadAll={() =>
              setNotifications((current) => current.map((item) => ({ ...item, read: true })))
            }
            onDelete={(id) =>
              setNotifications((current) => current.filter((item) => item.id !== id))
            }
          />
        )}
        {page === "Statistiques" && (
          <StatisticsPage tasks={tasks} projects={projects} language={preferences.language} />
        )}
        {page === "Mon profil" && (
          <ProfilePage profile={profile} language={preferences.language} onSave={setProfile} />
        )}
        {page === "Paramètres" && (
          <SettingsPage preferences={preferences} onChange={setPreferences} />
        )}
      </main>
      {editing !== undefined && (
        <TaskModal
          task={editing}
          initialDueDate={taskDefaults.dueDate}
          initialProjectId={taskDefaults.projectId}
          projects={projects}
          onClose={() => setEditing(undefined)}
          onSave={saveTask}
        />
      )}
      {viewing && (
        <TaskDetails
          task={viewing}
          onClose={() => setViewing(null)}
          onEdit={() => {
            openEdit(viewing);
            setViewing(null);
          }}
        />
      )}
      {deleting && (
        <ConfirmDelete
          task={deleting}
          onClose={() => setDeleting(null)}
          onConfirm={() => {
            setTasks((current) => current.filter((task) => task.id !== deleting.id));
            setDeleting(null);
          }}
        />
      )}
      {editingProject !== undefined && (
        <ProjectModal
          project={editingProject}
          onClose={() => setEditingProject(undefined)}
          onSave={saveProject}
        />
      )}
      {deletingProject && (
        <div className="modal-layer">
          <div className="modal confirm-modal">
            <div className="danger-icon">
              <Trash2 size={22} />
            </div>
            <h2>Supprimer ce projet ?</h2>
            <p>
              « {deletingProject.name} » sera supprimé. Les tâches associées seront conservées dans
              Mes tâches.
            </p>
            <div className="modal-actions">
              <button className="secondary-button" onClick={() => setDeletingProject(null)}>
                Annuler
              </button>
              <button
                className="danger-button"
                onClick={() => {
                  setProjects((current) =>
                    current.filter((project) => project.id !== deletingProject.id),
                  );
                  setTasks((current) =>
                    current.map((task) =>
                      task.projectId === deletingProject.id
                        ? { ...task, projectId: undefined }
                        : task,
                    ),
                  );
                  setDeletingProject(null);
                }}
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
