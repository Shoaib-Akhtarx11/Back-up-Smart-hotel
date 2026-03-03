import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';

// Async thunk to fetch hotels from backend
export const fetchHotels = createAsyncThunk('hotels/fetchHotels', async () => {
  const res = await fetch('http://localhost:5600/api/hotels'); // adjust port if needed
  const data = await res.json();
  console.log(data)
  if (!data.success) {
    throw new Error(data.message || 'Failed to fetch hotels');
  }
  return data.data; // backend returns { success, data }
});

const hotelSlice = createSlice({
  name: 'hotels',
  initialState: {
    allHotels: [],
    filters: {
      location: "Any region",
      priceMin: 500,
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
        priceMin: 500,
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
          room => String(room.hotelId).toLowerCase() === String(hotel._id).toLowerCase()
        );
        
        const minPrice = hotelRooms.length > 0 
          ? Math.min(...hotelRooms.map(r => r.price)) 
          : 0;

        const allAttributes = [
          ...(hotel.features || []), 
          ...(hotel.amenities || [])
        ].map(attr => attr.toLowerCase());
        
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
