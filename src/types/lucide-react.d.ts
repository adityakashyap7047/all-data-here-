declare module 'lucide-react' {
  export interface LucideIconProps {
    size?: number;
    color?: string;
    strokeWidth?: number;
    absoluteStrokeWidth?: boolean;
    className?: string;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    onClick?: React.MouseEventHandler<SVGSVGElement>;
    'aria-label'?: string;
    'data-testid'?: string;
  }

  export type LucideIcon = React.ForwardRefExoticComponent<
    LucideIconProps & React.RefAttributes<SVGSVGElement>
  >;

  export const Activity: LucideIcon;
  export const AlertCircle: LucideIcon;
  export const AlertTriangle: LucideIcon;
  export const ArrowUpRight: LucideIcon;
  export const CheckCircle: LucideIcon;
  export const ChevronDown: LucideIcon;
  export const ChevronUp: LucideIcon;
  export const Clock: LucideIcon;
  export const CreditCard: LucideIcon;
  export const ExternalLink: LucideIcon;
  export const Filter: LucideIcon;
  export const Loader2: LucideIcon;
  export const Mail: LucideIcon;
  export const MessageSquare: LucideIcon;
  export const MoreVertical: LucideIcon;
  export const Plus: LucideIcon;
  export const RefreshCw: LucideIcon;
  export const Rss: LucideIcon;
  export const Search: LucideIcon;
  export const Server: LucideIcon;
  export const ShoppingBag: LucideIcon;
  export const Trash2: LucideIcon;
  export const TrendingUp: LucideIcon;
  export const ToggleLeft: LucideIcon;
  export const ToggleRight: LucideIcon;
  export const Webhook: LucideIcon;
  export const XCircle: LucideIcon;
  export const Key: LucideIcon;
  export const Edit: LucideIcon;
}