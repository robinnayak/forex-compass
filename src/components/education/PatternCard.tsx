import { CandlestickPattern } from "@/types/education";
import Image from "next/image";

const PatternCard = ({ item, type }: { item: CandlestickPattern, type?: string }) => (
    <div className="border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-2">
        <h4 className="font-medium mb-2">{item.name}</h4>
        {type && (
          <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
            type === 'Bullish' ? 'bg-green-100 text-green-800' :
            type === 'Bearish' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {type}
          </span>
        )}
      </div>
      {item.image && (
        <div className="relative h-40 w-full mb-3">
          <Image 
            src={item.image} 
            alt={item.name} 
            fill
            className="object-contain"
          />
        </div>
      )}
      <p className="text-sm mb-2"><strong>Type:</strong> {item.type}</p>
      <p className="text-sm mb-2"><strong>Description:</strong> {item.description}</p>
      <p className="text-sm mb-2"><strong>Strategy:</strong> {item.strategy}</p>
      <p className="text-sm"><strong>Benefit:</strong> {item.benefit}</p>
    </div>
  );

export default PatternCard;