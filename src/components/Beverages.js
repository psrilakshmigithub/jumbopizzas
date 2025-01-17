import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Details.css';

const Beverages = () => {
  const [beverages, setBeverages] = useState([]);
  const [selectedDrinks, setSelectedDrinks] = useState({}); // Store selected drink quantities as an object

  useEffect(() => {
    const fetchBeverages = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/products?category=Beverages');
        setBeverages(response.data);
      } catch (error) {
        console.error('Error fetching beverages:', error);
      }
    };

    fetchBeverages();
  }, []);

  const handleDrinkSelection = (drinkName, quantity) => {
    setSelectedDrinks((prev) => ({
      ...prev,
      [drinkName]: quantity, // Update the quantity for the selected drink
    }));
  };

  
  const handleAddToCart = async () => {
  try {
    const drinks = Object.entries(selectedDrinks).map(([name, quantity]) => ({
      name,
      quantity,
    }));

    const order = {
      productId: null, // Beverages may not have a specific productId
      drinks,
      totalPrice: calculateTotalPrice(drinks),
    };

    console.log('Order Payload:', order); // Debugging
    await axios.post('http://localhost:5000/api/orders', order);
    alert('Beverages added to cart!');
  } catch (error) {
    console.error('Error adding beverages to cart:', error);
    alert('Failed to add beverages to cart.');
  }
};


  const calculateTotalPrice = (drinks) => {
    return drinks.reduce((total, drink) => {
      const beverage = beverages.find((bev) => bev.name === drink.name);
      return total + (beverage.price * drink.quantity);
    }, 0).toFixed(2);
  };

  return (
    <div className="details-container">
      <h1 className="details-title">Beverages</h1>
      <div className="beverages-grid">
        {beverages.map((bev) => (
          <div key={bev._id} className="beverage-card">
            <img src={`http://localhost:5000${bev.image}`} alt={bev.name} className="beverage-image" />
            <h3 className="beverage-title">{bev.name}</h3>
            <p className="beverage-price">${bev.price.toFixed(2)}</p>
            <div className="beverage-quantity">
              <label htmlFor={`quantity-${bev.name}`}>Quantity:</label>
              <input
                id={`quantity-${bev.name}`}
                type="number"
                min="0"
                value={selectedDrinks[bev.name] || 0}
                onChange={(e) => handleDrinkSelection(bev.name, parseInt(e.target.value, 10))}
              />
            </div>
          </div>
        ))}
      </div>
      <button className="add-to-cart-btn" onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
};

export default Beverages;