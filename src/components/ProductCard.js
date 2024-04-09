import { AddShoppingCartOutlined } from "@mui/icons-material";
import { 
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";
import {Grid} from "@mui/material";
import StarIcon from '@mui/icons-material/Star';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const ProductCard = ({ product, handleAddToCart }) => {


  return (
      <Grid key={product.key} item xs={6} md={3}>
        {/* card start */}
        <Card className="card">
          <CardMedia
          component="img"
          // height="140"
          image={product.image}
          alt="random">
          </CardMedia>
          <CardContent>
          <Typography  component="div" color="text.secondary">
            {product.name}
          </Typography>
          <Typography  sx={{fontWeight: 'bold'}}>${product.cost}</Typography>
          <Rating
              name="text-feedback"
              value={product.rating}
              readOnly
              precision={0.5}
              emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
          </CardContent> 

          <CardActions className="card-actions">
            <Button className="card-button" variant="contained" startIcon={<AddShoppingCartIcon />} fullWidth
            onClick={(e)=>{handleAddToCart()}}>ADD TO CART</Button>
          </CardActions>
        </Card>
        {/* card end */}
      </Grid>
  );
};

export default ProductCard;
