import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField, 
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart from "./Cart";
// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 *
 * @property {string} name - The name or title of the product


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [productNotFound, setProductNotFound] = useState(false);
  const [debounceTimerId, setDebounceTimerId] = useState(null);
  const [cartProducts, setCartProducts] = useState([]);
  const [token, setToken] = useState("");

  useEffect(async () => {
    performAPICall();
    // const token =
    //   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJsdWVwZWFybCIsImlhdCI6MTY5NDEwMjg0OCwiZXhwIjoxNjk0MTI0NDQ4fQ.gtM2rUtNxcZXQ05Qb_DAA6PcvXgsWefS_G7sEP8Sfdc";
    const token = await localStorage.getItem("token");
    if (token) {
      fetchCart(token);
      setToken(token);
    }
    // console.log("prducts: ", products);
  }, []);

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */

  const performAPICall = async () => {
    try {
      let products = await axios.get(`${config.endpoint}/products`);
      console.log("first api call");
      setProducts(products.data);
      return products.data;
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status === 500) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    let value = "";
    if (text) {
      value = `/search?value=${text}`;
    } else {
      value = "";
    }
    //api call
    try {
      let products = await axios.get(`${config.endpoint}/products${value}`);
      // console.log("api call to search: ",value);
      setProducts(products.data);
      setProductNotFound(false);
      return products.data;
    } catch (error) {
      console.log(error.responser);
      if (error.response && error.response.status === 404) {
        // console.log("No products found")
        setProductNotFound(true);
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    clearTimeout(debounceTimeout);
    let timerId = setTimeout(() => {
      performSearch(event.target.value);
    }, 500);
    setDebounceTimerId(timerId);
  };

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data

      const configuration = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // console.log(config.endpoint);
      const products = await axios.get(
        `${config.endpoint}/cart`,
        configuration
      );
      // console.log("Cart products from product page: ", products.data);
      setCartProducts(products.data);
      return products.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  // fetchCart("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImJsdWVwZWFybCIsImlhdCI6MTY5NDAwNzQ1OSwiZXhwIjoxNjk0MDI5MDU5fQ.y8uZ2Ai4COaL_lXe-URw19XYnarFO3lZj88YoMIwghY")

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    return items.find((item) => item.productId === productId);
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options 
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */

  const addToCart = async (
    token,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    //to check if user is logged in or not
    if (!token) {
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "warning",
      });
      return;
    }

    const presentInCart = isItemInCart(items, productId);

    const apiCall = async () => {
      try {
        const configuration = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const body = {
          productId,
          qty,
        };

        // Make a POST request to add the item to the cart
        const response = await axios.post(
          `${config.endpoint}/cart`,
          body,
          configuration
        );

        // If the request is successful, update the cart products state
        if (response.status === 200) {
          // console.log("response.data :", response.data);
          setCartProducts(response.data);
        } else {
          // Handle any error conditions here
          console.error("Failed to add item to cart:", response);
          // You can display an error message to the user if needed.
        }
      } catch (error) {
        console.error("Error adding item to cart:", error);
        // Handle any network or unexpected errors here
        // You can display an error message to the user if needed.
      }
    };

    ////////////////////////////////////////////////////////////////////////////////////

    if (!presentInCart && options.preventDuplicate) {
      apiCall();
    } //to handle if product is already present in cart
    else if (presentInCart && options.preventDuplicate) {
      enqueueSnackbar(
        "Item already in cart. Use the cart sidebar to update quantity or remove item.",
        { variant: "warning" }
      );
    }
    else if(presentInCart){
      apiCall();
    }

  };

  return (
    <div>
      <Header>
        {/* TODO: CRIO_TASK_MODULE_PRODUCTS - Display search bar in the header for Products page */}
        <TextField
          className="search-desktop"
          size="small"
          InputProps={{
            style: { width: "150%" },
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(event) => {
            debounceSearch(event, debounceTimerId);
          }}
        />
      </Header>

      {/* Search view for mobiles */}
      <TextField
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
        onChange={(event) => {
          // console.log(event.target.value)
          debounceSearch(event, debounceTimerId);
        }}
      />
      {/* login cart rendering logic start  */}
      <Grid
        container
        className="product-hero-cart-grid"
        spacing={2}
        my={1}
        // p={1}
      >
        <Grid item xs={12} md={token && products.length ? 8 : 12}>
          {/* {" "} */}
          {/* product and hero column */}
          {/* Hero Section */}
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your doorstep
            </p>
          </Box>
          {/* Product Screen */}
          {loading ? (
            <Box className="loading">
              <CircularProgress />
              Loading Products
            </Box>
          ) : productNotFound ? (
            <Box className="product-not-found">
              <SentimentDissatisfied />
              No products found
            </Box>
          ) : (
            <Grid container spacing={2} my={1} p={1}>
              {products.map((product) => (
                <ProductCard
                  product={{
                    ...product,
                  }}
                  key={product._id}
                  handleAddToCart={() => {
                    // console.log("token: ", token)
                    // console.log("cartProducts: ", cartProducts)
                    // console.log("products: ", products)
                    // console.log("product._id: ", product._id)
                    addToCart(token, cartProducts, products, product._id, 1, {
                      preventDuplicate: true,
                    });
                  }}
                />
              ))}
            </Grid>
          )}
        </Grid>

        {/* Cart */}
        {token ? (
          <Grid item xs={12} md={4} style={{ marginTop: "0px" }}>
            <Cart
              // isReadOnly={false}
              products={products}
              items={cartProducts}
              token={token}
              handleQuantity={addToCart}
            />
          </Grid>
        ) : null}
      </Grid>
      {/* login cart rendering logic end   */}
      <Footer />
    </div>
  );
};

export default Products;
