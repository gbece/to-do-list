//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//const date = require(__dirname + "/date.js");

const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//mongoose.set('strictQuery', false); //if you want to prepare for this change.
mongoose.set('strictQuery', true); //Or use `mongoose.set('strictQuery', true);` to suppress this warning.
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const Item = mongoose.model("Item", itemsSchema);

const List = mongoose.model("List", listSchema);

const itemToday = new Item({
  name: "Brush my Teeth"
});

const itemToday2 = new Item({
  name: "Go to work."
});

const itemToday3 = new Item({
  name: "Have lunch."
});

const defaultItems = [itemToday, itemToday2, itemToday3];


app.get("/", function(req, res) {

  //const day = date.getDate();

  Item.find(function(err, foundItems) {
    if (err) {
      console.log(err);
    } else {

      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function(err) {
          if (err) {
            console.log(err);
          } else {
            console.log("Succesfully saved all the items to todolistDB");
          }
        });
        res.redirect("/");
      } else {
        res.render("list", {
          listTitle: "Today",
          newListItems: foundItems
        });
      }


    }
  });




});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const newItem = new Item({
    name: itemName
  });

  if (req.body.list === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name: req.body.list}, {$push: {items: newItem} }, function(err, foundList) {
      if (err) {
        console.log(error);
      } /*else {
        console.log(foundList);
      }*/
    });
    /*    //Another way to add the item to the list
    List.findOne( {name: req.body.list},function(err, foundList) {
      foundList.items.push();
      foundList.save();
    }
    */
    res.redirect("/" + req.body.list);
  }


});

app.post("/delete", function(req, res) {

  const listName=req.body.listName;

  console.log("Actual list: "+req.body.list);

  if(listName === "Today"){
    Item.findByIdAndRemove(req.body.checkbox, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted checked item.");
      }
    });
    res.redirect("/");
  }else{
    List.findOne( {name:listName},function(err, foundList) {
      if (!err) {
        console.log("Founded list: "+foundList.items);
        foundList.items.pull({_id:req.body.checkbox});
        foundList.save();
        res.redirect("/"+listName);
      }
    });
    /*   //Another way to delete the item from the list
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id:req.body.checkbox}} }, function(err, foundList) {
      if (!err) {
        res.redirect("/"+listName);
      }
    });*/
  }
});

app.get("/:customListName", function(req, res) {
  //const title = _.lowerCase(req.params.customListName);
  const customListName = _.capitalize(req.params.customListName);
  //const customListName = req.params.customListName;

  List.findOne({name: customListName}, function(err, foundItem) {
    if (!err){
      if(!foundItem){ // If the list doesnt exist
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save()
        res.redirect("/" + customListName);
      }else{
        res.render("list", {listTitle: customListName, newListItems: foundItem.items});
      }
    }
  });
});



app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
