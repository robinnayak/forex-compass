import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EDUCATION_TOPICS } from "@/lib/constants";

export function EducationTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Learn the Concepts</CardTitle>
        <CardDescription>Master key forex topics, from basics to advanced strategies.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {Object.entries(EDUCATION_TOPICS).map(([category, topics]) => (
            <AccordionItem value={category} key={category}>
              <AccordionTrigger className="text-lg font-semibold font-headline">{category}</AccordionTrigger>
              <AccordionContent>
                <Accordion type="single" collapsible className="w-full pl-4 space-y-2">
                    {topics.map((topic, index) => (
                      <AccordionItem value={`${category}-${index}`} key={topic.title} className="border rounded-md px-4 bg-background/50">
                          <AccordionTrigger>{topic.title}</AccordionTrigger>
                          <AccordionContent className="pt-2 text-muted-foreground">
                            {topic.content}
                          </AccordionContent>
                      </AccordionItem>
                    ))}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
