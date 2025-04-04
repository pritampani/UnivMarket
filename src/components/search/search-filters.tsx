import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { useProducts } from "@/context/product-context";
import { SearchFiltersType } from "@/pages/search";

interface SearchFiltersProps {
  filters: SearchFiltersType;
  onFilterChange: (filters: SearchFiltersType) => void;
}

export default function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const { categories, isCategoriesLoading } = useProducts();
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(filters.minPrice || 0),
    Number(filters.maxPrice || 1000)
  ]);
  const [localFilters, setLocalFilters] = useState<SearchFiltersType>(filters);
  
  // Update local filters when the parent filters change
  useEffect(() => {
    setLocalFilters(filters);
    // Update price range slider
    setPriceRange([
      Number(filters.minPrice || 0),
      Number(filters.maxPrice || 1000)
    ]);
  }, [filters]);
  
  // Handle empty or "all" values in filters
  const getNormalizedFilters = (filtersToNormalize: SearchFiltersType): SearchFiltersType => {
    const result: SearchFiltersType = {};
    
    Object.entries(filtersToNormalize).forEach(([key, value]) => {
      // Skip empty strings or "all" values
      if (value === "" || value === "all") {
        return;
      }
      result[key as keyof SearchFiltersType] = value as any;
    });
    
    return result;
  };

  // Apply filters handler
  const handleApplyFilters = () => {
    // Normalize the filters to remove empty and "all" values
    const normalizedFilters = getNormalizedFilters(localFilters);
    onFilterChange(normalizedFilters);
  };

  // Reset filters handler
  const handleResetFilters = () => {
    const resetFilters: SearchFiltersType = {
      query: filters.query, // Keep the search query
      sort: filters.sort, // Keep the sort order
    };
    setLocalFilters(resetFilters);
    setPriceRange([0, 1000]);
    onFilterChange(resetFilters);
  };

  // Price range handler
  const handlePriceRangeChange = (values: number[]) => {
    const [min, max] = values;
    setPriceRange([min, max]);
    setLocalFilters({
      ...localFilters,
      minPrice: min.toString(),
      maxPrice: max.toString()
    });
  };

  return (
    <div className="space-y-6">
      <Accordion type="multiple" defaultValue={["category", "price", "condition", "availability"]} className="w-full">
        {/* Categories Filter */}
        <AccordionItem value="category">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select
                value={localFilters.category || "all"}
                onValueChange={(value) => {
                  setLocalFilters({
                    ...localFilters,
                    category: value === "all" ? undefined : value
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {!isCategoriesLoading && categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Price Range Filter */}
        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <Slider
                defaultValue={[0, 1000]}
                value={priceRange}
                min={0}
                max={1000}
                step={10}
                onValueChange={handlePriceRangeChange}
                className="my-4"
              />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="min-price">Min</Label>
                  <div className="flex items-center mt-1">
                    <span className="text-sm mr-1">₹</span>
                    <Input
                      id="min-price"
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          setPriceRange([value, priceRange[1]]);
                          setLocalFilters({
                            ...localFilters,
                            minPrice: value.toString()
                          });
                        }
                      }}
                      className="w-20"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="max-price">Max</Label>
                  <div className="flex items-center mt-1">
                    <span className="text-sm mr-1">₹</span>
                    <Input
                      id="max-price"
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (!isNaN(value)) {
                          setPriceRange([priceRange[0], value]);
                          setLocalFilters({
                            ...localFilters,
                            maxPrice: value.toString()
                          });
                        }
                      }}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Condition Filter */}
        <AccordionItem value="condition">
          <AccordionTrigger>Condition</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select
                value={localFilters.condition || "any"}
                onValueChange={(value) => {
                  setLocalFilters({
                    ...localFilters,
                    condition: value === "any" ? undefined : value
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any condition</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Like New">Like New</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                  <SelectItem value="Poor">Poor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* University Filter */}
        <AccordionItem value="university">
          <AccordionTrigger>University</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select
                value={localFilters.university || "all"}
                onValueChange={(value) => {
                  setLocalFilters({
                    ...localFilters,
                    university: value === "all" ? undefined : value
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All universities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All universities</SelectItem>
                  <SelectItem value="University of Sydney">University of Sydney</SelectItem>
                  <SelectItem value="University of Melbourne">University of Melbourne</SelectItem>
                  <SelectItem value="University of Queensland">University of Queensland</SelectItem>
                  <SelectItem value="Monash University">Monash University</SelectItem>
                  <SelectItem value="UNSW Sydney">UNSW Sydney</SelectItem>
                  <SelectItem value="ANU">ANU</SelectItem>
                  <SelectItem value="UTS">UTS</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Availability Filter */}
        <AccordionItem value="availability">
          <AccordionTrigger>Availability</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2">
              <Select
                value={localFilters.available || "all"}
                onValueChange={(value) => {
                  setLocalFilters({
                    ...localFilters,
                    available: value === "all" ? undefined : value as any
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All items" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All items</SelectItem>
                  <SelectItem value="true">Available only</SelectItem>
                  <SelectItem value="false">Sold items</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button 
          onClick={handleApplyFilters} 
          className="flex-1"
          variant="default"
        >
          Apply Filters
        </Button>
        <Button 
          onClick={handleResetFilters} 
          variant="outline"
        >
          Reset
        </Button>
      </div>
    </div>
  );
}