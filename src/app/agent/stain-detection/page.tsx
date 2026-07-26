'use client'

import { useState } from "react";
import { Upload, AlertTriangle, CheckCircle, RefreshCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function StainDetectionPage() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [overrideMethod, setOverrideMethod] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(url);
      setResult(null); // Reset previous results
    }
  };

  const analyzeImage = () => {
    setAnalyzing(true);
    // Mocking an AI API call delay
    setTimeout(() => {
      setAnalyzing(false);
      setResult({
        stainType: "Coffee / Tannin",
        confidence: 88,
        difficulty: "Medium",
        successEstimate: 85,
        recommendation: "Spot Treatment (Mild Acidic) + Wet Cleaning",
        warning: false,
      });
    }, 2500);
  };

  const handleSave = () => {
    alert("Analysis saved to pickup request successfully!");
    // Integration point to Supabase pickup_requests
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary dark:text-white mb-2">AI Stain Detection</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Upload a clear image of the garment stain to receive AI-assisted cleaning recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Upload Section */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle>Garment Image</CardTitle>
            <CardDescription>Upload photo of the affected area.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            
            {image ? (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square flex items-center justify-center">
                <img src={image} alt="Uploaded stain" className="object-contain max-h-full" />
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="absolute top-2 right-2 rounded-full shadow-md"
                  onClick={() => { setImage(null); setResult(null); }}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" /> Change
                </Button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl aspect-square flex flex-col items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer relative">
                <Upload className="w-10 h-10 mb-4 text-slate-400" />
                <span className="font-medium">Click to upload image</span>
                <span className="text-sm mt-1">JPG, PNG up to 5MB</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                />
              </div>
            )}

            <Button 
              className="w-full h-12 rounded-full" 
              disabled={!image || analyzing || result}
              onClick={analyzeImage}
            >
              {analyzing ? (
                <><RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
              ) : result ? (
                <><CheckCircle className="w-4 h-4 mr-2" /> Analysis Complete</>
              ) : (
                "Run AI Analysis"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>AI-generated insights and recommendations.</CardDescription>
          </CardHeader>
          <CardContent>
            {!result && !analyzing && (
              <div className="h-full min-h-[300px] flex items-center justify-center text-slate-400 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                Upload an image and run analysis to see results here.
              </div>
            )}
            
            {analyzing && (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-primary border border-slate-100 rounded-xl bg-slate-50 p-6 space-y-4">
                <RefreshCcw className="w-8 h-8 animate-spin text-accent" />
                <p className="font-medium animate-pulse">Processing image via Vision API...</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-500 mb-1">Likely Stain</p>
                    <p className="font-bold text-primary dark:text-white">{result.stainType}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-500 mb-1">Confidence</p>
                    <p className="font-bold text-accent">{result.confidence}%</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-500 mb-1">Difficulty</p>
                    <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">{result.difficulty}</Badge>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-sm text-slate-500 mb-1">Est. Success</p>
                    <p className="font-bold text-primary dark:text-white">{result.successEstimate}%</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-accent/20 bg-accent/5">
                  <p className="text-sm font-semibold text-accent mb-2">AI Recommendation</p>
                  <p className="text-primary dark:text-white font-medium">{result.recommendation}</p>
                </div>

                <div className="space-y-3 pt-2 border-t">
                  <Label>Override Cleaning Method (Optional)</Label>
                  <Select value={overrideMethod} onValueChange={setOverrideMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select alternative method if needed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dry-cleaning">Dry Cleaning</SelectItem>
                      <SelectItem value="wet-cleaning">Wet Cleaning</SelectItem>
                      <SelectItem value="spot-treatment">Heavy Spot Treatment</SelectItem>
                      <SelectItem value="return">Cannot Clean (Return)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border flex gap-3 text-xs text-slate-500 items-start">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>This is an AI-assisted recommendation. Final inspection and cleaning decisions are made by trained professionals.</p>
                </div>

                <Button className="w-full rounded-full" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" /> Save to Request
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
