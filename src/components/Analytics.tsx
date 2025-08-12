import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Clock, 
  BookOpen,
  Brain,
  Award,
  Calendar
} from "lucide-react";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  tags: string[];
  mastered: boolean;
  reviewCount: number;
  lastReviewed?: Date;
}

interface AnalyticsProps {
  flashcards: Flashcard[];
}

export const Analytics = ({ flashcards }: AnalyticsProps) => {
  const analytics = useMemo(() => {
    const totalCards = flashcards.length;
    const masteredCards = flashcards.filter(card => card.mastered).length;
    const reviewedCards = flashcards.filter(card => card.reviewCount > 0).length;
    const totalReviews = flashcards.reduce((sum, card) => sum + card.reviewCount, 0);
    
    // Tag analytics
    const tagStats = flashcards.reduce((acc, card) => {
      card.tags.forEach(tag => {
        if (!acc[tag]) {
          acc[tag] = { total: 0, mastered: 0, reviews: 0 };
        }
        acc[tag].total++;
        if (card.mastered) acc[tag].mastered++;
        acc[tag].reviews += card.reviewCount;
      });
      return acc;
    }, {} as Record<string, { total: number; mastered: number; reviews: number }>);

    // Most studied cards
    const mostStudied = [...flashcards]
      .sort((a, b) => b.reviewCount - a.reviewCount)
      .slice(0, 5);

    // Recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = flashcards.filter(card => 
      card.lastReviewed && card.lastReviewed > sevenDaysAgo
    ).length;

    return {
      totalCards,
      masteredCards,
      reviewedCards,
      totalReviews,
      tagStats,
      mostStudied,
      recentActivity,
      completionRate: totalCards > 0 ? (masteredCards / totalCards) * 100 : 0,
      averageReviews: reviewedCards > 0 ? totalReviews / reviewedCards : 0,
    };
  }, [flashcards]);

  const topTags = Object.entries(analytics.tagStats)
    .sort(([,a], [,b]) => b.total - a.total)
    .slice(0, 6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Learning Analytics</h1>
          <p className="text-muted-foreground">
            Track your progress and optimize your study patterns with detailed insights
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="flashcard">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cards</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalCards}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.reviewedCards} reviewed
              </p>
            </CardContent>
          </Card>

          <Card className="flashcard">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mastery Rate</CardTitle>
              <Target className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(analytics.completionRate)}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.masteredCards} cards mastered
              </p>
            </CardContent>
          </Card>

          <Card className="flashcard">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <Brain className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalReviews}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.averageReviews.toFixed(1)} avg per card
              </p>
            </CardContent>
          </Card>

          <Card className="flashcard">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Calendar className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.recentActivity}</div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Subject Performance */}
          <Card className="flashcard">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Subject Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {topTags.length > 0 ? (
                topTags.map(([tag, stats]) => {
                  const completionRate = stats.total > 0 ? (stats.mastered / stats.total) * 100 : 0;
                  return (
                    <div key={tag} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-sm">
                          {tag}
                        </Badge>
                        <div className="text-right text-sm">
                          <div className="font-medium">{stats.mastered}/{stats.total}</div>
                          <div className="text-xs text-muted-foreground">
                            {stats.reviews} reviews
                          </div>
                        </div>
                      </div>
                      <Progress value={completionRate} className="h-2" />
                      <div className="text-xs text-muted-foreground text-right">
                        {Math.round(completionRate)}% mastered
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No subject data available yet.</p>
                  <p className="text-xs">Create flashcards with tags to see subject performance.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Most Studied Cards */}
          <Card className="flashcard">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" />
                Most Studied Cards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analytics.mostStudied.length > 0 ? (
                analytics.mostStudied.map((card, index) => (
                  <div key={card.id} className="flex items-start gap-3 p-3 bg-gradient-card rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {card.question}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {card.reviewCount} reviews
                        </span>
                        {card.mastered && (
                          <Badge variant="outline" className="text-xs border-success text-success">
                            <Award className="w-3 h-3 mr-1" />
                            Mastered
                          </Badge>
                        )}
                      </div>
                      {card.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {card.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {card.tags.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{card.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No study history yet.</p>
                  <p className="text-xs">Start studying to see your most reviewed cards.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Learning Insights */}
        {analytics.totalCards > 0 && (
          <Card className="flashcard mt-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-accent" />
                Learning Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {analytics.completionRate >= 80 && (
                  <div className="bg-gradient-success/10 border border-success/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-success" />
                      <span className="font-medium text-success">Excellent Progress!</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You've mastered {analytics.completionRate.toFixed(0)}% of your flashcards. Keep up the great work!
                    </p>
                  </div>
                )}

                {analytics.averageReviews > 3 && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <span className="font-medium text-primary">Dedicated Learner</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You average {analytics.averageReviews.toFixed(1)} reviews per card. Consistent practice leads to mastery!
                    </p>
                  </div>
                )}

                {analytics.recentActivity > 5 && (
                  <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-accent" />
                      <span className="font-medium text-accent">Active This Week</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      You've reviewed {analytics.recentActivity} cards this week. Great consistency!
                    </p>
                  </div>
                )}
              </div>

              {analytics.completionRate < 50 && analytics.totalCards > 3 && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-warning" />
                    <span className="font-medium text-warning">Room for Improvement</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Consider focusing on your existing cards before creating new ones. 
                    Mastering {analytics.totalCards - analytics.masteredCards} more cards will boost your completion rate significantly.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {analytics.totalCards === 0 && (
          <Card className="flashcard text-center py-12">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">No Analytics Available</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Create and study flashcards to see detailed analytics about your learning progress.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};