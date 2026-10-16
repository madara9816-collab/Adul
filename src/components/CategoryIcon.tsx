import {
  Users, Heart, Sparkles, Zap, Coffee, Flame, Star,
  Globe, Sun, Moon, Eye, Gamepad2, Camera, BadgeCheck, Tag,
} from "lucide-react";
import type { ComponentType } from "react";

const ICON_MAP: Record<string, ComponentType<{ className?: string }>> = {
  Users, Heart, Sparkles, Zap, Coffee, Flame, Star,
  Globe, Sun, Moon, Eye, Gamepad2, Camera, BadgeCheck,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] || Tag;
  return <Icon className={className} />;
}
