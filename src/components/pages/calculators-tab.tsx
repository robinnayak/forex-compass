"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCY_PAIRS } from '@/lib/constants';
import { AlertCircle, TrendingUp } from 'lucide-react';

const formSchema = z.object({
  accountBalance: z.coerce.number().positive({ message: "Must be positive." }),
  riskPercentage: z.coerce.number().min(0.1, { message: "Min 0.1%." }).max(100, { message: "Max 100%." }),
  stopLossPips: z.coerce.number().positive({ message: "Must be positive." }),
  currencyPair: z.string().min(1, { message: "Please select a pair." }),
});

type CalculationResult = {
  riskAmount: number;
  lotSize: number;
  pipValue: number;
  units: number;
};

export function CalculatorsTab() {
  const [result, setResult] = useState<CalculationResult | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      accountBalance: 10000,
      riskPercentage: 1,
      stopLossPips: 20,
      currencyPair: "EUR/USD",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { accountBalance, riskPercentage, stopLossPips, currencyPair } = values;

    const riskAmount = accountBalance * (riskPercentage / 100);
    
    // Simplified pip value calculation for this example
    // A real app would need live exchange rates for pairs like USD/JPY
    const pipValuePerLot = currencyPair.includes('JPY') ? 1000 : 10;
    const pipValue = (riskAmount / stopLossPips);
    const lotSize = pipValue / pipValuePerLot;

    setResult({
      riskAmount: parseFloat(riskAmount.toFixed(2)),
      lotSize: parseFloat(lotSize.toFixed(2)),
      pipValue: parseFloat((pipValuePerLot * lotSize).toFixed(2)),
      units: Math.round(lotSize * 100000),
    });
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Position Size Calculator</CardTitle>
          <CardDescription>Calculate your position size based on your risk parameters.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="accountBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Balance ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="riskPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Risk Percentage (%)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stopLossPips"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stop Loss (pips)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currencyPair"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Pair</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a currency pair" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CURRENCY_PAIRS.map(pair => (
                          <SelectItem key={pair} value={pair}>{pair}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">Calculate</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <div className="space-y-8">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
              <TrendingUp className="text-primary"/>
              Calculation Results
            </CardTitle>
          </CardHeader>
          {result ? (
            <CardContent className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-background/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Amount to Risk</p>
                <p className="text-2xl font-bold font-headline text-primary">${result.riskAmount}</p>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Pip Value</p>
                <p className="text-2xl font-bold font-headline text-primary">${result.pipValue}</p>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Lot Size</p>
                <p className="text-2xl font-bold font-headline text-primary">{result.lotSize}</p>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">Units</p>
                <p className="text-2xl font-bold font-headline text-primary">{result.units.toLocaleString()}</p>
              </div>
            </CardContent>
          ) : (
            <CardContent>
                <p className="text-center text-muted-foreground py-12">Enter your trade details to see the results.</p>
            </CardContent>
          )}
        </Card>
        <Card className="bg-accent/5 border-accent/20">
          <CardHeader>
             <CardTitle className="flex items-center gap-2 text-sm font-semibold text-accent-foreground/80">
              <AlertCircle className="text-accent text-white"/>
              <span className='text-primary'>Risk Management Note</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This calculator provides a standard position size. Always consider market volatility, spreads, and your personal risk tolerance. Never risk more than you are willing to lose.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
