//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require('mongoose');
const app = express();
const _=require('lodash');


mongoose.connect('mongodb+srv://admin-shikhar:Shikhar1234@@cluster0.l8bqa.mongodb.net/todoListDB', {useNewUrlParser: true, useUnifiedTopology: true});

const itemsSchema={
  name:String
}

const Items=mongoose.model("Item",itemsSchema);

const item1=new Items({
  name:"Welcome to your todoList"
})

const item2=new Items({
  name:"This is my first project"
})


const item3=new Items({
  name:"<--click here to delete an item"
})

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items: [itemsSchema]
};


const List=mongoose.model("list",listSchema);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


app.get("/", function(req, res) {
  
Items.find({},function(err,foundItems){
  if(foundItems.length === 0)
  {
    Items.insertMany(defaultItems,function(err){
      if(err)
      console.log(err);
      else
      console.log("Successfully logged items to the database");
    });
    res.redirect("/");
  }
  else
  {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});
});


app.get("/:customListName",function(req,res)
{
  const customListName= _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err)
    {
      if(!foundList)
      {
      const list=new List({
        name:customListName,
        items:defaultItems
      });
    
      list.save();
      res.redirect("/"+customListName);
      }
      else
      {
      res.render("list",{listTitle:foundList.name,newListItems:foundList.items});
      }
    }
  })
  
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName= req.body.list;
  const item=new Items({
    name:itemName
  });
  
  if(listName==="Today")
  {
    item.save();
    res.redirect("/");
  }
  else{
      List.findOne({name:listName},function(err,foundList){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
    });
  }
});


app.post("/delete",function(req,res){
  const checkbox=req.body.checkbox;
  const listName=req.body.listName;


  if(listName==="Today")
  {
    Items.findByIdAndRemove(checkbox,function(err){
      if(err)
      console.log(err);
      else
      console.log("Successfully removed");
      res.redirect("/");
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkbox}}},function(err,foundList){
      if(!err)
      {
        res.redirect("/"+listName);
      }
    });
  }
  
})

let port=process.env.PORT;
if(port==null || port=="")
{
  port=3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});