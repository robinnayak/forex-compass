"use client";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { TabsContent, Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import {
  CandlestickPattern,
  EducationGuides,
  Indicator,
} from "@/types/education";
import PatternCard from "../education/PatternCard";
import IndicatorCard from "../education/IndicatorCard";

import Image from "next/image";

export function EducationTab() {
  const [data, setData] = useState<EducationGuides | null>(null);
  const [activeTab, setActiveTab] =
    useState<keyof EducationGuides>("TechnicalAnalysis");
  const [activeSubTab, setActiveSubTab] = useState<string>(
    "CandleStickPatterns"
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/education-api");
      if (!res.ok) throw new Error("Failed to fetch education data");
      const responseData = await res.json();
      setData(responseData as EducationGuides);
    } catch (error) {
      console.error("Error fetching education data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading)
    return <div className="p-4 text-center">Loading education content...</div>;
  if (!data) return <div className="p-4 text-center">No data available</div>;

  const renderTechnicalAnalysis = () => {
    const techData = data.TechnicalAnalysis;
    const subTabData = techData[activeSubTab as keyof typeof techData];

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          {Object.entries(techData).map(([key]) => (
            <button
              key={key}
              onClick={() => {
                setActiveSubTab(key);
                setActiveFilter(null); // Reset filter when changing subtab
              }}
              className={`w-full text-left p-3 rounded-md transition-colors ${
                activeSubTab === key
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {key.split(/(?=[A-Z])/).join(" ")}
            </button>
          ))}
        </div>
        <div className="md:col-span-3">
          {subTabData && (
            <div className="space-y-6">
              {"define" in subTabData && (
                <div className="p-4 bg-muted rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Definition</h3>
                  <p>{subTabData.define}</p>
                </div>
              )}

              {renderPatternsOrIndicators(subTabData as {
                [key: string]: string | CandlestickPattern[] | Indicator[] | undefined;
                indicators?: Indicator[];
                tools?: CandlestickPattern[];
                define?: string;
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderPatternsOrIndicators = (
    data: {
      [key: string]: CandlestickPattern[] | Indicator[] | string | undefined;
      indicators?: Indicator[];
      tools?: CandlestickPattern[];
      define?: string;
    },
    filterTypes: string[] = ["Bullish", "Bearish", "Neutral"]
  ) => {
    // Check if we should show pattern filters
    const showPatternFilters = filterTypes.some((type) => type in data);

    return (
      <div className="space-y-6">
        {/* Filter controls (only shown for pattern data) */}
        {showPatternFilters && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setActiveFilter(null)}
              className={`px-4 py-2 rounded-md text-sm ${
                activeFilter === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-accent"
              }`}
            >
              All
            </button>

            {filterTypes.map(
              (type) =>
                Array.isArray(data[type]) && data[type]!.length > 0 && (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(type)}
                    className={`px-4 py-2 rounded-md text-sm ${
                      activeFilter === type
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted hover:bg-accent"
                    }`}
                  >
                    {type}
                  </button>
                )
            )}
          </div>
        )}

        {/* Patterns section */}
        {filterTypes.some((type) => type in data) && (
          <div className="space-y-6">
            {filterTypes.map(
              (type) =>
                Array.isArray(data[type]) && data[type]!.length > 0 &&
                (!activeFilter || activeFilter === type) && (
                  <div key={type}>
                    <h3 className="text-lg font-semibold mb-3">
                      {type} Patterns
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(data[type] as CandlestickPattern[]).map(
                        (item, index) => (
                          <PatternCard
                            key={`${type}-${index}`}
                            item={{ ...item, type: item.type ?? type }}
                            type={type}
                          />
                        )
                      )}
                    </div>
                  </div>
                )
            )}
          </div>
        )}

        {/* Indicators section */}
        {"indicators" in data && Array.isArray(data.indicators) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.indicators.map((indicator: Indicator, index: number) => (
                <IndicatorCard key={index} indicator={indicator} />
              ))}
            </div>
          </div>
        )}

        {/* Tools section */}
        {"tools" in data && Array.isArray(data.tools) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Trading Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.tools.map((tool: CandlestickPattern, index: number) => (
                <PatternCard key={index} item={tool} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPriceAction = () => {
    const priceActionData = data.PriceAction;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          {["Bullish", "Bearish", "Neutral"].map((type) => (
            <button
              key={type}
              onClick={() => {
                setActiveSubTab(type);
                setActiveFilter(type);
              }}
              className={`w-full text-left p-3 rounded-md transition-colors ${
                // activeSubTab === type
                activeFilter === type
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              {type} Patterns
            </button>
          ))}
        </div>
        <div className="md:col-span-3">
          <div className="p-4 bg-muted rounded-lg mb-6">
            <h3 className="text-lg font-semibold mb-2">Definition</h3>
            <p>{priceActionData.define}</p>
          </div>
          {renderPatternsOrIndicators(priceActionData as unknown as {
            [key: string]: string | CandlestickPattern[] | Indicator[] | undefined;
            indicators?: Indicator[];
            tools?: CandlestickPattern[];
            define?: string;
          })}
        </div>
      </div>
    );
  };

  const renderTradingStrategies = () => {
    const strategiesData = data.TradingStrategies;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Definition</h3>
            <p>{strategiesData.define}</p>
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategiesData.Strategies.map((strategy, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium mb-2">{strategy.name}</h3>
                {strategy.image && (
                  <div className="relative h-40 w-full mb-3">
                    <Image 
                      src={strategy.image} 
                      alt={strategy.name} 
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
                <p className="text-sm mb-2">
                  <strong>Type:</strong> {strategy.type}
                </p>
                <p className="text-sm mb-2">
                  <strong>Description:</strong> {strategy.description}
                </p>
                <p className="text-sm mb-2">
                  <strong>Strategy:</strong> {strategy.strategy}
                </p>
                <p className="text-sm">
                  <strong>Benefit:</strong> {strategy.benefit}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRiskPsychology = () => {
    const riskData = data.RiskPsychology;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Definition</h3>
            <p>{riskData.define}</p>
          </div>
        </div>
        <div className="md:col-span-3 space-y-4">
          {riskData.Psychology.map((psych, index) => (
            <div
              key={index}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-semibold mb-2">{psych.name}</h3>
              <p className="text-sm mb-2">
                <strong>Description:</strong> {psych.description}
              </p>
              <p className="text-sm mb-2">
                <strong>Strategy:</strong> {psych.strategy}
              </p>
              <p className="text-sm">
                <strong>Benefit:</strong> {psych.benefit}
              </p>
              {psych.image && (
                <div className="relative h-64 w-full mt-4">
                  <Image 
                    src={psych.image} 
                    alt={psych.name} 
                    fill
                    className="object-contain rounded-lg border"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderFundamentalAnalysis = () => {
    const fundamentalData = data.FundamentalAnalysis;

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Definition</h3>
            <p>{fundamentalData.define}</p>
          </div>
        </div>
        <div className="md:col-span-3">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Economic Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fundamentalData.EconomicIndicators.map((indicator, index) => (
                <IndicatorCard key={index} indicator={indicator} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "TechnicalAnalysis":
        return renderTechnicalAnalysis();
      case "PriceAction":
        return renderPriceAction();
      case "TradingStrategies":
        return renderTradingStrategies();
      case "RiskPsychology":
        return renderRiskPsychology();
      case "FundamentalAnalysis":
        return renderFundamentalAnalysis();
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader className="mb-4">
        <CardTitle className="font-headline">Learn the Concepts</CardTitle>
        <CardDescription>
          Master key forex topics, from basics to advanced strategies.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as keyof EducationGuides)}>
          <div className="relative">
            <TabsList className="grid w-full grid-cols-3 gap-1 mb-20 rounded-lg p-1">
              <TabsTrigger value="TechnicalAnalysis">
                Technical Analysis
              </TabsTrigger>
              <TabsTrigger value="PriceAction">Price Action</TabsTrigger>
              <TabsTrigger value="TradingStrategies">
                Trading Strategies
              </TabsTrigger>
              <TabsTrigger value="RiskPsychology">
                Risk & Psychology
              </TabsTrigger>
              <TabsTrigger value="FundamentalAnalysis">
                Fundamental Analysis
              </TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>{renderContent()}</TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}
