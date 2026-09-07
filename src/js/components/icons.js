// =============================================================
// APIForge X — Lucide icon registry (tree-shaken)
// Import only the icons the template uses and expose them as a
// PascalCase-keyed record for createIcons() (which maps data-lucide
// kebab names → PascalCase exports). Add new icons here as pages grow.
// =============================================================

import {
  Zap,
  Palette,
  Languages,
  LayoutDashboard,
  Code2,
  Key,
  Package,
  ScrollText,
  Webhook,
  AlertTriangle,
  Gauge,
  BarChart3,
  Users,
  CreditCard,
  Settings,
  SunMoon,
  ChevronDown,
  Menu,
  Search,
  Command,
  Bell,
  HelpCircle,
  Copy,
  Check,
  Plus,
  X,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Terminal,
  Clock,
  CircleCheck,
  RotateCcw,
  Trash2,
  MoreHorizontal,
  FlaskConical,
  AlertCircle,
  Info,
  BookOpen,
  Activity,
} from 'lucide';

import { createIcons } from 'lucide';

export const icons = {
  Zap,
  Palette,
  Languages,
  LayoutDashboard,
  Code2,
  Key,
  Package,
  ScrollText,
  Webhook,
  AlertTriangle,
  Gauge,
  BarChart3,
  Users,
  CreditCard,
  Settings,
  SunMoon,
  ChevronDown,
  Menu,
  Search,
  Command,
  Bell,
  HelpCircle,
  Copy,
  Check,
  Plus,
  X,
  Eye,
  EyeOff,
  TrendingUp,
  TrendingDown,
  Terminal,
  Clock,
  CircleCheck,
  RotateCcw,
  Trash2,
  MoreHorizontal,
  FlaskConical,
  AlertCircle,
  Info,
  BookOpen,
  Activity,
};

export function initIcons() {
  createIcons({ icons });
}

export { createIcons };
