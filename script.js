
// Horizontal slider with arrow buttons
const slider = document.querySelector('.slider');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');

let scrollAmount = 0;
const scrollStep = 190;
const maxScroll = -(slider.scrollWidth - document.querySelector('.slider-wrapper').offsetWidth);

leftArrow.addEventListener('click', () => {
  scrollAmount += scrollStep;
  if (scrollAmount > 0) scrollAmount = 0;
  slider.style.transform = `translateX(${scrollAmount}px)`;
});

rightArrow.addEventListener('click', () => {
  scrollAmount -= scrollStep;
  if (scrollAmount < maxScroll) scrollAmount = maxScroll;
  slider.style.transform = `translateX(${scrollAmount}px)`;
});

// Category card and product section toggle
const categoryCards = document.querySelectorAll('.category-card');
const productSections = document.querySelectorAll('.product-section');

categoryCards.forEach(card => {
  card.addEventListener('click', () => {
    // Hide all sections
    productSections.forEach(section => {
      section.classList.remove('active'); // Remove the active class
      section.classList.add('hidden');   // Add hidden for accessibility
    });

    // Show the selected section with animation
    const sectionId = card.getAttribute('data-section');
    const targetSection = document.getElementById(sectionId);

    targetSection.classList.remove('hidden'); // Make it accessible
    setTimeout(() => {
      targetSection.classList.add('active'); // Trigger animation
    }, 10); // Small delay to ensure animation works
  });
});

let cart = [];
let cartTotal = 0;

function toggleCart() {
  const cartModal = document.getElementById('cart-modal');
  cartModal.style.display = cartModal.style.display === 'none' || cartModal.style.display === '' ? 'flex' : 'none';
  displayCartItems();
}

function displayCartItems() {
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotalDisplay = document.getElementById('cart-total');
  cartItemsContainer.innerHTML = '';

  let total = 0;
  cart.forEach((item, index) => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('cart-item');
    itemElement.innerHTML = `
      <p>${item.name} - ₱${item.price.toFixed(2)} x ${item.quantity}</p>
      <button class="remove-btn" data-index="${index}">Remove</button>
    `;
    cartItemsContainer.appendChild(itemElement);

    total += item.price * item.quantity;
  });

  cartTotal = total;
  cartTotalDisplay.textContent = `Total: ₱${total.toFixed(2)}`;
}


// Add to cart with quantity tracking
function addToCart(item) {
  const existingItem = cart.find(cartItem => cartItem.name === item.name);
  if (existingItem) {
    existingItem.quantity += 1; // Increase quantity if item exists
  } else {
    cart.push({ ...item, quantity: 1 }); // Add new item to cart with quantity 1
  }
  updateCartCount();
  displayCartItems();
}

// Remove item from cart
function removeFromCart(index) {
  cart.splice(index, 1);  // Remove the item from the cart array at the given index
  displayCartItems();  // Update the cart display after removal
}

// Attach event listeners for add-to-cart buttons
document.querySelectorAll('.add-to-cart-button').forEach(button => {
  button.addEventListener('click', () => {
    const item = {
      name: button.dataset.name,
      price: parseFloat(button.dataset.price),
      imageSrc: button.dataset.imageSrc,
    };
    addToCart(item);
  });
});

// Attach event listener for the remove buttons
document.getElementById('cart-items').addEventListener('click', (event) => {
  if (event.target.classList.contains('remove-btn')) {
    const index = event.target.getAttribute('data-index');
    removeFromCart(index);
  }
});

function updateCartCount() {
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById('cart-count').textContent = cartCount;
}

// Checkout and buyer info handling
function checkout() {
  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }
  document.getElementById('cart-modal').style.display = 'none';
  document.getElementById('buyer-info-modal').style.display = 'flex';
}

document.getElementById('buyer-info-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const buyerName = document.getElementById('buyer-name').value;
  const pickupDatetime = document.getElementById('pickup-datetime').value;

  document.getElementById('buyer-info-modal').style.display = 'none';
  generateBill(buyerName, pickupDatetime);
});

function backToCart() {
  document.getElementById('buyer-info-modal').style.display = 'none';
  document.getElementById('cart-modal').style.display = 'flex';
}

function generateBill(buyerName, pickupDatetime) {
  // Display buyer's name and pickup datetime
  document.getElementById('bill-name').textContent = `Name: ${buyerName}`;
  document.getElementById('bill-datetime').textContent = `Pick-up Date and Time: ${new Date(pickupDatetime).toLocaleString()}`;

  // Get the Bill Items section
  const billItemsContainer = document.getElementById('bill-items');
  billItemsContainer.innerHTML = ''; // Clear previous bill items

  let total = 0;

  // Loop through the cart items and create a list in the bill
  cart.forEach(item => {
    const itemElement = document.createElement('div');
    itemElement.classList.add('bill-item');
    itemElement.innerHTML = `
      <p>${item.name} - ₱${item.price.toFixed(2)} x ${item.quantity} = ₱${(item.price * item.quantity).toFixed(2)}</p>
    `;
    billItemsContainer.appendChild(itemElement);
    total += item.price * item.quantity;
  });

  // Display total price in the bill
  document.getElementById('bill-total').textContent = `Total: ₱${total.toFixed(2)}`;

  // Show the Bill Modal
  document.getElementById('bill-container').style.display = 'flex';
}

function closeBill() {
  // Hide the bill container
  document.getElementById('bill-container').style.display = 'none';

  // Show a thank you message or any other relevant action
  alert('Thank you for your purchase!');

  // Clear the cart
  cart = [];
  cartTotal = 0;

  // Update the cart count to 0
  updateCartCount();

  // Clear customer information in the form and bill
  document.getElementById('buyer-name').value = ''; // Reset the buyer name input
  document.getElementById('pickup-datetime').value = ''; // Reset the pickup datetime input

  // Optionally clear any displayed buyer information from the bill
  document.getElementById('bill-name').textContent = '';
  document.getElementById('bill-datetime').textContent = '';
  document.getElementById('bill-total').textContent = '';

  // Any other necessary resets or actions can be added here
}
//admin

function saveBillToLocalStorage(buyerName, pickupDatetime, items, total) {
  // Retrieve existing bills or create an empty array
  const bills = JSON.parse(localStorage.getItem('bills')) || [];
  bills.push({
    buyerName,
    pickupDatetime: new Date(pickupDatetime).toLocaleString(),
    items,
    total,
  });

  // Save updated bills back to localStorage
  localStorage.setItem('bills', JSON.stringify(bills));
}

// Modify generateBill() to save bill to localStorage
function generateBill(buyerName, pickupDatetime) {
  const billItemsContainer = document.getElementById('bill-items');
  billItemsContainer.innerHTML = ''; // Clear previous bill items

  let total = 0;
  const billItems = [];

  cart.forEach(item => {
    billItems.push({ name: item.name, price: item.price, quantity: item.quantity });
    const itemElement = document.createElement('div');
    itemElement.classList.add('bill-item');
    itemElement.innerHTML = `
      <p>${item.name} - ₱${item.price.toFixed(2)} x ${item.quantity} = ₱${(item.price * item.quantity).toFixed(2)}</p>
    `;
    billItemsContainer.appendChild(itemElement);
    total += item.price * item.quantity;
  });

  // Save the bill to localStorage
  saveBillToLocalStorage(buyerName, pickupDatetime, billItems, total);

  // Display the bill
  document.getElementById('bill-name').textContent = `Name: ${buyerName}`;
  document.getElementById('bill-datetime').textContent = `Pick-up Date and Time: ${new Date(pickupDatetime).toLocaleString()}`;
  document.getElementById('bill-total').textContent = `Total: ₱${total.toFixed(2)}`;
  document.getElementById('bill-container').style.display = 'flex';
}






