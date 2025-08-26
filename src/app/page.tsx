import { Header } from '@/components/layout/header';
import { NewsTab } from '@/components/pages/news-tab';
import { CalculatorsTab } from '@/components/pages/calculators-tab';
import { EducationTab } from '@/components/pages/education-tab';
import { MarketHoursTab } from '@/components/pages/market-hours-tab';
import { SentimentAITab } from '@/components/pages/sentiment-ai-tab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Newspaper, Calculator, GraduationCap, Clock, BrainCircuit } from 'lucide-react';
import SentimentN8nTabUpdated from '@/components/pages/sentiment-n8n-tab-updated';
import { SentimentProvider } from '@/contexts/SentimentContext';

export default function Home() {
  return (
    <SentimentProvider>
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex-1 p-4 md:p-8">
          <Tabs defaultValue="sentiment" className="w-full">
            <div className="flex justify-center mb-16">
              <TabsList className="grid w-full max-w-3xl grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
                <TabsTrigger value="sentiment">
                  <BrainCircuit className="mr-2 h-4 w-4" /> Sentiment AI
                </TabsTrigger>
                <TabsTrigger value="sentiment-n8n">
                  <BrainCircuit className="mr-2 h-4 w-4" /> Sentiment
                </TabsTrigger>
                <TabsTrigger value="news">
                  <Newspaper className="mr-2 h-4 w-4" /> News
                </TabsTrigger>
                <TabsTrigger value="calculators">
                  <Calculator className="mr-2 h-4 w-4" /> Calculators
                </TabsTrigger>
                <TabsTrigger value="education">
                  <GraduationCap className="mr-2 h-4 w-4" /> Education
                </TabsTrigger>
                <TabsTrigger value="market-hours">
                  <Clock className="mr-2 h-4 w-4" /> Market Hours
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="sentiment" className="mt-6">
              <SentimentAITab />
            </TabsContent>
            <TabsContent value="sentiment-n8n" className="mt-6">
              <SentimentN8nTabUpdated />
            </TabsContent>
            <TabsContent value="news" className="mt-6">
              <NewsTab />
            </TabsContent>
            <TabsContent value="calculators" className="mt-6">
              <CalculatorsTab />
            </TabsContent>
            <TabsContent value="education" className="mt-6">
              <EducationTab />
            </TabsContent>
            <TabsContent value="market-hours" className="mt-6">
              <MarketHoursTab />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </SentimentProvider>
  );
}
