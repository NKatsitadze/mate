'use client';
import { LocateFixed, Search } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';

import { useListingsFilterStore } from '@/features/listings/hooks/useListingsFilterStore';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { LISTING_CATEGORIES } from '@/shared/const/categories.const';
import { MAX_DISTANCE_OPTIONS } from '@/shared/const/listings.const';
import { useGeolocation } from '@/shared/hooks/use-geolocation';

const ALL_CATEGORIES_VALUE = 'all';

export const ListingsFilterBar = () => {
  const { category, maxDistanceKm, setCategory, setMaxDistanceKm, setSearchQuery, setCoordinates } =
    useListingsFilterStore();
  const { coordinates, loading: locating, requestLocation } = useGeolocation();
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    if (coordinates) setCoordinates(coordinates);
  }, [coordinates, setCoordinates]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <form onSubmit={handleSearchSubmit} className="flex gap-2 sm:max-w-xs">
        <Input
          placeholder="Search listings…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <Button type="submit" variant="outline" size="icon" aria-label="Search">
          <Search className="size-4" />
        </Button>
      </form>

      <Select
        value={category ?? ALL_CATEGORIES_VALUE}
        onValueChange={(value) => setCategory(value === ALL_CATEGORIES_VALUE ? null : (value as typeof category))}
      >
        <SelectTrigger className="sm:w-48">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_CATEGORIES_VALUE}>All categories</SelectItem>
          {LISTING_CATEGORIES.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={String(maxDistanceKm)} onValueChange={(value) => setMaxDistanceKm(Number(value))}>
        <SelectTrigger className="sm:w-40">
          <SelectValue placeholder="Distance" />
        </SelectTrigger>
        <SelectContent>
          {MAX_DISTANCE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button type="button" variant="outline" onClick={requestLocation} disabled={locating}>
        <LocateFixed className="size-4" />
        {locating ? 'Locating…' : 'Use my location'}
      </Button>
    </div>
  );
};
