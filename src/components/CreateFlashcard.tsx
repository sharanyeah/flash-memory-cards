import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Save, BookOpen } from "lucide-react";
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

interface CreateFlashcardProps {
  onFlashcardCreate: (flashcard: Omit<Flashcard, 'id'>) => void;
  existingTags: string[];
}

export const CreateFlashcard = ({ onFlashcardCreate, existingTags }: CreateFlashcardProps) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const { toast } = useToast();

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim() || !answer.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in both question and answer fields.",
        variant: "destructive",
      });
      return;
    }

    const newFlashcard = {
      question: question.trim(),
      answer: answer.trim(),
      tags,
      mastered: false,
      reviewCount: 0,
    };

    onFlashcardCreate(newFlashcard);
    
    toast({
      title: "Flashcard Created!",
      description: "Your new flashcard has been added to your collection.",
    });

    // Reset form
    setQuestion("");
    setAnswer("");
    setTags([]);
    setNewTag("");
  };

  const handleTagSuggestionClick = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Flashcard</h1>
          <p className="text-muted-foreground">
            Build your knowledge base with professional flashcards designed for effective learning
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Creation Form */}
          <Card className="flashcard">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary" />
                Flashcard Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Question Field */}
                <div className="space-y-2">
                  <Label htmlFor="question" className="text-sm font-medium">
                    Question *
                  </Label>
                  <Textarea
                    id="question"
                    placeholder="Enter your question here..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="form-field min-h-[100px] resize-none"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Make your question clear and specific for better learning outcomes.
                  </p>
                </div>

                {/* Answer Field */}
                <div className="space-y-2">
                  <Label htmlFor="answer" className="text-sm font-medium">
                    Answer *
                  </Label>
                  <Textarea
                    id="answer"
                    placeholder="Enter the answer here..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="form-field min-h-[120px] resize-none"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Provide a comprehensive answer that reinforces the learning concept.
                  </p>
                </div>

                {/* Tags Section */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Study Categories</Label>
                  
                  {/* Add New Tag */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add category (e.g., Math, JavaScript)..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                      className="form-field"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Current Tags */}
                  {tags.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Current categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Existing Tag Suggestions */}
                  {existingTags.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">Popular categories:</p>
                      <div className="flex flex-wrap gap-2">
                        {existingTags.slice(0, 6).map((tag) => (
                          <Button
                            key={tag}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleTagSuggestionClick(tag)}
                            disabled={tags.includes(tag)}
                            className="text-xs h-7"
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full btn-corporate"
                  disabled={!question.trim() || !answer.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Create Flashcard
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Preview Card */}
          <div className="space-y-6">
            <Card className="flashcard">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-accent" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Question Preview */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">QUESTION SIDE</Label>
                  <div className="bg-gradient-card border rounded-lg p-4 min-h-[100px] flex items-center justify-center">
                    <p className="text-center text-sm">
                      {question || "Your question will appear here..."}
                    </p>
                  </div>
                </div>

                {/* Answer Preview */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">ANSWER SIDE</Label>
                  <div className="bg-gradient-card border rounded-lg p-4 min-h-[120px] flex items-center justify-center">
                    <p className="text-center text-sm">
                      {answer || "Your answer will appear here..."}
                    </p>
                  </div>
                </div>

                {/* Tags Preview */}
                {tags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-muted-foreground">CATEGORIES</Label>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Study Tips */}
            <Card className="flashcard bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
              <CardHeader>
                <CardTitle className="text-lg text-accent">💡 Pro Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-accent font-medium">•</span>
                  <span>Use clear, specific questions for better retention</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent font-medium">•</span>
                  <span>Add relevant categories to organize your study materials</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent font-medium">•</span>
                  <span>Keep answers concise but comprehensive</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent font-medium">•</span>
                  <span>Review regularly for optimal learning outcomes</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
