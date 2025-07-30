"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { NEWS_ITEMS } from "@/lib/constants";

export function NewsTab() {
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [impactFilter, setImpactFilter] = useState("all");

  const filteredNews = NEWS_ITEMS.filter(item => {
    const currencyMatch = currencyFilter === 'all' || item.currency === currencyFilter;
    const impactMatch = impactFilter === 'all' || item.impact === impactFilter;
    return currencyMatch && impactMatch;
  });

  const uniqueCurrencies = ['all', ...Array.from(new Set(NEWS_ITEMS.map(item => item.currency)))];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Real-Time Forex News</CardTitle>
          <CardDescription>Stay updated with market-moving events.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by currency" />
              </SelectTrigger>
              <SelectContent>
                {uniqueCurrencies.map(currency => (
                  <SelectItem key={currency} value={currency}>{currency === 'all' ? 'All Currencies' : currency}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={impactFilter} onValueChange={setImpactFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by impact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Impacts</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            {filteredNews.map(item => (
              <Card key={item.id} className="p-4 flex justify-between items-start hover:bg-muted/50 transition-colors">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.source} • {item.time}</p>
                </div>
                <div className="flex flex-col items-end space-y-2 ml-4">
                  <Badge variant="secondary">{item.currency}</Badge>
                  <Badge
                    variant={
                      item.impact === 'high' ? 'destructive' :
                      item.impact === 'medium' ? 'secondary' :
                      'outline'
                    }
                  >
                    {item.impact}
                  </Badge>
                </div>
              </Card>
            ))}
            {filteredNews.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No news items match your filters.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
