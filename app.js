const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const uri = "mongodb+srv://admin-troy:Test123@cluster0.lkgusmh.mongodb.net/todolistDB";

// connect to the MongoDB server
mongoose.connect(uri, {
  useNewUrlParser: true
});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {



  // retrieve all the items from the database
  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      // insert the default items into the database
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success");

        }
      });

      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems
      })
    }


  });
});
// saving inputs from website in database and then at the bottom redirecting it so that it can show up on webapp

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });
// allows you to add iteams to the Custom To Do Lists
if (listName === "Today"){
  item.save();

  res.redirect("/");
} else{
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/" + listName);
  })
}





});


//delete route from list.ejs that allows you to delete items -- uses id to delete from database
app.post("/delete", function(req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

if(listName === "Today"){
  // how you delete items from db then redirect to / to whatever is left in Items
  Item.findByIdAndRemove(checkedItemID, function(err) {
    if (!err) {
      console.log("Successfully Deleted");
      res.redirect("/");
    }
  });
} else {

  List.findOneAndUpdate({name:listName}, {$pull:{items: {_id: checkedItemID}}}, function(err, foundList){
    if (!err){
      res.redirect("/" + listName);
    }
  })
}



})

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
      name: customListName
    }, function(err, foundList) {

      if (!err) {
        if (!foundList) {
          //create a new list
          const list = new List({

            name: customListName,
            items: defaultItems
          });
          list.save();
res.redirect("/" + customListName);
        } else {
          //show an existing list

          res.render("list", {
            listTitle: foundList.name,
            newListItems: foundList.items
          })

        }
      }



  })


});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
