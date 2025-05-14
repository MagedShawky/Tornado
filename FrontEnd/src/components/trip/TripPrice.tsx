import { Tag } from "lucide-react";
interface TripPriceProps {
  price: number;
  discount: number;
}
export function TripPrice({
  price,
  discount
}: TripPriceProps) {
  // Calculate discounted price
  const discountedPrice = price - price * (discount / 100);
  if (discount > 0) {
    return <div className="flex items-center text-sm my-[10px]">
        <Tag className="h-4 w-4 mr-2 text-red-500" />
        <span className="line-through text-gray-500">€{price}</span>
        <span className="ml-2 font-bold text-red-600">€{discountedPrice.toFixed(2)}</span>
      </div>;
  }
  return <div className="flex items-center text-sm">
      <Tag className="h-4 w-4 mr-2 text-gray-500" />
      <span>€{price}</span>
    </div>;
}