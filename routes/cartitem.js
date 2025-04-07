const http = require("http");
const socketIO = require("socket.io");
var express = require('express');
const CartGroup = require("../models/cartGroup");
var router = express.Router();
const { getUserId } = require("../public/javascripts/getUserfunction");


const CartItem = require('../models/cartItems')

const app = express()
//connections to socket.io
const server=http.createServer(app)
const io=socketIO(server)

io.on('connection',(stream)=>{
    console.log('Client connected',stream.id)
    //Listening for incoming cart items
     stream.on('cart item',async (item)=>{
         console.log('Received item',item)
         try{
              //save item to the MongoDB
               const item=new CartItem({product:item.product,quantity:item.quantity,addedBy:item.addedBy,addedAt:item.addedAt})
               await item.save((err) => {
                  if (err) {
                    console.error('Error saving item to database:', err);
                  } else {
                    console.log('Item saved to the database');
                  }
                })
               
                // Broadcast the item to all connected users
                io.emit('new item', item);
               
         }catch (error){
            console.error('Error saving item to database:', error);
         }

     })

       //Listen for user disconnection
    stream.on('disconnect', () => {
    console.log('Client disconnected');
    });
})

/* Add a new cart item (REST API) */
router.post("/:groupId/addItem", async (req, res) => {
    try {
      const{groupId}=req.params;
      const {product,image,quantity,size,color,price} = req.body;
    
      const group = await CartGroup.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found" });

      const userId = await getUserId(req)
  
      const newItem = new CartItem({
        product,
        image,
        quantity,
        size,
        color,
        price,
        addedBy:[userId],
        group:[groupId],
        addedAt: new Date(),
      });
  
    
      await newItem.save();
      await CartGroup.findByIdAndUpdate(groupId, { $push: {  cartItems: newItem._id } });
      io.emit("new item", newItem); // Notify clients via WebSockets
      res.status(201).json({ message: "Item added successfully", newItem });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  /* Get all cart items */
  router.get("/:groupId", async (req, res) => {
    try {
      const{groupId}=req.params;
      const group = await CartGroup.findById(groupId);

      if (!group) return res.status(404).json({ message: "Group not found" });

      const items = await CartItem.find({group:groupId});
      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  /* Get a single cart item by ID */
  router.get("/:groupId/:itemId", async (req, res) => {
    try {
      const { itemId,groupId } = req.params;
      const group = await CartGroup.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found"})
      const item = await CartItem.findOne({ _id: itemId, group: group.id });
      if (!item) return res.status(404).json({ message: "Item not found"})
  
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  /*Update cart item */
  router.put("/:groupId/:itemId", async (req, res) => {
    try {
      const { itemId,groupId} = req.params;
      const group = await CartGroup.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found"})
      const updatedData = req.body;
  
      const updatedItem = await CartItem.findByIdAndUpdate({_id: itemId,group:group.id},updatedData, { new: true });
  
      if (!updatedItem) return res.status(404).json({ message: "Item not found" });
  
      io.emit("update item", updatedItem); // Notify clients
      res.status(200).json({ message: "Item updated successfully", updatedItem });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  /* Delete a cart item */
  router.delete("/:groupId/:itemId", async (req, res) => {
    try {
      const { itemId,groupId } = req.params;
      const group = await CartGroup.findById(groupId);
      if (!group) return res.status(404).json({ message: "Group not found"})
      const deletedItem = await CartItem.findByIdAndDelete({_id: itemId,group:group.id});
  
      if (!deletedItem) return res.status(404).json({ message: "Item not found" });

      await CartGroup.findByIdAndUpdate(groupId, { $push: {  cartItems: deletedItem._id } });
  
      io.emit("delete item", itemId); // Notify clients
      res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  module.exports = router;