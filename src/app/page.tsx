'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formattedSymptoms } from '@/lib/symptoms';
import { identifyDisease, IdentifyDiseaseOutput } from '@/ai/flows/disease-identification';
import { remedySuggestion, RemedySuggestionOutput } from '@/ai/flows/remedy-suggestion';
import { dietRecommendation, DietRecommendationOutput } from '@/ai/flows/diet-recommendation';
import { assessSeverity, AssessSeverityOutput } from '@/ai/flows/severity-assessment';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Stethoscope, Leaf, Loader2, ShieldCheck, Siren, Download } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

type SymptomState = {
  symptom1: string;
  symptom2: string;
  symptom3: string;
  symptom4: string;
};

type ResultsState = {
  disease: IdentifyDiseaseOutput;
  remedy: RemedySuggestionOutput;
  diet: DietRecommendationOutput;
  severity: AssessSeverityOutput;
};

const initialSymptoms: SymptomState = {
  symptom1: '',
  symptom2: '',
  symptom3: '',
  symptom4: '',
};

const CureAILogo = () => (
    <svg
      width="48"
      height="48"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className="h-10 w-10 md:h-12 md:w-12"
    >
      <defs>
        <linearGradient id="blue-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#A0D2EB', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#84C1E0', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="mint-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#BDECB6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#A8E6A0', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path
        d="M50 15C50 12.2386 52.2386 10 55 10H85C87.7614 10 90 12.2386 90 15V45C90 47.7614 87.7614 50 85 50H55C52.2386 50 50 47.7614 50 45V15Z"
        fill="url(#mint-gradient)"
        style={{ opacity: 0.8 }}
      />
      <path
        d="M15 50C12.2386 50 10 52.2386 10 55V85C10 87.7614 12.2386 90 15 90H45C47.7614 90 50 87.7614 50 85V55C50 52.2386 47.7614 50 45 50H15Z"
        fill="url(#blue-gradient)"
      />
      <path
        d="M15 50C12.2386 50 10 47.7614 10 45V15C10 12.2386 12.2386 10 15 10H45C47.7614 10 50 12.2386 50 15V45C50 47.7614 47.7614 50 45 50H15Z"
        fill="url(#blue-gradient)"
        style={{ opacity: 0.8 }}
      />
      <path
        d="M50 85C50 87.7614 52.2386 90 55 90H85C87.7614 90 90 87.7614 90 85V55C90 52.2386 87.7614 50 85 50H55C52.2386 50 50 52.2386 50 55V85Z"
        fill="url(#mint-gradient)"
      />
    </svg>
  );

export default function Home() {
  const [symptoms, setSymptoms] = useState<SymptomState>(initialSymptoms);
  const [results, setResults] = useState<ResultsState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSymptomChange = (key: keyof SymptomState, value: string) => {
    setSymptoms((prev) => ({ ...prev, [key]: value }));
  };

  const handleExportPdf = () => {
    const reportElement = document.getElementById('pdf-report');
    if (!reportElement) return;

    reportElement.style.display = 'block';

    html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    }).then((canvas) => {
      reportElement.style.display = 'none';

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const imgWidth = pdfWidth - 20;
      const imgHeight = imgWidth / ratio;

      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      const date = new Date().toISOString().split('T')[0];
      pdf.save(`health-check-${date}.pdf`);
    });
  };


  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedSymptoms = Object.values(symptoms).filter((s) => s);
    if (selectedSymptoms.length < 3) {
      toast({
        variant: 'destructive',
        title: 'Incomplete Information',
        description: 'Please select at least three symptoms before submitting.',
      });
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      // Pad empty symptoms for the AI model
      const diseaseInput = {
        symptom1: symptoms.symptom1 || 'none',
        symptom2: symptoms.symptom2 || 'none',
        symptom3: symptoms.symptom3 || 'none',
        symptom4: symptoms.symptom4 || 'none',
        symptom5: 'none', // The model expects 5 symptoms
      };

      const diseaseResult = await identifyDisease(diseaseInput);
      
      const [remedyResult, dietResult, severityResult] = await Promise.all([
        remedySuggestion({ disease: diseaseResult.disease, symptoms: selectedSymptoms }),
        dietRecommendation({ disease: diseaseResult.disease }),
        assessSeverity({ disease: diseaseResult.disease, symptoms: selectedSymptoms }),
      ]);

      setResults({
        disease: diseaseResult,
        remedy: remedyResult,
        diet: dietResult,
        severity: severityResult,
      });
    } catch (error) {
      console.error('AI processing failed:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityClass = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'severe':
        return 'text-destructive';
      case 'moderate':
        return 'text-orange-500';
      case 'mild':
        return 'text-yellow-500';
      default:
        return 'text-muted-foreground';
    }
  };

  const renderDietHtml = (markdown: string) => {
    // This is a simplified markdown-to-html converter.
    // For more complex needs, a library like 'marked' or 'react-markdown' would be better.
    return markdown
      .replace(/^##\s*(.*$)/gim, '<h3 class="font-semibold text-lg mb-2 mt-4">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\s*\*\s/g, '<ul><li class="list-disc ml-5">')
      .replace(/(\<\/ul\>)?\n\s*\*\s/g, '</li><li class="list-disc ml-5">')
      .replace(/<\/li><\/ul>/, '</li></ul>')
      .replace(/\n/g, '<br />')
      .replace(/<br \/><ul>/g, '<ul>')
      .replace(/<\/li><br \/>/g, '</li>');
  };

  const renderMarkdownList = (markdown: string) => {
    const listItems = markdown.split('\n').filter(item => item.startsWith('*')).map(item => item.substring(1).trim());
    return (
      <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
        {listItems.map((item, index) => (
          <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        ))}
      </ul>
    );
  };


  return (
    <div className="flex flex-col min-h-screen bg-background font-body text-foreground">
      <header className="container mx-auto px-4 py-8 md:py-12 relative">
        <div className="text-center">
            <div className='flex items-center justify-center gap-3'>
              <CureAILogo />
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                CureAI
              </h1>
            </div>
            <p className="mt-2 text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Your AI-powered guide for preliminary health insights. Select your primary symptoms to begin.
            </p>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 pb-12">
        <Card className="shadow-lg border-none rounded-xl bg-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Symptom Selector</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(Object.keys(symptoms) as Array<keyof SymptomState>).map((key, index) => (
                  <div key={key} className="flex flex-col space-y-1.5">
                    <label htmlFor={key} className="font-medium text-sm text-muted-foreground">Symptom {index + 1}</label>
                    <Select onValueChange={(value) => handleSymptomChange(key, value)} value={symptoms[key]}>
                      <SelectTrigger id={key} className="w-full bg-background border-border rounded-lg focus:ring-ring focus:ring-2">
                        <SelectValue placeholder="Select a symptom" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {formattedSymptoms.map((symptom) => (
                          <SelectItem key={symptom.value} value={symptom.value} disabled={Object.values(symptoms).includes(symptom.value) && symptoms[key] !== symptom.value}>
                            {symptom.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <Button type="submit" disabled={isLoading} size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Analyzing...' : 'Get Health Insights'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-8">
          {isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-3 rounded-xl"><CardHeader><Skeleton className="h-8 w-3/4" /></CardHeader><CardContent><Skeleton className="h-24 w-full" /></CardContent></Card>
              <Card className="lg:col-span-1 rounded-xl"><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-36 w-full" /></CardContent></Card>
              <Card className="lg:col-span-2 rounded-xl"><CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader><CardContent><Skeleton className="h-36 w-full" /></CardContent></Card>
            </div>
          )}

          {results && !isLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-3 shadow-lg border-none bg-card rounded-xl">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                  <div className="bg-primary/20 p-3 rounded-lg mt-1"><Stethoscope className="h-6 w-6 text-primary-foreground" /></div>
                  <div className='flex-1'>
                    <CardTitle className="text-xl font-bold">Potential Condition</CardTitle>
                    <p className="text-2xl font-semibold text-primary-foreground mt-2">{results.disease.disease}</p>
                    <p className="text-sm text-muted-foreground">Confidence: {(results.disease.confidence * 100).toFixed(0)}%</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold underline mb-2">Reasoning:</p>
                  <p className="text-base leading-relaxed">{results.disease.reasoning}</p>
                  <div className={cn("mt-4 flex items-center p-3 rounded-md", 
                      results.severity.severity.toLowerCase() === 'severe' ? 'bg-destructive/10' : 
                      results.severity.severity.toLowerCase() === 'moderate' ? 'bg-orange-500/10' : 'bg-yellow-500/10'
                    )}>
                      <Siren className={cn("h-5 w-5 mr-3", getSeverityClass(results.severity.severity))} />
                      <p className={cn("text-sm font-medium", getSeverityClass(results.severity.severity))}>
                        Likely {results.severity.severity.toLowerCase()} — Please consult a doctor if symptoms worsen.
                      </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1 shadow-lg border-none bg-card rounded-xl">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="bg-primary/20 p-3 rounded-lg"><ShieldCheck className="h-6 w-6 text-primary-foreground" /></div>
                  <CardTitle className="text-xl font-bold">Remedy Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
                    {results.remedy.remedies.map((remedy, index) => (
                      <li key={index}>{remedy}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 shadow-lg border-none bg-card rounded-xl">
                <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                  <div className="bg-primary/20 p-3 rounded-lg"><Leaf className="h-6 w-6 text-primary-foreground" /></div>
                  <CardTitle className="text-xl font-bold">Diet Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderMarkdownList(results.diet.dietRecommendation)}
                </CardContent>
              </Card>
            </div>
          )}

          {!results && !isLoading && (
            <div className="text-center py-20 bg-card/50 rounded-lg">
              <p className="text-muted-foreground">Your health analysis will appear here.</p>
            </div>
          )}
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8">
        <Alert variant="destructive" className='bg-destructive/10 border-destructive/20 text-destructive rounded-lg'>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-destructive">Disclaimer</AlertTitle>
          <AlertDescription>
            This AI-powered tool is intended for informational purposes only and does not replace professional medical advice. Always consult a qualified healthcare professional regarding any medical concerns.
          </AlertDescription>
        </Alert>
        <div className="mt-8 text-center text-muted-foreground text-sm">
          <Separator className="my-6" />
          <p className="font-semibold text-foreground">CureAI – Symptom Analyser & Diet Planner</p>
          <p>Built with ❤️ using Google API, Tailwind CSS, and TypeScript.</p>
          <p>Hosting by Firebase. Authentication by Supabase.</p>
        </div>
      </footer>
      
      {results && !isLoading && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleExportPdf}
                className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg"
                size="icon"
              >
                <Download className="h-7 w-7" />
                <span className="sr-only">Export as PDF</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Export as PDF</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {results && (
        <div id="pdf-report" style={{ display: 'none', fontFamily: 'Poppins, sans-serif' }} className="p-10 bg-white text-black w-[800px]">
           <div className="p-8" style={{ fontFamily: 'Poppins, sans-serif', color: 'black' }}>
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold">Health Self-Check Report</h1>
                    <p className="text-sm text-gray-500">Generated on: {new Date().toLocaleString()}</p>
                </header>

                <div className="mb-8 p-4 border rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-2 underline">Selected Symptoms</h2>
                    <ul className="list-disc list-inside">
                        {Object.values(symptoms).filter(s => s).map((symptom, index) => (
                            <li key={index}>{formattedSymptoms.find(fs => fs.value === symptom)?.label}</li>
                        ))}
                    </ul>
                </div>

                <div className="space-y-6">
                    <div className="p-6 border rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold mb-2">Potential Condition</h2>
                        <p className="text-2xl font-semibold text-blue-600">{results.disease.disease}</p>
                        <p className="text-sm text-gray-500">Confidence: {(results.disease.confidence * 100).toFixed(0)}%</p>
                        <hr className="my-3"/>
                        <p className="font-semibold underline mb-2">Reasoning:</p>
                        <p className="text-base leading-relaxed">{results.disease.reasoning}</p>
                        <div className="mt-4 flex items-center p-3 rounded-md bg-gray-100">
                          <p className="text-sm font-medium">
                            Likely {results.severity.severity.toLowerCase()} — Please consult a doctor if symptoms worsen.
                          </p>
                        </div>
                    </div>

                    <div className="p-6 border rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold mb-2">Remedy Steps</h2>
                        <ul className="list-disc list-inside space-y-2">
                            {results.remedy.remedies.map((remedy, index) => (
                                <li key={index}>{remedy}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="p-6 border rounded-lg shadow-sm">
                        <h2 className="text-xl font-bold mb-2">Diet Recommendations</h2>
                        <div className="prose" dangerouslySetInnerHTML={{ __html: renderDietHtml(results.diet.dietRecommendation) }} />
                    </div>
                </div>

                <footer className="mt-8 pt-4 border-t text-center">
                    <p className="text-xs text-gray-500">For educational purposes only. Always consult a healthcare professional.</p>
                </footer>
            </div>
        </div>
      )}
    </div>
  );
}
