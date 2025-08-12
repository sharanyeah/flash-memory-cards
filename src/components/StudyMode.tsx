import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  RotateCcw, 
  Check, 
  X, 
  Shuffle, 
  Filter,
  Brain,
  Target,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  mastered: boolean;
  reviewCount: number;
  lastReviewed?: Date;
}

interface StudyModeProps {
  flashcards: Flashcard[];
  onFlashcardUpdate: (flashcard: Flashcard) => void;
  onViewChange: (view: 'home') => void;
}

export const StudyMode = ({ flashcards, onFlashcardUpdate, onViewChange }: StudyModeProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useLocalStorage('study-current-index', 0);
  const [selectedTag, setSelectedTag] = useLocalStorage('study-selected-tag', 'all');
  const [reviewedCards, setReviewedCards] = useLocalStorage('study-reviewed-cards', new Set<string>());
  const [showMastered, setShowMastered] = useLocalStorage('study-show-mastered', false);
  const [studySession, setStudySession] = useLocalStorage('study-session', {
    startTime: Date.now(),
    cardsReviewed: 0,
    sessionProgress: {}
  });
  const { toast } = useToast();

  // Filter cards based on selected tag and mastered status
  const filteredCards = useMemo(() => {
    let cards = flashcards;
    
    if (selectedTag !== "all") {
      cards = cards.filter(card => card.tags.includes(selectedTag));
    }
    
    if (!showMastered) {
      cards = cards.filter(card => !card.mastered);
    }
    
    return cards;
  }, [flashcards, selectedTag, showMastered]);

  // Get all unique tags
  const allTags = useMemo(() => {
    const tags = flashcards.flatMap(card => card.tags);
    return Array.from(new Set(tags)).sort();
  }, [flashcards]);

  const currentCard = filteredCards[currentIndex];

  // Reset when filters change
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedTag, showMastered]);

  // Auto-advance on keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === ' ') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'm' && isFlipped) {
        e.preventDefault();
        handleMastered();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipped, currentIndex, currentCard]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleMastered = () => {
    if (!currentCard) return;
    
    const updatedCard = {
      ...currentCard,
      mastered: !currentCard.mastered,
      reviewCount: currentCard.reviewCount + 1,
      lastReviewed: new Date(),
    };
    
    onFlashcardUpdate(updatedCard);
    const newReviewedCards = new Set(reviewedCards);
    newReviewedCards.add(currentCard.id);
    setReviewedCards(newReviewedCards);
    
    // Update study session
    setStudySession(prev => ({
      ...prev,
      cardsReviewed: prev.cardsReviewed + 1,
      sessionProgress: {
        ...prev.sessionProgress,
        [currentCard.id]: {
          reviewedAt: Date.now(),
          mastered: !currentCard.mastered
        }
      }
    }));
    
    toast({
      title: currentCard.mastered ? "Card unmarked" : "Card mastered!",
      description: currentCard.mastered 
        ? "Keep studying this card" 
        : "Great progress! Moving to next card.",
    });

    if (!currentCard.mastered) {
      // Auto-advance to next card after marking as mastered
      setTimeout(() => {
        if (currentIndex < filteredCards.length - 1) {
          handleNext();
        }
      }, 1000);
    }
  };

  const handleShuffle = () => {
    // This is a simplified shuffle - in a real app you'd implement Fisher-Yates
    setCurrentIndex(Math.floor(Math.random() * filteredCards.length));
    setIsFlipped(false);
    
    toast({
      title: "Cards shuffled",
      description: "Jumping to a random card for varied practice.",
    });
  };

  const progressPercentage = filteredCards.length > 0 
    ? ((currentIndex + 1) / filteredCards.length) * 100 
    : 0;

  if (flashcards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="flashcard max-w-md mx-auto text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold">No Flashcards Available</h2>
            <p className="text-muted-foreground">
              Create some flashcards first to start your learning journey.
            </p>
            <Button onClick={() => onViewChange('home')} className="btn-corporate">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (filteredCards.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="flashcard max-w-md mx-auto text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 bg-gradient-success rounded-full flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold">All Cards Mastered!</h2>
            <p className="text-muted-foreground">
              Congratulations! You've mastered all cards in this category.
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                onClick={() => setShowMastered(true)} 
                variant="outline"
              >
                Review Mastered Cards
              </Button>
              <Button onClick={() => onViewChange('home')} className="btn-corporate">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="flashcard max-w-md mx-auto text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold">No Cards Available</h2>
            <p className="text-muted-foreground">
              Please check your filters or create more flashcards.
            </p>
            <Button onClick={() => onViewChange('home')} className="btn-corporate">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">Study Session</h1>
            <p className="text-muted-foreground">
              Press Space to flip • Arrow keys to navigate • M to mark mastered
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedTag} onValueChange={setSelectedTag}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShuffle}
              disabled={filteredCards.length <= 1}
            >
              <Shuffle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Progress</span>
            <span>{currentIndex + 1} of {filteredCards.length}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Flashcard */}
        <div className="perspective-1000 mb-8">
          <div 
            className={`flashcard-flip relative w-full h-96 cursor-pointer ${isFlipped ? 'flipped' : ''}`}
            onClick={handleFlip}
          >
            {/* Question Side */}
            <div className="flashcard-face flashcard bg-gradient-card border-2 rounded-2xl p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="outline" className="text-xs">Question</Badge>
                <div className="flex gap-1">
                  {currentCard.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg text-center leading-relaxed">
                  {currentCard.question}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Click or press Space to reveal answer
                </p>
              </div>
            </div>

            {/* Answer Side */}
            <div className="flashcard-face flashcard-back flashcard bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20 rounded-2xl p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <Badge className="text-xs bg-primary text-primary-foreground">Answer</Badge>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>Reviewed:</span>
                  <span>{currentCard.reviewCount}x</span>
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg text-center leading-relaxed">
                  {currentCard.answer}
                </p>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  How well did you know this?
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={currentIndex === filteredCards.length - 1}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {isFlipped && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleMastered}
                className={currentCard.mastered 
                  ? "border-warning text-warning hover:bg-warning/10" 
                  : "border-success text-success hover:bg-success/10"
                }
              >
                {currentCard.mastered ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Unmark
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Mastered
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Study Stats */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-border">
            <div className="text-lg font-semibold text-foreground">
              {reviewedCards instanceof Set ? reviewedCards.size : Object.keys(reviewedCards || {}).length}
            </div>
            <div className="text-xs text-muted-foreground">Reviewed Today</div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-border">
            <div className="text-lg font-semibold text-success">
              {flashcards.filter(c => c.mastered).length}
            </div>
            <div className="text-xs text-muted-foreground">Total Mastered</div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-border">
            <div className="text-lg font-semibold text-accent">
              {filteredCards.length - currentIndex - 1}
            </div>
            <div className="text-xs text-muted-foreground">Cards Remaining</div>
          </div>
          
          <div className="bg-white/50 dark:bg-black/20 rounded-lg p-3 border border-border">
            <div className="text-lg font-semibold text-primary">
              {Math.round(progressPercentage)}%
            </div>
            <div className="text-xs text-muted-foreground">Session Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
};