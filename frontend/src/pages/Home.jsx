import React from 'react';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import RestaurantCard from '../components/RestaurantCard';

const restaurants = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isOpen: true,
    rating: 4.8,
    title: 'The Quad Grill',
    subtitle: 'Burgers, Fries & Shakes',
    deliveryTime: '10-15 min',
    distance: '0.2 mi',
    price: '$$'
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isOpen: true,
    rating: 4.5,
    title: 'Student Union Cafe',
    subtitle: 'Coffee, Pastries & Light Bites',
    deliveryTime: '5-10 min',
    distance: '0.1 mi',
    price: '$$'
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isOpen: false,
    rating: 4.2,
    title: 'Late Night Slices',
    subtitle: 'Pizza & Wings • Opens at 8PM',
    price: '$'
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isOpen: true,
    rating: 4.9,
    title: 'Sakura Sushi',
    subtitle: 'Fresh Rolls & Bento Boxes',
    deliveryTime: '20-30 min',
    distance: '1.2 mi',
    price: '$$$'
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isOpen: true,
    rating: 4.6,
    title: 'Taco Fiesta',
    subtitle: 'Authentic Street Tacos',
    deliveryTime: '10-20 min',
    distance: '0.5 mi',
    price: '$'
  },
  {
    id: 6,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    isOpen: true,
    rating: 4.7,
    title: 'Green Leaf Bowls',
    subtitle: 'Healthy Salads & Smoothies',
    deliveryTime: '15-25 min',
    distance: '0.8 mi',
    price: '$$'
  }
];

function Home() {
  return (
    <>
      <TopBar />
      <SearchBar />
      <CategoryFilter />
      
      <main className="main-content">
        <div className="section-header">
          <h2>Campus Favorites</h2>
          <a href="#" className="see-all">See all</a>
        </div>
        
        <div className="restaurant-list">
          {restaurants.map(restaurant => (
            <RestaurantCard key={restaurant.id} data={restaurant} />
          ))}
        </div>
      </main>
    </>
  );
}

export default Home;
