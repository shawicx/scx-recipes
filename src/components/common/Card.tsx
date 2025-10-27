import React from "react";
import { Card as HeroUICard, CardFooter, Button } from "@heroui/react";

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: string;
  variant?: "default" | "highlight" | "success" | "warning" | "error";
}

const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  icon,
  children,
  className = "",
  actions,
  loading = false,
  error,
  variant = "default",
}) => {
  const variantClass = variant === "highlight" ? "border-primary" : 
                     variant === "success" ? "border-success" : 
                     variant === "warning" ? "border-warning" : 
                     variant === "error" ? "border-danger" : "border-default";

  return (
    <HeroUICard 
      className={`${className} ${variantClass}`}
    >
      {(title || subtitle || icon || actions) && (
        <div className="flex items-start p-4 pb-2 border-b border-divider">
          <div className="flex items-start gap-3 flex-1">
            {icon && <span className="text-xl pt-1">{icon}</span>}
            <div className="flex-1">
              {title && <h3 className="text-xl font-semibold text-foreground">{title}</h3>}
              {subtitle && <p className="text-sm text-foreground-500">{subtitle}</p>}
            </div>
            {actions && <CardFooter className="p-0">{actions}</CardFooter>}
          </div>
        </div>
      )}

      <div className="p-6 pt-4">
        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-3"></div>
            <p>加载中...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-8 text-danger">
            <span className="text-3xl mb-2">⚠️</span>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && children}
      </div>
    </HeroUICard>
  );
};

// 专用卡片组件
export const StatsCard: React.FC<{
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: string;
}> = ({ title, value, change, changeType = "neutral", icon }) => {
  const changeColor = changeType === "positive" ? "text-success" : 
                    changeType === "negative" ? "text-danger" : "text-foreground-500";

  return (
    <HeroUICard className="p-4">
      <div className="flex items-center gap-4">
        <div className="text-3xl p-3 bg-primary/10 rounded-lg">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-sm text-foreground-500">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <p className={`text-xs ${changeColor}`}>
              {changeType === "positive" && "↗️"}
              {changeType === "negative" && "↘️"}
              {changeType === "neutral" && "➖"}
              {change}
            </p>
          )}
        </div>
      </div>
    </HeroUICard>
  );
};

export const ActionCard: React.FC<{
  title: string;
  description: string;
  icon: string;
  action: () => void;
  actionLabel: string;
  disabled?: boolean;
}> = ({ title, description, icon, action, actionLabel, disabled = false }) => {
  return (
    <HeroUICard className="text-center">
      <div className="p-6">
        <div className="text-4xl mb-4">{icon}</div>
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <p className="text-foreground-500 mb-4">{description}</p>
        <Button 
          onClick={action} 
          disabled={disabled}
          className="w-full"
        >
          {actionLabel}
        </Button>
      </div>
    </HeroUICard>
  );
};

export default Card;
