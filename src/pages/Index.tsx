import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { HomePage } from "@/components/HomePage";
import { CreateFlashcard } from "@/components/CreateFlashcard";
import { StudyMode } from "@/components/StudyMode";
import { Analytics } from "@/components/Analytics";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useToast } from "@/hooks/use-toast";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  mastered: boolean;
  reviewCount: number;
  lastReviewed?: Date;
}

type View = 'home' | 'create' | 'study' | 'analytics';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [flashcards, setFlashcards] = useLocalStorage<Flashcard[]>('flashmaster-cards', []);
  const { toast } = useToast();

  // Generate unique ID for new flashcards
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Get all existing tags for suggestions
  const existingTags = Array.from(
    new Set(flashcards.flatMap(card => card.tags))
  ).sort();

  // Handle flashcard creation
  const handleFlashcardCreate = (newCard: Omit<Flashcard, 'id'>) => {
    const flashcard: Flashcard = {
      ...newCard,
      id: generateId(),
    };
    
    setFlashcards(prev => [...prev, flashcard]);
    
    // Auto-navigate to study mode if this is the first card
    if (flashcards.length === 0) {
      setTimeout(() => {
        toast({
          title: "Ready to Study!",
          description: "Your first flashcard is ready. Let's start learning!",
        });
        setCurrentView('study');
      }, 1500);
    }
  };

  // Handle flashcard updates (mastered status, review count, etc.)
  const handleFlashcardUpdate = (updatedCard: Flashcard) => {
    setFlashcards(prev => 
      prev.map(card => 
        card.id === updatedCard.id ? updatedCard : card
      )
    );
  };

  // Handle view changes
  const handleViewChange = (view: View) => {
    setCurrentView(view);
  };

  // Parse dates from localStorage (they come back as strings)
  useEffect(() => {
    setFlashcards(prev => 
      prev.map(card => ({
        ...card,
        lastReviewed: card.lastReviewed ? new Date(card.lastReviewed) : undefined,
      }))
    );
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        currentView={currentView} 
        onViewChange={handleViewChange} 
      />
      
      <main>
        {currentView === 'home' && (
          <HomePage 
            flashcards={flashcards}
            onViewChange={handleViewChange}
          />
        )}
        
        {currentView === 'create' && (
          <CreateFlashcard 
            onFlashcardCreate={handleFlashcardCreate}
            existingTags={existingTags}
          />
        )}
        
        {currentView === 'study' && (
          <StudyMode 
            flashcards={flashcards}
            onFlashcardUpdate={handleFlashcardUpdate}
            onViewChange={handleViewChange}
          />
        )}
        
        {currentView === 'analytics' && (
          <Analytics flashcards={flashcards} />
        )}
      </main>
    </div>
  );
};

export default Index;
