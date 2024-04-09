import { CreditCard, Delete } from "@mui/icons-material";
import {
  Button,
  Divider, 
  Grid,  
  Stack,
  TextField,
  Typography, 
} from "@mui/material";
import { Box } from "@mui/system"; 
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useHistory,Redirect } from "react-router-dom";
import { config } from "../App";
import Cart, {
  getTotalCartValue,
  generateCartItemsFrom,
  getTotalItems,
} from "./Cart";
import "./Checkout.css";
import Footer from "./Footer";
import Header from "./Header";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import classnames from 'classnames';


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
 * @typedef {Object} Address - Data on added address
 *
 * @property {string} _id - Unique ID for the address
 * @property {string} address - Full address string
 */

/**
 * @typedef {Object} Addresses - Data on all added addresses
 *
 * @property {Array.<Address>} all - Data on all added addresses
 * @property {string} selected - Id of the currently selected address
 */

/**
 * @typedef {Object} NewAddress - Data on the new address being typed
 *
 * @property { Boolean } isAddingNewAddress - If a new address is being added
 * @property { String} value - Latest value of the address being typed
 */

// TODO: CRIO_TASK_MODULE_CHECKOUT - Should allow to type a new address in the text field and add the new address or cancel adding new address
/**
 * Returns the complete data on all products in cartData by searching in productsData
 *
 * @param { String } token
 *    Login token
 *
 * @param { NewAddress } newAddress
 *    Data on new address being added
 *
 * @param { Function } handleNewAddress
 *    Handler function to set the new address field to the latest typed value
 *
 * @param { Function } addAddress
 *    Handler function to make an API call to add the new address
 *
 * @returns { JSX.Element }
 *    JSX for the Add new address view
 *
 */
const AddNewAddressView = ({
  token,
  newAddress,
  handleNewAddress,
  addAddress,
}) => {
  return (
    <Box display="flex" flexDirection="column">
      <TextField
        multiline
        minRows={4}
        placeholder="Enter your complete address"
        value={newAddress.value}
        onChange={(e)=>{
          handleNewAddress({
            isAddingNewAddress: true,
            value:e.target.value
          });
        }}
      />
      <Stack direction="row" my="1rem">
        <Button variant="contained"  onClick={(e)=>{
          handleNewAddress(() => ({
            ...newAddress,
            isAddingNewAddress: false
            }));
            addAddress(token, newAddress)
            // console.log("newAddress: ",newAddress);

        }}>Add</Button>
        <Button variant="text" onClick={()=>{
            handleNewAddress(() => ({
              isAddingNewAddress: false,
              value:""
            }));
        }}>Cancel</Button>
      </Stack>
    </Box>
  );
};

const Checkout = () => {
  const token = localStorage.getItem("token");
  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [addresses, setAddresses] = useState({ all: [], selected: "" });
  const [newAddress, setNewAddress] = useState({
    isAddingNewAddress: false,
    value: "",
  });
  const [balance, setBalance] = useState(0);

  //get new address view



  // Fetch the entire products list
  const getProducts = async () => {
    try {
      const response = await axios.get(`${config.endpoint}/products`);

      // console.log("items from checkout: ", items);
      setProducts(response.data);
      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 500) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        return null;
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // Fetch cart data
  const fetchCart = async (token) => {
    if (!token) return;
    try {
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log("items response.data: ",response.data);
      setItems(response.data);
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  /**
   * Fetch list of addresses for a user
   *
   * API Endpoint - "GET /user/addresses"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
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
  const getAddresses = async (token) => {
    if (!token) return;

    try {
      const response = await axios.get(`${config.endpoint}/user/addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAddresses({ ...addresses, all: response.data });
      // console.log("addresses :",addresses);
      // console.log("response.data :",response.data);
      return response.data;
    } catch {
      enqueueSnackbar(
        "Could not fetch addresses. Check that the backend is running, reachable and returns valid JSON.",
        {
          variant: "error",
        }
      );
      return null;
    }
  };

  /**
   * Handler function to add a new address and display the latest list of addresses
   *
   * @param { String } token
   *    Login token
   *
   * @param { NewAddress } newAddress
   *    Data on new address being added
   *
   * @returns { Array.<Address> }
   *    Latest list of addresses
   *
   * API Endpoint - "POST /user/addresses"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
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
  const addAddress = async (token, newAddress) => {
    try {
      // TODO: CRIO_TASK_MODULE_CHECKOUT - Add new address to the backend and display the latest list of addresses
      // console.log("inside the add address function")
      // console.log("token: ",token)
      // console.log("newAddress: ",newAddress)
      const response = await axios.post(`${config.endpoint}/user/addresses`,
       {
        "address":newAddress.value
      },{
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setAddresses({
        ...addresses,
        all:response.data});

      // { all: [], selected: "" }

    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not add this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  /**
   * Handler function to delete an address from the backend and display the latest list of addresses
   *
   * @param { String } token
   *    Login token
   *
   * @param { String } addressId
   *    Id value of the address to be deleted
   *
   * @returns { Array.<Address> }
   *    Latest list of addresses
   *
   * API Endpoint - "DELETE /user/addresses/:addressId"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "_id": "",
   *          "address": "Test address\n12th street, Mumbai"
   *      },
   *      {
   *          "_id": "BW0jAAeDJmlZCF8i",
   *          "address": "New address \nKolam lane, Chennai"
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
  const deleteAddress = async (token, addressId) => {
    try {
      // TODO: CRIO_TASK_MODULE_CHECKOUT - Delete selected address from the backend and display the latest list of addresses
      console.log("inside deleteAddress function",token, addressId);
   
      // console.log("inside the add address function")
      // console.log("token: ",token)
      // console.log("addressId: ",addressId)
      console.log("addresses: ",addresses);
      const response = await axios.delete(`${config.endpoint}/user/addresses/${addressId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
      setAddresses({
        ...addresses,
        all:response.data});
        console.log("response.data: ",response.data);
       console.log("addresses after delete: ",addresses);



    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not delete this address. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT - Validate request for checkout
  /**
   * Return if the request validation passed. If it fails, display appropriate warning message.
   *
   * Validation checks - show warning message with given text if any of these validation fails
   *
   *  1. Not enough balance available to checkout cart items
   *    "You do not have enough balance in your wallet for this purchase"
   *
   *  2. No addresses added for user
   *    "Please add a new address before proceeding."
   *
   *  3. No address selected for checkout
   *    "Please select one shipping address to proceed."
   *
   * @param { Array.<CartItem> } items
   *    Array of objects with complete data on products added to the cart
   *
   * @param { Addresses } addresses
   *    Contains data on array of addresses and selected address id
   *
   * @returns { Boolean }
   *    Whether validation passed or not
   *
   */
  const validateRequest = (items, addresses) => {
    console.log("inside validateRequest function.")
    // console.log("items: ",items)
    // console.log("addresses: ",addresses)
    const cartItems = generateCartItemsFrom(items,products);
    const cartValue = getTotalCartValue(cartItems);
    const walletBalance = localStorage.getItem("balance");

    // console.log("cartItems: ",cartItems)
    // console.log("cartValue: ",cartValue)

    //checks for validation.
    //  1. Not enough balance available to checkout cart items
    //    "You do not have enough balance in your wallet for this purchase"
    // const walletBalance = localStorage.getItem("balance");

    if(cartValue>walletBalance){
      enqueueSnackbar("You do not have enough balance in your wallet for this purchase", {variant:'warning'})
      return false;
    }
    //  2. No addresses added for user
    //    "Please add a new address before proceeding."
    if(addresses.all.length===0){
      enqueueSnackbar("Please add a new address before proceeding.", {variant:'warning'})
      return false;
    }
  
    //  3. No address selected for checkout
    //    "Please select one shipping address to proceed."
    const selectedAddress = addresses.selected;

    if(!selectedAddress){
      enqueueSnackbar("Please select one shipping address to proceed.", {variant:'warning'})
      return false;
    }
    return true;

  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT
  /**
   * Handler function to perform checkout operation for items added to the cart for the selected address
   *
   * @param { String } token
   *    Login token
   *
   * @param { Array.<CartItem } items
   *    Array of objects with complete data on products added to the cart
   *
   * @param { Addresses } addresses
   *    Contains data on array of addresses and selected address id
   *
   * @returns { Boolean }
   *    If checkout operation was successful
   *
   * API endpoint - "POST /cart/checkout"
   *
   * Example for successful response from backend:
   * HTTP 200
   * {
   *  "success": true
   * }
   *
   * Example for failed response from backend:
   * HTTP 400
   * {
   *  "success": false,
   *  "message": "Wallet balance not sufficient to place order"
   * }
   *
   */
  const performCheckout = async (token, items, addresses) => {
    const valid = validateRequest(items,addresses);
    console.log(addresses)
    if(valid){
      try{
        const payload = {"addressId":addresses.selected}
        const configuration = {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
        // console.log("config.endpoint: ",config.endpoint);
        const response = await axios.post(`${config.endpoint}/cart/checkout`,payload,configuration);

        console.log("response.data.success: ",response.data.success);
        // if successful then redirect to thanks page
        if(response.data.success){
          const cartItems = generateCartItemsFrom(items,products);
          const cartValue = getTotalCartValue(cartItems);
          const walletBalance = localStorage.getItem("balance");
          const walletBalanceNew = localStorage.setItem("balance",walletBalance-cartValue);
          history.push('/thanks')
        }
        
      }catch(e){
        console.log(e);
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_CHECKOUT - Fetch addressses if logged in, otherwise show info message and redirect to Products page

  // Fetch products and cart data on page load
  useEffect(() => {
    const onLoadHandler = async () => {
      const productsData = await getProducts();

      const cartData = await fetchCart(token);

      const addressData = await getAddresses(token);
      if (addressData) {
        // console.log("addresses :",addresses);
        setAddresses({...addresses, all: [...addressData]});
        // { all: [], selected: "" }
        // console.log("addressData:",addressData);
      }

      if (productsData && cartData) {
        const cartDetails = await generateCartItemsFrom(cartData, productsData);
        // console.log("selectedItemIndex: ",selectedItemIndex);
        // setItems(cartDetails);
      }
    };
    onLoadHandler();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if(!token){
    
    return (
      <Redirect
        to={{
          pathname: "/login",
          state: { message: "You must be logged in to access the checkout page" },
        }}
      />
    );
  }
  return (
    <>
      <Header />
      <Grid container>
        <Grid item xs={12} md={9}>
          <Box className="shipping-container" minHeight="100vh">
            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Shipping
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Manage all the shipping addresses you want. This way you won't
              have to enter the shipping address manually with every order.
              Select the address you want to get your order delivered.
            </Typography>
            <Divider />
            <Box>
              {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Display list of addresses and corresponding "Delete" buttons, if present, of which 1 can be selected */}
              <Stack>
                <List>
                {addresses.all.length ? (
                  addresses.all.map((item,index) => {
                    
                    return (
                      <ListItem
                      key={index}
                      className={classnames('address-item', {
                        'selected': addresses.selected === item._id,
                        'not-selected': addresses.selected !== item._id,
                      })}
                      // button // Make the entire ListItem clickable
                      // name="/add/i"
                      sx={{ border: "1px solid #ccc",
                       borderRadius: "5px",
                        marginBottom: "5px"
                      
                      }}
                      onClick={()=>{setAddresses ({all:[...addresses.all],selected:item._id})}}
                    >
                      <ListItemText primary={item.address} />
                      <ListItemSecondaryAction>
                        <Button
                          variant="text"
                          onClick={() => deleteAddress(token,item._id)}
                          startIcon={<Delete />}
                        >
                          Delete
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                    );
                  })
                ) : (
                  <Typography my="1rem">
                    No addresses found for this account. Please add one to
                    proceed
                  </Typography>
                )}
                </List>
              </Stack>
            </Box>

            {/* TODO: CRIO_TASK_MODULE_CHECKOUT - Dislay either "Add new address" button or the <AddNewAddressView> component to edit the currently selected address */}
            {!newAddress.isAddingNewAddress? <Button
              color="primary"
              variant="contained"
              id="add-new-btn"
              size="large"
              name="add new address"
              onClick={() => {
                setNewAddress((currNewAddress) => ({
                  ...currNewAddress,
                  isAddingNewAddress: true,
                }));
              }}
            >
              Add new address
            </Button>:
            <AddNewAddressView
              token={token}
              newAddress={newAddress}
              handleNewAddress={setNewAddress}
              addAddress={addAddress}
            />}

            <Typography color="#3C3C3C" variant="h4" my="1rem">
              Payment
            </Typography>
            <Typography color="#3C3C3C" my="1rem">
              Payment Method
            </Typography>
            <Divider />

            <Box my="1rem">
              <Typography>Wallet</Typography>
              <Typography>
                Pay ${getTotalCartValue(generateCartItemsFrom(items, products))}{" "}
                of available ${localStorage.getItem("balance")}
              </Typography>
            </Box>

            <Button 
            startIcon={<CreditCard />} 
            variant="contained"
            onClick={()=>{
              performCheckout(token,items,addresses)
            }}>
              PLACE ORDER
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={3} bgcolor="#E9F5E1">
          <Stack>
            <Box sx={{ minWidth: 275, margin: "8px" }}>
              <Cart
                isReadOnly
                products={products}
                items={items}
                token={token}
              />
            </Box>
            {/* product details card  */}
            <Box
              sx={{ minWidth: 275, margin: "8px", backgroundColor: "#f0f0f0" }}
            >
              <Card variant="outlined">
                <CardContent>
                  <Typography
                    sx={{ fontSize: 30, fontWeight: "bold" }}
                    gutterBottom
                  >
                    Order Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="h6">Products:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>{getTotalItems(items)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>Subtotal:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>
                        $
                        {getTotalCartValue(
                          generateCartItemsFrom(items, products)
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>Shipping Charges:</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography>${0}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ fontWeight: "bold" }} variant="h6">
                        Total:
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography sx={{ fontWeight: "bold" }}>
                        $
                        {getTotalCartValue(
                          generateCartItemsFrom(items, products)
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Stack>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
};

export default Checkout;
