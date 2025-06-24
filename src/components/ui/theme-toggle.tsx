"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as Switch from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full" />
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Sun className="h-4 w-4" />
      <Switch.Root
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        className={cn(
          "w-11 h-6 bg-gray-200 rounded-full relative",
          "data-[state=checked]:bg-gray-800",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          "transition-colors duration-200"
        )}
      >
        <Switch.Thumb
          className={cn(
            "block w-5 h-5 bg-white rounded-full shadow-lg",
            "transform transition-transform duration-200",
            "translate-x-0.5 data-[state=checked]:translate-x-[22px]"
          )}
        />
      </Switch.Root>
      <Moon className="h-4 w-4" />
    </div>
  );
}