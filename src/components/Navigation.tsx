import { Button } from "@/components/ui/button";
import { BookOpen, Plus, BarChart3, Settings } from "lucide-react";

interface NavigationProps {
  currentView: 'home' | 'create' | 'study' | 'analytics';
  onViewChange: (view: 'home' | 'create' | 'study' | 'analytics') => void;
}

export const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const navItems = [
    { id: 'home' as const, label: 'Home', icon: BookOpen },
    { id: 'create' as const, label: 'Create', icon: Plus },
    { id: 'study' as const, label: 'Study', icon: BarChart3 },
    { id: 'analytics' as const, label: 'Analytics', icon: Settings },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">FlashMaster Pro</span>
          </div>
          
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(item.id)}
                  className={currentView === item.id ? "btn-corporate" : ""}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};