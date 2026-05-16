const validateOrder = (req, res, next) => {
  const { customerName, coffeeType, size, quantity } = req.body;

  if (!customerName || customerName.trim().length < 2) {
    return res.status(400).render('new', { 
      error: 'Customer name must be at least 2 characters long' 
    });
  }
  if (!['Espresso', 'Latte', 'Cappuccino', 'Americano', 'Mocha'].includes(coffeeType)) {
    return res.status(400).render('new', { 
      error: 'Please select a valid coffee type' 
    });
  }
  if (!['Small', 'Medium', 'Large'].includes(size)) {
    return res.status(400).render('new', { 
      error: 'Please select a valid size' 
    });
  }
  if (!quantity || isNaN(quantity) || quantity < 1 || quantity > 20) {
    return res.status(400).render('new', { 
      error: 'Quantity must be between 1 and 20' 
    });
  }

  next();
};

export default validateOrder;