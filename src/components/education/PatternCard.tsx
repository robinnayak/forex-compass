import { CandlestickPattern } from "@/types/education";
import Image from "next/image";
import { Button } from "../ui/button";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const PatternCard = ({
  item,
  type,
}: {
  item: CandlestickPattern;
  type?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Always visible header */}
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-medium">{item.name}</h4>
        {type && (
          <span
            className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
              type === "Bullish"
                ? "bg-green-100 text-green-800"
                : type === "Bearish"
                ? "bg-red-100 text-red-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {type}
          </span>
        )}
      </div>

      {/* Always visible basic info */}
      <div className="mt-2">
        <p className="text-sm">
          <strong>Type:</strong> {item.type}
        </p>
      </div>

      {/* Image (always visible) */}
      {item.image && (
        <div className="relative h-40 w-full my-3">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-contain"
          />
        </div>
      )}
      {item.description && (
        <div className="mt-8">
          <p className="text-sm">
            <strong>Description:</strong> {item.description}
          </p>
        </div>
      )}

      {/* Collapsible content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? "max-h-[500px]" : "max-h-0"
        }`}
      >
        <div className="pt-3 space-y-3">
          {item.strategy && (
            <div>
              <p className="text-sm">
                <strong>Strategy:</strong> {item.strategy}
              </p>
            </div>
          )}

          {item.benefit && (
            <div>
              <p className="text-sm">
                <strong>Benefit:</strong> {item.benefit}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle button */}
      <Button
        variant="ghost"
        size="sm"
        className="mt-3 w-full flex items-center gap-1"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="h-4 w-4" />
            Show Less
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4" />
            Learn More
          </>
        )}
      </Button>
    </div>
  );
};

export default PatternCard;
