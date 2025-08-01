import { Indicator } from "@/types/education";
import Image from "next/image";

  const IndicatorCard = ({ indicator }: { indicator: Indicator }) => (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <h4 className="font-medium mb-2">{indicator.name}</h4>
      {indicator.image && (
        <div className="relative h-40 w-full mb-3">
          <Image 
            src={indicator.image} 
            alt={indicator.name} 
            fill
            className="object-contain"
          />
        </div>
      )}
      <p className="text-sm mb-2"><strong>Description:</strong> {indicator.description}</p>
      <p className="text-sm mb-2"><strong>Strategy:</strong> {indicator.strategy}</p>
      <p className="text-sm"><strong>Benefit:</strong> {indicator.benefit}</p>
    </div>
  );

export default IndicatorCard;