import express from "express";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());
const PORT = 3000;

/* ----------------------------
   IN-MEMORY "DATABASE"
-----------------------------*/

// Users
let users = [
  { id: 1, username: "jenn", password: "1234", fname: "Jenny", lname: "User" }
];

// Titles with associated tasks
let titles = []; 
let lists = [];

/* ------------------------------------
   1️⃣  USER LOGIN
-------------------------------------*/
app.post("/check-user", (req, res) => {
  const { username, password } = req.body;

  const exist = users.some(
    (u) => u.username === username && u.password === password
  );

  res.json({ exist });
});

/* ------------------------------------
   2️⃣  USER REGISTER
-------------------------------------*/
app.post("/register", (req, res) => {
  const { username, password, fname, lname } = req.body;

  if (users.some((u) => u.username === username)) {
    return res.json({ success: false, message: "Username already exists" });
  }

  users.push({
    id: Date.now(),
    username,
    password,
    fname,
    lname,
  });

  res.json({ success: true });
});

/* ------------------------------------
   3️⃣  GET TITLES
-------------------------------------*/
app.get("/get-titles", (req, res) => {
  const formatted = titles.map((t) => ({ id: t.id, title: t.title }));
  res.json({ titles: formatted });
});

/* ------------------------------------
   4️⃣  UPDATE TASK STATUS
-------------------------------------*/
app.put("/update-task-status/:taskId", (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;

  const task = lists.find((l) => l.id == taskId);
  if (!task) return res.status(404).json({ success: false, message: "Task not found" });

  task.status = status;
  res.json({ success: true, updatedTask: task });
});

/* ------------------------------------
   5️⃣  GET LIST ITEMS FOR A TITLE
-------------------------------------*/
app.get("/get-lists/:titleId", (req, res) => {
  const { titleId } = req.params;

  const filtered = lists
    .filter((l) => l.title_id == titleId)
    .map((l) => ({
      id: l.id,
      list_desc: l.list_desc,
      status: l.status,
    }));

  res.json({ success: true, lists: filtered });
});

/* ------------------------------------
   6️⃣  ADD TO-DO (TITLE + MULTIPLE TASKS)
-------------------------------------*/
app.post("/add-to-do", (req, res) => {
  const { username, title, lists: newLists } = req.body;

  const titleId = Date.now();
  const date_modified = new Date().toISOString().split("T")[0];

  titles.push({
    id: titleId,
    username,
    title,
    date_modified,
    status: "false",
  });

  for (const desc of newLists[0].list_desc) {
    lists.push({
      id: Date.now() + Math.random(),
      title_id: titleId,
      list_desc: desc,
      status: "false",
    });
  }

  res.json({ success: true, message: "Successfully Added" });
});

/* ------------------------------------
   7️⃣  UPDATE TITLE
-------------------------------------*/
app.put("/update-title/:titleId", (req, res) => {
  const { titleId } = req.params;
  const { title } = req.body;

  const item = titles.find((t) => t.id == titleId);
  if (!item)
    return res.status(404).json({ success: false, message: "Title not found" });

  item.title = title;

  res.json({ success: true, updatedTitle: item });
});

/* ------------------------------------
   8️⃣  UPDATE LIST ITEM
-------------------------------------*/
app.put("/update-list/:listId", (req, res) => {
  const { listId } = req.params;
  const { list_desc } = req.body;

  const item = lists.find((l) => l.id == listId);
  if (!item)
    return res.status(404).json({ success: false, message: "List item not found" });

  item.list_desc = list_desc;

  res.json({ success: true, updatedList: item });
});

/* ------------------------------------
   9️⃣  DELETE TITLE + ASSOCIATED LISTS
-------------------------------------*/
app.delete("/delete-title/:titleId", (req, res) => {
  const { titleId } = req.params;

  titles = titles.filter((t) => t.id != titleId);
  lists = lists.filter((l) => l.title_id != titleId);

  res.json({ success: true, message: "Deleted title and related lists" });
});

/* ------------------------------------
   🔟  DELETE SINGLE LIST ITEM
-------------------------------------*/
app.delete("/delete-list/:listId", (req, res) => {
  const { listId } = req.params;

  const before = lists.length;
  lists = lists.filter((l) => l.id != listId);

  if (before === lists.length)
    return res.status(404).json({ success: false, message: "List item not found" });

  res.json({ success: true, message: "List item deleted" });
});

/* ------------------------------------
   SERVER START
-------------------------------------*/
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
