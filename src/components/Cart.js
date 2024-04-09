import { FlashOffOutlined } from "@mui/icons-material";
import {
  AddOutlined,
  RemoveOutlined,
  ShoppingCart,
  ShoppingCartOutlined, 
} from "@mui/icons-material";
import { fabClasses } from "@mui/material";
import { Button, IconButton, Stack } from "@mui/material";
import { Box } from "@mui/system";
import React from "react";
import { useHistory } from "react-router-dom";
import "./Cart.css"; 

// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 *
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} productId - Unique ID for the product
 */

/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { Array.<{ productId: String, qty: Number }> } cartData
 *    Array of objects with productId and quantity of products in cart
 *
 * @param { Array.<Product> } productsData
 *    Array of objects with complete data on all available products
 *
 * @returns { Array.<CartItem> }
 *    Array of objects with complete data on products in cart
 *
 */
export const generateCartItemsFrom = (cartData, productsData) => {
  // Check if cartData is an array
  if (!Array.isArray(cartData)) {
    console.error("Cart data is not an array:", cartData);
    return []; // Return an empty array or handle the error as needed
  }

  const productArray = cartData.map((cartProd) => {
    const product = productsData.find((arrProd) => {
      return arrProd._id === cartProd.productId;
    });

    if (product) {
      return { ...product, qty: cartProd.qty };
    }
    return null;
  });

  // console.log("cartData:  ",cartData)
  // console.log("productsData:  ",productsData)
  // console.log("productArray from cart.js: ",productArray)
  return productArray;
};

/**
 * Get the total value of all products added to the cart
 *
 * @param { Array.<CartItem> } items
 *    Array of objects with complete data on products added to the cart
 *
 * @returns { Number }
 *    Value of all items in the cart
 *
 */
export const getTotalCartValue = (items = []) => {
  const cartValue = items.reduce((total, prod) => {
    return total + prod.cost * prod.qty;
  }, 0);
  return cartValue;
};


// TODO: CRIO_TASK_MODULE_CHECKOUT - Implement function to return total cart quantity
/**
 * Return the sum of quantities of all products added to the cart
 *
 * @param { Array.<CartItem> } items
 *    Array of objects with complete data on products in cart
 *
 * @returns { Number }
 *    Total quantity of products added to the cart
 *
 */
export const getTotalItems = (items = []) => {
  const quantity = items.reduce((total,nextItem)=>{
    return total+nextItem.qty
  },0)
  return quantity;
};


// TODO: CRIO_TASK_MODULE_CHECKOUT - Add static quantity view for Checkout page cart
/**
 * Component to display the current quantity for a product and + and - buttons to update product quantity on cart
 * 
 * @param {Number} value
 *    Current quantity of product in cart
 * 
 * @param {Function} handleAdd
 *    Handler function which adds 1 more of a product to cart
 * 
 * @param {Function} handleDelete
 *    Handler function which reduces the quantity of a product in cart by 1
 * 
 * @param {Boolean} isReadOnly
 *    If product quantity on cart is to be displayed as read only without the + - options to change quantity
 * 
 */
const ItemQuantity = ({
  value,
  handleAdd,
  handleDelete,
}) => {
  return (
    <Stack direction="row" alignItems="center">
      {handleAdd && <IconButton size="small" color="primary" onClick={handleDelete}>
        <RemoveOutlined />
      </IconButton>}
      <Box padding="0.5rem" data-testid="item-qty">
        {value}
      </Box>
      {handleDelete && <IconButton size="small" color="primary" onClick={handleAdd}>
        <AddOutlined />
      </IconButton>}
    </Stack>
  );
};


/**
 * Component to display the Cart view
 *
 * @param { Array.<Product> } products
 *    Array of objects with complete data of all available products
 *
 * @param { Array.<Product> } items
 *    Array of objects with complete data on products in cart
 *
 * @param {Function} handleDelete
 *    Current quantity of product in cart
 *
 *
 */
const Cart = ({ products, items = [],token, handleQuantity ,isReadOnly=false}) => {

  //to use routes
  let history = useHistory();

  const cartItems = generateCartItemsFrom(items, products);


  // console.log("items: ", items);
  // console.log("products: ", products);
  // console.log("cartItems: ", cartItems);

  if (!items.length) {
    return (
      <Box className="cart empty">
        <ShoppingCartOutlined className="empty-cart-icon" />
        <Box color="#aaa" textAlign="center">
          Cart is empty. Add more items to the cart to checkout.
        </Box>
      </Box>
    );
  }

  return (
    <>
      <Box className="cart">
        {/* TODO: CRIO_TASK_MODULE_CART - Display view for each cart item with non-zero quantity */}
        {cartItems.map((item) => {
          return (
            <Box
              display="flex"
              alignItems="flex-start"
              padding="1rem"
              key={item._id}
            >
              <Box className="image-container">
                <img
                  // Add product image
                  src={item.image}
                  // Add product name as alt eext
                  alt={item.name}
                  width="100%"
                  height="100%"
                />
              </Box>
              <Box
                display="flex"
                flexDirection="column"
                justifyContent="space-between"
                height="6rem"
                paddingX="1rem"
              >
                <div>{item.name}</div>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                {isReadOnly? <><p>Qty:</p><ItemQuantity
                  value={item.qty}
                  // handleAdd={() => handleQuantity(token, items, products, item._id, item.qty+1)}
                  // handleDelete={() => handleQuantity(token, items, products, item._id, item.qty-1)}
                /></>:
                <ItemQuantity
                  value={item.qty}
                  handleAdd={() => handleQuantity(token, items, products, item._id, item.qty+1)}
                  handleDelete={() => handleQuantity(token, items, products, item._id, item.qty-1)}
                />
                }
                  <Box padding="0.5rem" fontWeight="700">
                    ${item.cost}
                  </Box>
                </Box>
              </Box>
            </Box>
          );
        })}

        <Box
          padding="1rem"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box color="#3C3C3C" alignSelf="center">
            Order total
          </Box>
          <Box
            color="#3C3C3C"
            fontWeight="700"
            fontSize="1.5rem"
            alignSelf="center"
            data-testid="cart-total"
          >
            ${getTotalCartValue(cartItems)}
          </Box>
        </Box>

        <Box display="flex" justifyContent="flex-end" className="cart-footer">
          {isReadOnly || <Button
                            color="primary"
                            variant="contained"
                            startIcon={<ShoppingCart />}
                            className="checkout-btn"
                            onClick={()=>{
                              history.push('/checkout')
                            }}
                          >
                            Checkout
                          </Button>}
        </Box>
      </Box>
    </>
  );
};

export default Cart;
