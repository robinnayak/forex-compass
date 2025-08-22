import { Indicator } from "@/types/education";
import Image from "next/image";
import { Button } from "../ui/button";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const IndicatorCard = ({ indicator }: { indicator: Indicator }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Always visible header */}
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-medium">{indicator.name}</h4>
        {indicator.type && (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            {indicator.type}
          </span>
        )}
      </div>

      {/* Always visible basic info */}
      {indicator.image && (
        <div className="relative h-40 w-full my-3">
          <Image
            src={indicator.image}
            alt={indicator.name}
            fill
            className="object-contain"
          />
        </div>
      )}

      {indicator.description && (
        <div className="mt-2">
          <p className="text-sm">
            <strong>Description:</strong> {indicator.description}
          </p>
        </div>
      )}

      {/* Collapsible content */}
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[500px]" : "max-h-0"}`}>
        <div className="pt-3 space-y-3">
          {indicator.strategy && (
            <div>
              <p className="text-sm">
                <strong>Strategy:</strong> {indicator.strategy}
              </p>
            </div>
          )}

          {indicator.benefit && (
            <div>
              <p className="text-sm">
                <strong>Benefit:</strong> {indicator.benefit}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toggle button - only shown if there's expandable content */}
      {(indicator.strategy || indicator.benefit) && (
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
      )}
    </div>
  );
};

export default IndicatorCard;