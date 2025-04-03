const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const CartGroup = require("../models/cartGroup");
const mongoose = require('mongoose');
const User = require("../models/user")
const CartItem=require('../models/cartItems')
const { getUserId } = require("../public/javascripts/getUserfunction");
const Membership = require("../models/membership")


const app = express();
const router = express.Router();

// Create HTTP server for Socket.io
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Socket.io connection
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

  


/* Create a new group */
router.post("/", async (req, res) => {
  console.log(req.headers)
  try {
    const userId = await getUserId(req)
    console.log(userId)
    if (!userId) { // Check if userId is valid
      return res.status(401).json({ message: "Unauthorized" }); // Or 403 Forbidden, depending on the scenario
    }
    const { groupName, description, groupImage } = req.body;
     
    const newGroup = new CartGroup({
      groupName,
      description,
      groupImage,
      members:[userId],
      cartItems: [],
    });

    await newGroup.save();
    await User.findByIdAndUpdate(userId, { $push: { groups: newGroup._id } });
    await Membership.create({ user: userId, group: newGroup._id, role: "admin" });
    io.emit("new group", newGroup); // Notify clients

    res.status(201).json({ message: "Group created successfully", newGroup });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/** 📜 Get all groups related to the logged-in user */
router.get("/", async (req, res) => {
    try {
       const userId = await getUserId(req) 
     
  
       const groups = await CartGroup.find({ members: userId }).populate("members cartItems");
       if(groups.length > 0){
        console.log(groups)
         res.status(200).json(groups);
       }else{
         res.status(200).json({ message: "No groups found" });
         console.log("no groups")
       }
    } catch (error) {
      res.status(500).json({ error: error.message});
    }
  });
  

router.get("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await CartGroup.findById(groupId).populate("members cartItems");

    if (!group) return res.status(404).json({ message: "Group not found" });

    res.status(200).json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*Update group details */
router.put("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const updatedData = req.body;

    const updatedGroup = await CartGroup.findByIdAndUpdate(groupId, updatedData, { new: true });

    if (!updatedGroup) return res.status(404).json({ message: "Group not found" });

    io.emit("update group", updatedGroup); // Notify clients

    res.status(200).json({ message: "Group updated successfully", updatedGroup });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Add a member to a group */
router.put("/:groupId/add-member/:userId", async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await CartGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
      await User.findByIdAndUpdate(userId, { $push: { groups: groupId } });
      await Membership.create({ user: userId, group: group._id});
      io.emit("update group", group); // Notify clients
    }

    res.status(200).json({ message: "Member added successfully", group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Remove a member from a group */
router.put("/:groupId/remove-member/:userId", async (req, res) => {
  try {
    const { groupId, userId } = req.params;

    const group = await CartGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.members = group.members.filter((member) => member.toString() !== userId);
    await group.save();
    await User.findByIdAndUpdate(userId, { $pull: { groups: groupId } });
    await Membership.deleteOne({ user: userId, group: group._id });

    io.emit("update group", group); // Notify clients

    res.status(200).json({ message: "Member removed successfully", group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Add a cart item to a group */
router.put("/:groupId/add-cart-item/:cartItemId", async (req, res) => {
  try {
    const { groupId, cartItemId } = req.params;

    const group = await CartGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.cartItems.includes(cartItemId)) {
      group.cartItems.push(cartItemId);
      await group.save();
      io.emit("update group", group); // Notify clients
    }

    res.status(200).json({ message: "Cart item added successfully", group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Remove a cart item from a group */
router.put("/:groupId/remove-cart-item/:cartItemId", async (req, res) => {
  try {
    const { groupId, cartItemId } = req.params;

    const group = await CartGroup.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    group.cartItems = group.cartItems.filter((item) => item.toString() !== cartItemId);
    await group.save();
    io.emit("update group", group); // Notify clients

    res.status(200).json({ message: "Cart item removed successfully", group });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* Delete a group */
router.delete("/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const deletedGroup = await CartGroup.findByIdAndDelete(groupId);

    if (!deletedGroup) return res.status(404).json({ message: "Group not found" });
     
    await User.updateMany({ groups: groupId }, { $pull: { groups: groupId } });
    await CartItem.deleteMany({ group: groupId });
    await Membership.deleteMany({ groups: groupId });
    io.emit("delete group", groupId); // Notify clients
    res.status(200).json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
