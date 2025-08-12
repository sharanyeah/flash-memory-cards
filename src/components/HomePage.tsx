import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Plus, Brain, TrendingUp, Clock, Target } from "lucide-react";


interface Flashcard {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  mastered: boolean;
  reviewCount: number;
  lastReviewed?: Date;
}

interface HomePageProps {
  flashcards: Flashcard[];
  onViewChange: (view: 'create' | 'study') => void;
}

export const HomePage = ({ flashcards, onViewChange }: HomePageProps) => {
  const totalCards = flashcards.length;
  const masteredCards = flashcards.filter(card => card.mastered).length;
  const progressPercentage = totalCards > 0 ? (masteredCards / totalCards) * 100 : 0;
  
  const recentCards = flashcards
    .filter(card => card.lastReviewed)
    .sort((a, b) => new Date(b.lastReviewed!).getTime() - new Date(a.lastReviewed!).getTime())
    .slice(0, 3);

  const popularTags = flashcards
    .flatMap(card => card.tags)
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const topTags = Object.entries(popularTags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-1 gap-12 items-center">
            <div className="space-y-8 text-center lg:text-left max-w-4xl mx-auto">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight">
                  Master Your
                  <span className="block bg-gradient-hero bg-clip-text text-transparent">
                    Knowledge
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto lg:mx-0">
                  Professional flashcard platform designed for efficient learning. 
                  Create, study, and track your progress with our corporate-grade tools.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="btn-corporate"
                  onClick={() => onViewChange('create')}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Flashcards
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => onViewChange('study')}
                  disabled={totalCards === 0}
                >
                  <Brain className="w-5 h-5 mr-2" />
                  Start Studying
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="flashcard">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCards}</div>
              <p className="text-xs text-muted-foreground">
                {totalCards === 0 ? "Create your first flashcard" : "Ready for study"}
              </p>
            </CardContent>
          </Card>
          
          <Card className="flashcard">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mastered</CardTitle>
              <Target className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{masteredCards}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round(progressPercentage)}% completion rate
              </p>
            </CardContent>
          </Card>
          
          <Card className="flashcard">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Days consecutive</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        {totalCards > 0 && (
          <Card className="flashcard mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{masteredCards}/{totalCards} cards mastered</span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
              
              {progressPercentage < 100 && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                  <p className="text-sm text-accent-foreground font-medium">
                    💡 You're {totalCards - masteredCards} cards away from mastery!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep studying to unlock your full potential.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Subject Tags */}
        {topTags.length > 0 && (
          <Card className="flashcard">
            <CardHeader>
              <CardTitle>Popular Study Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {topTags.map(([tag, count]) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                  >
                    {tag} ({count})
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {totalCards === 0 && (
          <Card className="flashcard text-center py-12">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Ready to start learning?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create your first flashcard to begin your professional learning journey. 
                  Our platform is designed to maximize your study efficiency.
                </p>
              </div>
              <Button 
                size="lg" 
                className="btn-corporate"
                onClick={() => onViewChange('create')}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Flashcard
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
};