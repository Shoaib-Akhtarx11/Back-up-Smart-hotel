import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5600";

// Async thunk to fetch hotels from backend
export const fetchHotels = createAsyncThunk('hotels/fetchHotels', async () => {
  const res = await fetch(`${API_BASE}/api/hotels`, {
    credentials: 'include'
  });
  const data = await res.json();
  console.log(data)
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch hotels');
  }
  
  // Transform backend data to frontend format with proper field mappings
  const transformedHotels = data.data.map(hotel => ({
    _id: hotel._id,
    id: hotel._id,
    name: hotel.Name,
    location: hotel.Location,
    rating: hotel.Rating || 0,
    stars: hotel.Rating ? Math.round(hotel.Rating * 2) : 4, // Convert 0-5 rating to stars (1-5)
    image: hotel.Image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
    features: hotel.Amenities || [],
    amenities: hotel.Amenities || [],
    reviewsCount: hotel.reviewsCount || Math.floor(Math.random() * 500) + 50, // Default reviews if not populated
    tag: "Recommended",
    provider: "Official Site",
    offer: "Standard Rates",
    // Since rooms aren't fetched on HotelList page, we'll set a default minPrice
    // This will be overridden if rooms are available in the selector
    minPrice: 0 // Will be calculated from rooms if available, otherwise use default in selector
  }));
  
  return transformedHotels;
});

const hotelSlice = createSlice({
  name: 'hotels',
  initialState: {
    allHotels: [],
    filters: {
      location: "Any region",
      priceMin: 0, // Changed from 500 to 0 to show hotels without rooms
      priceMax: 100000,
      sortBy: "Featured stays",
      advancedFeatures: [],
      searchQuery: ""
    },
    loading: false,
    error: null
  },
  reducers: {
    setGlobalFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = {
        location: "Any region",
        priceMin: 0,
        priceMax: 100000,
        sortBy: "Featured stays",
        advancedFeatures: [],
        searchQuery: ""
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.allHotels = action.payload;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setGlobalFilters, resetFilters } = hotelSlice.actions;

export const selectAllHotels = (state) => state.hotels.allHotels;
export const selectFilters = (state) => state.hotels.filters;

// Computed selector
export const selectFilteredHotels = createSelector(
  [selectAllHotels, selectFilters, (state) => state.rooms?.allRooms || []],
  (allHotels, filters, roomsData) => {
    try {
      const hotelsWithPrice = allHotels.map(hotel => {
        const hotelRooms = roomsData.filter(
          room => String(room.HotelID).toLowerCase() === String(hotel._id).toLowerCase()
        );
        
        // Calculate minPrice from rooms, or use a default value if no rooms
        const minPrice = hotelRooms.length > 0 
          ? Math.min(...hotelRooms.map(r => r.Price || r.price || 0))
          : 3000; // Default minimum price when no rooms available

        const allAttributes = [
          ...(hotel.features || []),
          ...(hotel.amenities || [])
        ].map(attr => String(attr).toLowerCase());
        
        return { ...hotel, minPrice, allAttributes };
      });

      let filtered = hotelsWithPrice.filter(hotel => {
        const matchesLocation = filters.location === "Any region" || 
          hotel.location.toLowerCase().includes(filters.location.toLowerCase());
        
        const matchesPrice = hotel.minPrice >= filters.priceMin && hotel.minPrice <= filters.priceMax;
        
        const matchesFeatures = filters.advancedFeatures.length === 0 || 
          filters.advancedFeatures.every(feat => 
            hotel.allAttributes.includes(feat.toLowerCase())
          );

        const matchesSearch = !filters.searchQuery || 
          hotel.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          hotel.location.toLowerCase().includes(filters.searchQuery.toLowerCase());

        return matchesLocation && matchesPrice && matchesFeatures && matchesSearch;
      });

      return [...filtered].sort((a, b) => {
        switch (filters.sortBy) {
          case "Price ascending": 
            return a.minPrice - b.minPrice;
          case "Price descending": 
            return b.minPrice - a.minPrice;
          case "Rating & Recommended": 
            return (b.rating || 0) - (a.rating || 0);
          default: 
            return 0;
        }
      });
    } catch (error) {
      console.error("Critical error in selectFilteredHotels:", error);
      return [];
    }
  }
);

export default hotelSlice.reducer;
