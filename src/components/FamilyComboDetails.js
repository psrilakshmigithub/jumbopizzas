import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/Details.css';

const FamilyComboDetails = () => {
  const { id } = useParams(); // Get the product ID from the URL
  const [combo, setCombo] = useState(null);
  const [toppings, setToppings] = useState([]);
  const [selectedToppings, setSelectedToppings] = useState([]); // Array of arrays for each pizza
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedWingsFlavor, setSelectedWingsFlavor] = useState('');
  const [selectedDrinks, setSelectedDrinks] = useState([]); // Updated to allow multiple drinks
  const [selectedSide, setSelectedSide] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchComboDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setCombo(response.data);

        // Initialize toppings for each pizza
        const initialToppings = Array(response.data.details.pizzas).fill([]);
        setSelectedToppings(initialToppings);

        setSelectedSize(response.data.details.sizes[0]);
        setSelectedWingsFlavor(response.data.details.wingsFlavors[0]);
        setSelectedSide(response.data.details.sides[0]);
      } catch (error) {
        console.error('Error fetching combo details:', error);
      }
    };

    const fetchToppings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/toppings');
        setToppings(response.data);
      } catch (error) {
        console.error('Error fetching toppings:', error);
      }
    };
    const fetchDrinks = async () => {
        try {
          const response = await axios.get('http://localhost:5000/api/products/beverages');
          setCombo((prevCombo) => ({
            ...prevCombo,
            details: {
              ...prevCombo.details,
              drinks: response.data.map((drink) => drink.name),
            },
          }));
        } catch (error) {
          console.error('Error fetching drinks:', error);
        }
      };
    fetchComboDetails();
    fetchToppings();
    fetchDrinks();
  }, [id]);

  const calculateTotalPrice = () => {
    if (!combo) return 0;

    const sizePriceAdjustment = combo.details.sizePrices[selectedSize] || 0;

    const extraToppingsPrice = selectedToppings.reduce((total, pizzaToppings) => {
      return (
        total +
        Math.max(0, pizzaToppings.length - combo.details.toppingsPerPizza) *
        combo.details.extraToppingPrice
      );
    }, 0);

    return ((combo.price + sizePriceAdjustment + extraToppingsPrice) * quantity).toFixed(2);
  };

  const handleToppingSelection = (pizzaIndex, topping) => {
    setSelectedToppings((prev) => {
      const updatedToppings = [...prev];
      if (updatedToppings[pizzaIndex].includes(topping)) {
        updatedToppings[pizzaIndex] = updatedToppings[pizzaIndex].filter((t) => t !== topping);
      } else {
        updatedToppings[pizzaIndex] = [...updatedToppings[pizzaIndex], topping];
      }
      return updatedToppings;
    });
  };
  const handleDrinkSelection = (drink) => {
    setSelectedDrinks((prev) => {
      if (prev.includes(drink)) {
        return prev.filter((d) => d !== drink);
      } else {
        if (prev.length < 4) {
          return [...prev, drink];
        } else {
          alert('You can select a maximum of 4 drinks.');
          return prev;
        }
      }
    });
  };
 

  const handleAddToCart = async () => {
    try {
      const order = {
        productId: combo._id,
        size: selectedSize,
        wingsFlavor: selectedWingsFlavor,
        sides: [selectedSide], // Ensure sides are included as an array
        drinks: selectedDrinks, // Updated to handle multiple drinks
        toppings: selectedToppings,
        quantity,
        totalPrice: calculateTotalPrice(),
      };

      await axios.post('http://localhost:5000/api/orders', order);
      alert('Family combo added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart.');
    }
  };

  if (!combo) return <div className="loading">Loading family combo details...</div>;

  return (
    <div className="details-container">
      <img src={`http://localhost:5000${combo.image}`} alt={combo.name} className="details-image" />
      <h1 className="details-title">{combo.name}</h1>
      <p className="details-price">Base Price: ${combo.price.toFixed(2)}</p>

      <form className="details-form">
        <div className="form-group">
          <label htmlFor="size">Choose Size:</label>
          <select id="size" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
            {combo.details.sizes.map((size) => (
              <option key={size} value={size}>
                {size} (Additional: ${combo.details.sizePrices[size].toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="flavor">Choose Wings Flavor:</label>
          <select id="flavor" value={selectedWingsFlavor} onChange={(e) => setSelectedWingsFlavor(e.target.value)}>
            {combo.details.wingsFlavors.map((flavor) => (
              <option key={flavor} value={flavor}>
                {flavor}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="side">Choose Side:</label>
          <select id="side" value={selectedSide} onChange={(e) => setSelectedSide(e.target.value)}>
            {combo.details.sides.map((side) => (
              <option key={side} value={side}>
                {side}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="drinks">Choose Drinks:</label>
          <div id="drinks">
            {combo.details.drinks.map((drink) => (
              <div key={drink}>
                <input
                  type="checkbox"
                  value={drink}
                  checked={selectedDrinks.includes(drink)}
                  onChange={() => handleDrinkSelection(drink)}
                />
                {drink}
              </div>
            ))}
          </div>
        </div>

        {Array.from({ length: combo.details.pizzas }).map((_, pizzaIndex) => (
          <div key={pizzaIndex} className="form-group">
            <label>Toppings for Pizza {pizzaIndex + 1} (Min {combo.details.toppingsPerPizza}):</label>
            <div>
              {toppings.map((topping) => (
                <div key={topping.name}>
                  <input
                    type="checkbox"
                    value={topping.name}
                    checked={selectedToppings[pizzaIndex]?.includes(topping.name) || false}
                    onChange={() => handleToppingSelection(pizzaIndex, topping.name)}
                  />
                  {topping.name}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="form-group">
          <label htmlFor="quantity">Quantity:</label>
          <input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
          />
        </div>

        <p className="details-total">Total Price: ${calculateTotalPrice()}</p>

        <button type="button" className="add-to-cart-btn" onClick={handleAddToCart}>
          Add to Cart
        </button>
      </form>
    </div>
  );
};

export default FamilyComboDetails;