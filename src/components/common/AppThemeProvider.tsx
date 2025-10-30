import React from "react";
import { HeroUIProvider } from "@heroui/react";

interface AppThemeProviderProps {
  children: React.ReactNode;
}

// HeroUI使用HeroUIProvider作为其主题和全局配置提供者
export const AppThemeProvider: React.FC<AppThemeProviderProps> = ({
  children,
}) => {
  return (
    <HeroUIProvider>
      {children}
    </HeroUIProvider>
  );
};
